
import {
    POSITIVE_TERMS,
    NEGATIVE_TERMS
} from './lexicon.js';

// Convert contractions into their full forms
function expandContractions(text) {
    return text
        .replace(/\bisn't\b/gi, 'is not')
        .replace(/\bwasn't\b/gi, 'was not')
        .replace(/\baren't\b/gi, 'are not')
        .replace(/\bweren't\b/gi, 'were not')
        .replace(/\bdon't\b/gi, 'do not')
        .replace(/\bdoesn't\b/gi, 'does not')
        .replace(/\bdidn't\b/gi, 'did not')
        .replace(/\bcan't\b/gi, 'can not')
        .replace(/\bcannot\b/gi, 'can not')
        .replace(/\bcouldn't\b/gi, 'could not')
        .replace(/\bshouldn't\b/gi, 'should not')
        .replace(/\bwouldn't\b/gi, 'would not')
        .replace(/\bhaven't\b/gi, 'have not')
        .replace(/\bhasn't\b/gi, 'has not')
        .replace(/\bhadn't\b/gi, 'had not');
}

// Convert transcript into lowercase words and sentence boundaries
function preprocessText(text) {
    const expandedText = expandContractions(text);

    return expandedText
        .toLowerCase()
        .match(/[a-z]+|[.!?;:]/g) || [];
}

// Create sets for faster word matching
const positiveSet = new Set(POSITIVE_TERMS);
const negativeSet = new Set(NEGATIVE_TERMS);

// Negation words
const NEGATION_WORDS = [
    'not',
    'no',
    'never',
    'hardly'
];

const negationSet = new Set(NEGATION_WORDS);

// Main sentiment analysis function
export function analyzeSentiment(text) {

    // Handle invalid or empty input
    if (typeof text !== 'string' || text.trim() === '') {
        return {
            sentiment: 'neutral',
            score: 0,
            matched_terms: []
        };
    }

    const words = preprocessText(text);

    let score = 0;

    const matchedTerms = [];

    // Track pending negation
    let negationPending = false;
    let negationDistance = 0;

    for (const word of words) {

        // Reset negation at sentence boundaries
        if (['.', '!', '?', ';', ':'].includes(word)) {
            negationPending = false;
            negationDistance = 0;
            continue;
        }

        // Detect negation
        if (negationSet.has(word)) {
            negationPending = true;
            negationDistance = 0;
            continue;
        }

        let contribution = 0;

        // Check positive words
        if (positiveSet.has(word)) {
            contribution = 1;
        }

        // Check negative words
        else if (negativeSet.has(word)) {
            contribution = -1;
        }

        // Ignore words that have no sentiment
        if (contribution === 0) {
            if (negationPending) {
                negationDistance++;

                if (negationDistance > 3) {
                    negationPending = false;
                }
            }

            continue;
        }

        // Apply negation to the next relevant sentiment word
        let matchedTerm = word;

        if (negationPending && negationDistance <= 3) {
            contribution = contribution * -1;
            matchedTerm = 'not ' + word;
        }

        // Update total score
        score += contribution;

        // Avoid duplicate matched terms
        if (!matchedTerms.includes(matchedTerm)) {
            matchedTerms.push(matchedTerm);
        }

        // Consume the pending negation
        negationPending = false;
        negationDistance = 0;
    }

    // Classify the final sentiment
    let sentiment = 'neutral';

    if (score > 0) {
        sentiment = 'positive';
    } else if (score < 0) {
        sentiment = 'negative';
    }

    return {
        sentiment,
        score,
        matched_terms: matchedTerms
    };
}
