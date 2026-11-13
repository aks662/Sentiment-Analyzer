import { Router } from 'express';
import { getCallStats, getCalls, insertCall } from '../db.js';
import { analyzeSentiment } from '../sentiment/analyzer.js';

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

  try {
    const analysis = analyzeSentiment(transcript.trim());
    const allowedSentiments = ['positive', 'neutral', 'negative'];
    if (
      !analysis ||
      !allowedSentiments.includes(analysis.sentiment) ||
      !Number.isInteger(analysis.score) ||
      !Array.isArray(analysis.matched_terms) ||
      !analysis.matched_terms.every((term) => typeof term === 'string')
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
