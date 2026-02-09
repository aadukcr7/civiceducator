const fs = require('fs');
const path = require('path');
const defaultLevels = require('./levels');

const dataPath = path.join(__dirname, 'levels.admin.json');

const hasFile = async () => {
  try {
    await fs.promises.access(dataPath);
    return true;
  } catch (err) {
    return false;
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildDefaultLevels = () => {
  const expanded = defaultLevels.expanded || {};

  return defaultLevels.map((level) => {
    const lessons = expanded[level.id] ? expanded[level.id] : level.lessons || [];

    return {
      id: level.id,
      title: level.title,
      description: level.description,
      icon: level.icon,
      lessons: clone(lessons),
      quiz: clone(level.quiz || []),
    };
  });
};

const loadLevels = async () => {
  if (await hasFile()) {
    const raw = await fs.promises.readFile(dataPath, 'utf8');
    return JSON.parse(raw);
  }

  return buildDefaultLevels();
};

const saveLevels = async (levels) => {
  const payload = JSON.stringify(levels, null, 2);
  await fs.promises.writeFile(dataPath, payload, 'utf8');
};

const getNextId = (items) => {
  if (!items.length) {
    return 1;
  }
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
};

const getNextNestedId = (levels, field) => {
  const ids = [];
  levels.forEach((level) => {
    (level[field] || []).forEach((item) => ids.push(Number(item.id) || 0));
  });

  if (!ids.length) {
    return 1;
  }
  return Math.max(...ids) + 1;
};

const getLevelIndex = (levels, levelId) =>
  levels.findIndex((level) => Number(level.id) === Number(levelId));

const getLessonIndex = (lessons, lessonId) =>
  lessons.findIndex((lesson) => Number(lesson.id) === Number(lessonId));

const getQuizIndex = (quiz, questionId) =>
  quiz.findIndex((question) => Number(question.id) === Number(questionId));

const getLevels = async () => loadLevels();

const getLevel = async (levelId) => {
  const levels = await loadLevels();
  return levels.find((level) => Number(level.id) === Number(levelId));
};

const createLevel = async (payload) => {
  const levels = await loadLevels();
  const newLevel = {
    id: getNextId(levels),
    title: payload.title,
    description: payload.description,
    icon: payload.icon,
    lessons: [],
    quiz: [],
  };

  levels.push(newLevel);
  await saveLevels(levels);
  return newLevel;
};

const updateLevel = async (levelId, payload) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return null;
  }

  levels[levelIndex] = {
    ...levels[levelIndex],
    title: payload.title,
    description: payload.description,
    icon: payload.icon,
  };

  await saveLevels(levels);
  return levels[levelIndex];
};

const deleteLevel = async (levelId) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return false;
  }

  levels.splice(levelIndex, 1);
  await saveLevels(levels);
  return true;
};

const createLesson = async (levelId, payload) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return null;
  }

  const newLesson = {
    id: getNextNestedId(levels, 'lessons'),
    title: payload.title,
    content: payload.content,
    keyPoints: payload.keyPoints,
    articles: payload.articles,
    helpline: payload.helpline,
  };

  levels[levelIndex].lessons = levels[levelIndex].lessons || [];
  levels[levelIndex].lessons.push(newLesson);
  await saveLevels(levels);
  return newLesson;
};

const updateLesson = async (levelId, lessonId, payload) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return null;
  }

  const lessons = levels[levelIndex].lessons || [];
  const lessonIndex = getLessonIndex(lessons, lessonId);

  if (lessonIndex === -1) {
    return null;
  }

  lessons[lessonIndex] = {
    ...lessons[lessonIndex],
    title: payload.title,
    content: payload.content,
    keyPoints: payload.keyPoints,
    articles: payload.articles,
    helpline: payload.helpline,
  };

  levels[levelIndex].lessons = lessons;
  await saveLevels(levels);
  return lessons[lessonIndex];
};

const deleteLesson = async (levelId, lessonId) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return false;
  }

  const lessons = levels[levelIndex].lessons || [];
  const lessonIndex = getLessonIndex(lessons, lessonId);

  if (lessonIndex === -1) {
    return false;
  }

  lessons.splice(lessonIndex, 1);
  levels[levelIndex].lessons = lessons;
  await saveLevels(levels);
  return true;
};

const createQuizQuestion = async (levelId, payload) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return null;
  }

  const newQuestion = {
    id: getNextNestedId(levels, 'quiz'),
    question: payload.question,
    options: payload.options,
    correct: payload.correct,
  };

  levels[levelIndex].quiz = levels[levelIndex].quiz || [];
  levels[levelIndex].quiz.push(newQuestion);
  await saveLevels(levels);
  return newQuestion;
};

const updateQuizQuestion = async (levelId, questionId, payload) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return null;
  }

  const quiz = levels[levelIndex].quiz || [];
  const quizIndex = getQuizIndex(quiz, questionId);

  if (quizIndex === -1) {
    return null;
  }

  quiz[quizIndex] = {
    ...quiz[quizIndex],
    question: payload.question,
    options: payload.options,
    correct: payload.correct,
  };

  levels[levelIndex].quiz = quiz;
  await saveLevels(levels);
  return quiz[quizIndex];
};

const deleteQuizQuestion = async (levelId, questionId) => {
  const levels = await loadLevels();
  const levelIndex = getLevelIndex(levels, levelId);

  if (levelIndex === -1) {
    return false;
  }

  const quiz = levels[levelIndex].quiz || [];
  const quizIndex = getQuizIndex(quiz, questionId);

  if (quizIndex === -1) {
    return false;
  }

  quiz.splice(quizIndex, 1);
  levels[levelIndex].quiz = quiz;
  await saveLevels(levels);
  return true;
};

module.exports = {
  getLevels,
  getLevel,
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
