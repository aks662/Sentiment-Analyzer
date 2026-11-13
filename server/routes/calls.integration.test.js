import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import pg from 'pg';

const { Pool } = pg;
const here = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(here, '..');
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test('calls API integrates validation, sentiment, history, and PostgreSQL', async (t) => {
  assert.ok(testDatabaseUrl, 'Set TEST_DATABASE_URL to a dedicated test database');
  const databaseName = new URL(testDatabaseUrl).pathname.replace(/^\//, '');
  assert.match(databaseName, /_test$/, 'Refusing to run integration tests outside a *_test database');
  if (process.env.DATABASE_URL) {
    assert.notEqual(testDatabaseUrl, process.env.DATABASE_URL, 'Test and application databases must differ');
  }

  const database = new Pool({ connectionString: testDatabaseUrl });
  const schema = await readFile(path.join(serverDir, 'schema.sql'), 'utf8');
  await database.query(schema);
  const baseline = (await database.query(
    `SELECT COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE sentiment = 'positive')::int AS positive,
       COUNT(*) FILTER (WHERE sentiment = 'neutral')::int AS neutral,
       COUNT(*) FILTER (WHERE sentiment = 'negative')::int AS negative
     FROM calls`,
  )).rows[0];

  const portServer = net.createServer();
  await new Promise((resolve, reject) => portServer.listen(0, '127.0.0.1', resolve).once('error', reject));
  const { port } = portServer.address();
  await new Promise((resolve) => portServer.close(resolve));

  const child = spawn(process.execPath, ['index.js'], {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: testDatabaseUrl, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let childOutput = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { childOutput += chunk; });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { childOutput += chunk; });
  const baseUrl = `http://127.0.0.1:${port}`;
  const createdIds = [];
  let assertionsCompleted = false;
  const marker = `api-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  async function waitForServer() {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`Backend exited early: ${childOutput}`);
      try {
        const response = await fetch(`${baseUrl}/api/health`);
        if (response.ok) return response;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Backend did not become ready: ${childOutput}`);
  }

  try {
    const health = await waitForServer();
    assert.deepEqual(await health.json(), { status: 'ok', express: 'running', database: 'connected' });

    for (const body of [
      {},
      { transcript: '', source: 'manual' },
      { transcript: '   ', source: 'manual' },
      { transcript: 123, source: 'manual' },
      { transcript: 'text' },
      { transcript: 'text', source: 'other' },
    ]) {
      const response = await fetch(`${baseUrl}/api/calls`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      });
      assert.equal(response.status, 400, JSON.stringify(body));
      assert.equal(typeof (await response.json()).error, 'string');
    }

    const examples = [
      ['The agent was good, helpful and excellent.', 'manual', 'positive', 3],
      ['The service was terrible and disappointing.', 'microphone', 'negative', -2],
      ['The customer called about the account number.', 'manual', 'neutral', 0],
    ];
    for (const [text, source, sentiment, score] of examples) {
      const response = await fetch(`${baseUrl}/api/calls`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript: `${marker} ${text}`, source }),
      });
      assert.equal(response.status, 201);
      const record = await response.json();
      createdIds.push(String(record.id));
      assert.equal(record.sentiment, sentiment);
      assert.equal(record.score, score);
      assert.equal(typeof record.transcript, 'string');
      assert.ok(['manual', 'microphone'].includes(record.source));
      assert.ok(Array.isArray(record.matched_terms));
      assert.ok(record.created_at);
    }

    const historyResponse = await fetch(`${baseUrl}/api/calls`);
    const history = await historyResponse.json();
    const testRows = history.filter((row) => String(row.transcript).startsWith(marker));
    assert.deepEqual(testRows.map((row) => String(row.id)), [...createdIds].reverse());

    const stats = await (await fetch(`${baseUrl}/api/stats`)).json();
    assert.equal(stats.total, baseline.total + 3);
    assert.equal(stats.positive, baseline.positive + 1);
    assert.equal(stats.negative, baseline.negative + 1);
    assert.equal(stats.neutral, baseline.neutral + 1);

    const persisted = await database.query('SELECT id FROM calls WHERE id = ANY($1::bigint[])', [createdIds]);
    assert.equal(persisted.rowCount, 3);
    assertionsCompleted = true;
    t.diagnostic('Health, validation, classifications, both valid sources, history, stats, and persisted rows passed.');
  } finally {
    if (createdIds.length) await database.query('DELETE FROM calls WHERE id = ANY($1::bigint[])', [createdIds]);
    if (child.exitCode === null) child.kill('SIGTERM');
    const exitCode = child.exitCode ?? await new Promise((resolve) => child.once('exit', resolve));
    if (assertionsCompleted) assert.equal(exitCode, 0, `Backend failed graceful shutdown: ${childOutput}`);
    await database.end();
  }
});
