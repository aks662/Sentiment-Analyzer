import pg from 'pg';

const { Pool } = pg;
export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: Number(process.env.PGPOOL_MAX || 10),
        idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT_MS || 30000),
        connectionTimeoutMillis: Number(process.env.PGPOOL_CONNECTION_TIMEOUT_MS || 5000),
      }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        max: Number(process.env.PGPOOL_MAX || 10),
        idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT_MS || 30000),
        connectionTimeoutMillis: Number(process.env.PGPOOL_CONNECTION_TIMEOUT_MS || 5000),
      },
);

pool.on('error', () => {
  console.error('Unexpected error from an idle PostgreSQL client.');
});

export async function insertCall({ transcript, source, sentiment, score, matched_terms }) {
  const result = await pool.query(
    `INSERT INTO calls (transcript, source, sentiment, score, matched_terms)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, transcript, source, sentiment, score, matched_terms, created_at`,
    [transcript, source, sentiment, score, matched_terms],
  );
  return result.rows[0];
}

export async function getCalls(limit = 100) {
  const result = await pool.query(
    `SELECT id, transcript, source, sentiment, score, matched_terms, created_at
     FROM calls ORDER BY created_at DESC, id DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}

export async function getCallStats() {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE sentiment = 'positive')::int AS positive,
       COUNT(*) FILTER (WHERE sentiment = 'neutral')::int AS neutral,
       COUNT(*) FILTER (WHERE sentiment = 'negative')::int AS negative
     FROM calls`,
  );
  return result.rows[0];
}
