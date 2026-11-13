import 'dotenv/config';
import express from 'express';
import { pool } from './db.js';
import callsRouter, { statsRouter } from './routes/calls.js';

const app = express();
const port = Number(process.env.PORT || 5001);

app.use(express.json());
app.use('/api/calls', callsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    return response.json({ status: 'ok', express: 'running', database: 'connected' });
  } catch {
    return response.status(503).json({ status: 'error', express: 'running', database: 'unavailable' });
  }
});

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'invalid_json' });
  }
  console.error('Unhandled API error:', error?.message || error);
  return response.status(500).json({ error: 'internal_server_error' });
});

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Sentiment Analyzer API listening at http://127.0.0.1:${port}`);
});

let shutdownPromise;
export function shutdownServer(signal = 'shutdown') {
  if (shutdownPromise) return shutdownPromise;
  console.log(`Shutting down API after ${signal}.`);
  shutdownPromise = new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  })
    .then(() => pool.end())
    .catch(() => {
      console.error('Graceful API shutdown failed.');
      process.exitCode = 1;
    });
  return shutdownPromise;
}

process.once('SIGINT', () => void shutdownServer('SIGINT'));
process.once('SIGTERM', () => void shutdownServer('SIGTERM'));
