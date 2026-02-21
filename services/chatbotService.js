const levelsStore = require('../data/levelsStore');

const MIN_MATCH_SCORE = 0.08;
const MIN_CONFIDENCE_THRESHOLD = 0.25;
const MAX_SOURCES = 3;

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'its',
  'me',
  'my',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'their',
  'them',
  'this',
  'to',
  'us',
  'was',
  'we',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you',
  'your',
]);

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function toTokenSet(text) {
  return new Set(tokenize(text));
}

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildLessonDocs(levels) {
  const docs = [];

  levels.forEach((level) => {
    (level.lessons || []).forEach((lesson) => {
      const fullText = `${lesson.title || ''}. ${lesson.content || ''}`.trim();
      docs.push({
        levelId: level.id,
        levelTitle: level.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        content: lesson.content || '',
        tokenSet: toTokenSet(fullText),
      });
    });
  });

  return docs;
}

function cosineLikeScore(querySet, lessonSet) {
  if (!querySet.size || !lessonSet.size) {
    return 0;
  }

  let overlap = 0;
  querySet.forEach((token) => {
    if (lessonSet.has(token)) {
      overlap += 1;
    }
  });

  return overlap / Math.sqrt(querySet.size * lessonSet.size);
}

function selectEvidenceSentences(questionTokens, content) {
  const sentences = splitSentences(content);

  const ranked = sentences
    .map((sentence) => {
      const sentenceTokens = toTokenSet(sentence);
      let overlap = 0;
      questionTokens.forEach((token) => {
        if (sentenceTokens.has(token)) {
          overlap += 1;
        }
      });

      return { sentence, overlap };
    })
    .sort((left, right) => right.overlap - left.overlap)
    .filter((item, index) => item.overlap > 0 || index === 0)
    .slice(0, 2)
    .map((item) => item.sentence);

  return ranked;
}

function buildLowConfidenceResponse() {
  return {
    answer:
      "I don't know based on the current lesson content. I could not find enough reliable support to answer this correctly.",
    confidence: 0,
    sources: [],
    citations: [],
    isFallback: true,
  };
}

function buildResponse({ topMatches, topScore, questionTokens }) {
  if (!topMatches.length || topScore < MIN_MATCH_SCORE) {
    return buildLowConfidenceResponse();
  }

  const evidenceLines = [];
  const sources = topMatches.map((match, index) => {
    const snippets = selectEvidenceSentences(questionTokens, match.content);
    snippets.forEach((snippet) => evidenceLines.push(`[${index + 1}] ${snippet}`));

    return {
      levelId: match.levelId,
      levelTitle: match.levelTitle,
      lessonId: match.lessonId,
      lessonTitle: match.lessonTitle,
      citationLabel: `[${index + 1}]`,
      snippets,
    };
  });

  const confidence = Math.min(0.99, Number((topScore * 2.2).toFixed(2)));
  if (confidence < MIN_CONFIDENCE_THRESHOLD) {
    return buildLowConfidenceResponse();
  }

  const citationLines = sources
    .map((source) => `${source.citationLabel} ${source.levelTitle} -> ${source.lessonTitle}`)
    .join('\n');

  return {
    answer: `Based on the lesson content, here is the most relevant information:\n${evidenceLines.join(
      '\n'
    )}\n\nCitations:\n${citationLines}`,
    confidence,
    sources: sources.map((source) => ({
      levelId: source.levelId,
      levelTitle: source.levelTitle,
      lessonId: source.lessonId,
      lessonTitle: source.lessonTitle,
      citationLabel: source.citationLabel,
    })),
    citations: sources.map((source) => ({
      label: source.citationLabel,
      levelTitle: source.levelTitle,
      lessonTitle: source.lessonTitle,
      snippets: source.snippets,
    })),
    isFallback: false,
  };
}

async function askLessonAssistant(question) {
  const trimmedQuestion = String(question || '').trim();

  if (!trimmedQuestion) {
    return {
      answer: 'Please enter a question first.',
      confidence: 0,
      sources: [],
      citations: [],
      isFallback: true,
    };
  }

  const levels = await levelsStore.getLevels();
  const docs = buildLessonDocs(levels);

  const questionTokens = tokenize(trimmedQuestion);
  const questionSet = new Set(questionTokens);

  const ranked = docs
    .map((doc) => ({
      ...doc,
      score: cosineLikeScore(questionSet, doc.tokenSet),
    }))
    .sort((left, right) => right.score - left.score);

  const topScore = ranked[0]?.score || 0;
  const topMatches = ranked
    .filter((item) => item.score > MIN_MATCH_SCORE)
    .slice(0, MAX_SOURCES);

  return buildResponse({
    topMatches,
    topScore,
    questionTokens,
  });
}

module.exports = {
  askLessonAssistant,
};
