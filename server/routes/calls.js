import { Router } from 'express';
import { getCallStats, getCalls, insertCall } from '../db.js';

const router = Router();

router.post('/', async (request, response, next) => {
  const transcript = request.body?.transcript;
  const source = request.body?.source;

  if (typeof transcript !== 'string' || transcript.trim().length === 0) {
    return response.status(400).json({ error: 'transcript_required' });
  }
  if (!['manual', 'microphone'].includes(source)) {
    return response.status(400).json({ error: 'invalid_source' });
  }

  // Parth's sentiment module has not been added to this checkout. Do not
  // persist a call with invented sentiment values; integration follows once
  // the module path and interface are available from its owner.
  if (!request.app.locals.analyzeSentiment) {
    return response.status(503).json({ error: 'sentiment_module_unavailable' });
  }

  try {
    const analysis = request.app.locals.analyzeSentiment(transcript);
    const allowedSentiments = ['positive', 'neutral', 'negative'];
    if (
      !analysis ||
      !allowedSentiments.includes(analysis.sentiment) ||
      !Number.isInteger(analysis.score) ||
      !Array.isArray(analysis.matched_terms)
    ) {
      return response.status(502).json({ error: 'invalid_sentiment_module_response' });
    }
    const call = await insertCall({ transcript: transcript.trim(), source, ...analysis });
    return response.status(201).json(call);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (_request, response, next) => {
  try {
    response.json(await getCalls());
  } catch (error) {
    next(error);
  }
});

export const statsRouter = Router();
statsRouter.get('/', async (_request, response, next) => {
  try {
    response.json(await getCallStats());
  } catch (error) {
    next(error);
  }
});

export default router;
