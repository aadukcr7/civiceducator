const levelsStore = require('../data/levelsStore');

const parseLines = (value) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const parseCommaList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const getLevelStats = (levels) => {
  const totalLevels = levels.length;
  const totalLessons = levels.reduce((sum, level) => sum + (level.lessons || []).length, 0);
  const totalQuestions = levels.reduce((sum, level) => sum + (level.quiz || []).length, 0);

  return { totalLevels, totalLessons, totalQuestions };
};

const getLevels = async () => levelsStore.getLevels();

const getLevel = async (levelId) => levelsStore.getLevel(levelId);

const createLevel = async (payload) =>
  levelsStore.createLevel({
    title: payload.title.trim(),
    description: payload.description.trim(),
    icon: payload.icon.trim(),
  });

const updateLevel = async (levelId, payload) =>
  levelsStore.updateLevel(levelId, {
    title: payload.title.trim(),
    description: payload.description.trim(),
    icon: payload.icon.trim(),
  });

const deleteLevel = async (levelId) => levelsStore.deleteLevel(levelId);

const createLesson = async (levelId, payload) =>
  levelsStore.createLesson(levelId, {
    title: payload.title.trim(),
    content: payload.content.trim(),
    keyPoints: parseLines(payload.keyPoints || ''),
    articles: parseCommaList(payload.articles || ''),
    helpline: payload.helpline ? payload.helpline.trim() : null,
  });

const updateLesson = async (levelId, lessonId, payload) =>
  levelsStore.updateLesson(levelId, lessonId, {
    title: payload.title.trim(),
    content: payload.content.trim(),
    keyPoints: parseLines(payload.keyPoints || ''),
    articles: parseCommaList(payload.articles || ''),
    helpline: payload.helpline ? payload.helpline.trim() : null,
  });

const deleteLesson = async (levelId, lessonId) => levelsStore.deleteLesson(levelId, lessonId);

const createQuizQuestion = async (levelId, payload) =>
  levelsStore.createQuizQuestion(levelId, {
    question: payload.question.trim(),
    options: parseLines(payload.options || ''),
    correct: Number(payload.correct),
  });

const updateQuizQuestion = async (levelId, questionId, payload) =>
  levelsStore.updateQuizQuestion(levelId, questionId, {
    question: payload.question.trim(),
    options: parseLines(payload.options || ''),
    correct: Number(payload.correct),
  });

const deleteQuizQuestion = async (levelId, questionId) =>
  levelsStore.deleteQuizQuestion(levelId, questionId);

module.exports = {
  getLevels,
  getLevel,
  getLevelStats,
  createLevel,
  updateLevel,
  deleteLevel,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
};
