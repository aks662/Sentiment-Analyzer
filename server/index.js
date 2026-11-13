import 'dotenv/config';
import express from 'express';
import { pool } from './db.js';
import callsRouter, { statsRouter } from './routes/calls.js';

const app = express();
const port = Number(process.env.PORT || 5001);
const host = process.env.HOST || '127.0.0.1';

// Allow a separately hosted frontend to call this API without opening it to
// arbitrary browser origins. Leave unset for local Vite proxy development.
const frontendOrigin = process.env.FRONTEND_ORIGIN;
app.use((request, response, next) => {
  const requestOrigin = request.get('Origin');
  if (frontendOrigin && requestOrigin === frontendOrigin) {
    response.set('Access-Control-Allow-Origin', frontendOrigin);
    response.vary('Origin');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  return next();
});

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

const server = app.listen(port, host, () => {
  console.log(`Sentiment Analyzer API listening at http://${host}:${port}`);
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
