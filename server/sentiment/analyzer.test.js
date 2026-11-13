
import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeSentiment } from './analyzer.js';

// 1. Clearly positive transcript
test('identifies positive sentiment', () => {
    const result = analyzeSentiment(
        'The agent was good, helpful and excellent.'
    );

    assert.equal(result.sentiment, 'positive');
    assert.equal(result.score, 3);
    assert.deepEqual(
        result.matched_terms,
        ['good', 'helpful', 'excellent']
    );
});

// 2. Clearly negative transcript
test('identifies negative sentiment', () => {
    const result = analyzeSentiment(
        'The service was terrible and disappointing.'
    );

    assert.equal(result.sentiment, 'negative');
    assert.equal(result.score, -2);
});

// 3. Neutral transcript
test('identifies neutral sentiment', () => {
    const result = analyzeSentiment(
        'The customer called about the account number.'
    );

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
    assert.deepEqual(result.matched_terms, []);
});

// 4. Positive word with negation
test('reverses positive sentiment with negation', () => {
    const result = analyzeSentiment('The service is not good.');

    assert.equal(result.sentiment, 'negative');
    assert.equal(result.score, -1);
    assert.deepEqual(result.matched_terms, ['not good']);
});

// 5. Negative word with negation
test('reverses negative sentiment with negation', () => {
    const result = analyzeSentiment('The service is not bad.');

    assert.equal(result.sentiment, 'positive');
    assert.equal(result.score, 1);
    assert.deepEqual(result.matched_terms, ['not bad']);
});

// 6. Mixed positive and negative words
test('handles mixed sentiment', () => {
    const result = analyzeSentiment(
        'The agent was helpful but the delivery was delayed.'
    );

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
});

// 7. Empty input
test('handles empty input', () => {
    const result = analyzeSentiment('');

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
    assert.deepEqual(result.matched_terms, []);
});

// 8. Whitespace-only input
test('handles whitespace-only input', () => {
    const result = analyzeSentiment('     ');

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
});

// 9. Punctuation
test('handles punctuation correctly', () => {
    const result = analyzeSentiment('GOOD!!!');

    assert.equal(result.sentiment, 'positive');
    assert.equal(result.score, 1);
});

// 10. Uppercase and lowercase
test('handles different letter casing', () => {
    const result = analyzeSentiment('GOOD and Bad');

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
    assert.deepEqual(result.matched_terms, ['good', 'bad']);
});

// 11. Repeated sentiment words
test('counts repeated words but avoids duplicate matched terms', () => {
    const result = analyzeSentiment('good good good');

    assert.equal(result.sentiment, 'positive');
    assert.equal(result.score, 3);
    assert.deepEqual(result.matched_terms, ['good']);
});

// 12. Substring matching
test('does not match sentiment words inside other words', () => {
    const result = analyzeSentiment(
        'goodness goodbye badly'
    );

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
    assert.deepEqual(result.matched_terms, []);
});

// 13. Multiple sentences
test('handles multiple sentences independently', () => {
    const result = analyzeSentiment(
        'The service is not good. The agent is helpful.'
    );

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
    assert.deepEqual(
        result.matched_terms,
        ['not good', 'helpful']
    );
});

// 14. Customer-service expressions
test('recognizes customer-service vocabulary', () => {
    const result = analyzeSentiment(
        'The request was resolved and support was responsive.'
    );

    assert.equal(result.sentiment, 'positive');
    assert.equal(result.score, 2);
});

// 15. Contraction-based negation
test('handles contractions', () => {
    const result = analyzeSentiment(
        "The support wasn't helpful."
    );

    assert.equal(result.sentiment, 'negative');
    assert.equal(result.score, -1);
    assert.deepEqual(result.matched_terms, ['not helpful']);
});

// 16. Non-string input
test('handles invalid input safely', () => {
    const result = analyzeSentiment(null);

    assert.equal(result.sentiment, 'neutral');
    assert.equal(result.score, 0);
    assert.deepEqual(result.matched_terms, []);
});

// 17. Result structure and integer score
test('always returns the required output structure', () => {
    const result = analyzeSentiment('The service is excellent.');

    assert.deepEqual(
        Object.keys(result),
        ['sentiment', 'score', 'matched_terms']
    );

    assert.equal(Number.isInteger(result.score), true);
    assert.equal(Array.isArray(result.matched_terms), true);
});

// 18. Deterministic output
test('returns consistent results for the same transcript', () => {
    const first = analyzeSentiment('The service is not good.');
    const second = analyzeSentiment('The service is not good.');

    assert.deepEqual(first, second);
});
// 19. "no" negation
test('handles no as a negation word', () => {
    const result = analyzeSentiment('The service is no good.');

    assert.equal(result.sentiment, 'negative');
    assert.equal(result.score, -1);
});

// 20. "never" negation
test('handles never as a negation word', () => {
    const result = analyzeSentiment('The agent is never helpful.');

    assert.equal(result.sentiment, 'negative');
    assert.equal(result.score, -1);
});

// 21. "hardly" negation
test('handles hardly as a negation word', () => {
    const result = analyzeSentiment('The support is hardly helpful.');

    assert.equal(result.sentiment, 'negative');
    assert.equal(result.score, -1);
});

// 22. Negation expires after three words
test('does not apply negation beyond three intervening words', () => {
    const result = analyzeSentiment(
        'The service is not very much at all good and helpful.'
    );

    assert.equal(result.sentiment, 'positive');
    assert.equal(result.score, 2);
});

// 23. Negation resets after sentence punctuation
test('resets negation after sentence punctuation', () => {
    const result = analyzeSentiment(
        'The service is not good. The agent is helpful.'
    );

    assert.equal(result.score, 0);
    assert.deepEqual(
        result.matched_terms,
        ['not good', 'helpful']
    );
});

// 24. Known limitation: "not only good"
test('documents the limitation of not only good phrasing', () => {
    const result = analyzeSentiment(
        'The service is not only good.'
    );

    // Current rule-based logic incorrectly treats "good" as negated.
    assert.equal(result.sentiment, 'negative');
    assert.deepEqual(result.matched_terms, ['not good']);
});