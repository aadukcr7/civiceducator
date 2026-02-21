const { validationResult } = require('express-validator');
const adminLevelsService = require('../services/adminLevelsService');
const User = require('../models/User');
const Progress = require('../models/Progress');

const ADMIN_PAGE_SIZE = 15;

function validationErrors(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
}

function parsePage(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildPagination(page, totalItems, pageSize) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}

function paginateArray(items, page, pageSize) {
  const pagination = buildPagination(page, items.length, pageSize);
  const startIndex = (pagination.page - 1) * pageSize;
  return {
    items: items.slice(startIndex, startIndex + pageSize),
    pagination,
  };
}

async function dashboard(req, res) {
  try {
    const [levels, userCount, progressStats] = await Promise.all([
      adminLevelsService.getLevels(),
      User.countAll(),
      Progress.getGlobalStats(),
    ]);

    const levelStats = adminLevelsService.getLevelStats(levels);

    return res.render('admin/index', {
      stats: {
        users: userCount,
        completedCount: progressStats.completedCount,
        averageScore: progressStats.averageScore,
        ...levelStats,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).render('404', { error: 'Unable to load admin dashboard' });
  }
}

async function usersPage(req, res) {
  try {
    const page = parsePage(req.query.page);
    const totalUsers = await User.countAll();
    const pagination = buildPagination(page, totalUsers, ADMIN_PAGE_SIZE);
    const offset = (pagination.page - 1) * ADMIN_PAGE_SIZE;
    const users = await User.listPage(ADMIN_PAGE_SIZE, offset);

    return res.render('admin/users', { users, flash: null, pagination });
  } catch (err) {
    console.error('Admin users error:', err);
    return res.status(500).render('404', { error: 'Unable to load users' });
  }
}

async function toggleUser(req, res) {
  try {
    const requestedPage = parsePage(req.body.page || req.query.page);
    const userId = Number(req.params.id);
    const isDisabled = req.body.is_disabled === '1';
    await User.setDisabled(userId, !isDisabled);
    const totalUsers = await User.countAll();
    const pagination = buildPagination(requestedPage, totalUsers, ADMIN_PAGE_SIZE);
    const offset = (pagination.page - 1) * ADMIN_PAGE_SIZE;
    const users = await User.listPage(ADMIN_PAGE_SIZE, offset);

    return res.render('admin/users', {
      users,
      flash: `User ${!isDisabled ? 'disabled' : 'enabled'} successfully.`,
      pagination,
    });
  } catch (err) {
    console.error('Admin toggle user error:', err);
    return res.status(500).render('404', { error: 'Unable to update user status' });
  }
}

async function resetUserPassword(req, res) {
  try {
    const requestedPage = parsePage(req.body.page || req.query.page);
    const userId = Number(req.params.id);
    const tempPassword = User.generateTempPassword();
    await User.updatePassword(userId, tempPassword);
    const totalUsers = await User.countAll();
    const pagination = buildPagination(requestedPage, totalUsers, ADMIN_PAGE_SIZE);
    const offset = (pagination.page - 1) * ADMIN_PAGE_SIZE;
    const users = await User.listPage(ADMIN_PAGE_SIZE, offset);

    return res.render('admin/users', {
      users,
      flash: `Temporary password for user ${userId}: ${tempPassword}`,
      pagination,
    });
  } catch (err) {
    console.error('Admin reset password error:', err);
    return res.status(500).render('404', { error: 'Unable to reset password' });
  }
}

async function levelsPage(req, res) {
  try {
    const page = parsePage(req.query.page);
    const levels = await adminLevelsService.getLevels();
    const paginated = paginateArray(levels, page, ADMIN_PAGE_SIZE);
    return res.render('admin/levels', { levels: paginated.items, pagination: paginated.pagination });
  } catch (err) {
    console.error('Admin levels error:', err);
    return res.status(500).render('404', { error: 'Unable to load levels' });
  }
}

function newLevelPage(req, res) {
  return res.render('admin/level-edit', { level: null, errors: [] });
}

async function createLevel(req, res) {
  const errors = validationErrors(req);
  if (errors) {
    return res.render('admin/level-edit', {
      level: {
        title: req.body.title,
        description: req.body.description,
        icon: req.body.icon,
      },
      errors,
    });
  }

  try {
    await adminLevelsService.createLevel(req.body);
    return res.redirect('/admin/levels');
  } catch (err) {
    console.error('Admin create level error:', err);
    return res.status(500).render('404', { error: 'Unable to create level' });
  }
}

async function editLevelPage(req, res) {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    return res.render('admin/level-edit', { level, errors: [] });
  } catch (err) {
    console.error('Admin edit level error:', err);
    return res.status(500).render('404', { error: 'Unable to load level' });
  }
}

async function updateLevel(req, res) {
  const errors = validationErrors(req);
  if (errors) {
    return res.render('admin/level-edit', {
      level: {
        id: req.params.levelId,
        title: req.body.title,
        description: req.body.description,
        icon: req.body.icon,
        lessons: [],
        quiz: [],
      },
      errors,
    });
  }

  try {
    const updated = await adminLevelsService.updateLevel(req.params.levelId, req.body);

    if (!updated) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    return res.redirect('/admin/levels');
  } catch (err) {
    console.error('Admin update level error:', err);
    return res.status(500).render('404', { error: 'Unable to update level' });
  }
}

async function deleteLevel(req, res) {
  try {
    const page = parsePage(req.body.page || req.query.page);
    const removed = await adminLevelsService.deleteLevel(req.params.levelId);
    if (!removed) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    return res.redirect(`/admin/levels?page=${page}`);
  } catch (err) {
    console.error('Admin delete level error:', err);
    return res.status(500).render('404', { error: 'Unable to delete level' });
  }
}

async function lessonsPage(req, res) {
  try {
    const page = parsePage(req.query.page);
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    const lessons = Array.isArray(level.lessons) ? level.lessons : [];
    const paginated = paginateArray(lessons, page, ADMIN_PAGE_SIZE);
    return res.render('admin/lessons', {
      level,
      lessons: paginated.items,
      pagination: paginated.pagination,
    });
  } catch (err) {
    console.error('Admin lessons error:', err);
    return res.status(500).render('404', { error: 'Unable to load lessons' });
  }
}

async function newLessonPage(req, res) {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }
  return res.render('admin/lesson-edit', { level, lesson: null, errors: [] });
}

async function createLesson(req, res) {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }

  const errors = validationErrors(req);
  if (errors) {
    return res.render('admin/lesson-edit', {
      level,
      lesson: {
        title: req.body.title,
        content: req.body.content,
        keyPoints: req.body.keyPoints,
        articles: req.body.articles,
        helpline: req.body.helpline,
      },
      errors,
    });
  }

  try {
    await adminLevelsService.createLesson(req.params.levelId, req.body);
    return res.redirect(`/admin/levels/${req.params.levelId}/lessons`);
  } catch (err) {
    console.error('Admin create lesson error:', err);
    return res.status(500).render('404', { error: 'Unable to create lesson' });
  }
}

async function editLessonPage(req, res) {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const lesson = (level.lessons || []).find(
      (item) => Number(item.id) === Number(req.params.lessonId)
    );

    if (!lesson) {
      return res.status(404).render('404', { error: 'Lesson not found' });
    }

    return res.render('admin/lesson-edit', { level, lesson, errors: [] });
  } catch (err) {
    console.error('Admin edit lesson error:', err);
    return res.status(500).render('404', { error: 'Unable to load lesson' });
  }
}

async function updateLesson(req, res) {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }

  const errors = validationErrors(req);
  if (errors) {
    return res.render('admin/lesson-edit', {
      level,
      lesson: {
        id: req.params.lessonId,
        title: req.body.title,
        content: req.body.content,
        keyPoints: req.body.keyPoints,
        articles: req.body.articles,
        helpline: req.body.helpline,
      },
      errors,
    });
  }

  try {
    const updated = await adminLevelsService.updateLesson(
      req.params.levelId,
      req.params.lessonId,
      req.body
    );

    if (!updated) {
      return res.status(404).render('404', { error: 'Lesson not found' });
    }

    return res.redirect(`/admin/levels/${req.params.levelId}/lessons`);
  } catch (err) {
    console.error('Admin update lesson error:', err);
    return res.status(500).render('404', { error: 'Unable to update lesson' });
  }
}

async function deleteLesson(req, res) {
  try {
    const page = parsePage(req.body.page || req.query.page);
    const removed = await adminLevelsService.deleteLesson(req.params.levelId, req.params.lessonId);
    if (!removed) {
      return res.status(404).render('404', { error: 'Lesson not found' });
    }
    return res.redirect(`/admin/levels/${req.params.levelId}/lessons?page=${page}`);
  } catch (err) {
    console.error('Admin delete lesson error:', err);
    return res.status(500).render('404', { error: 'Unable to delete lesson' });
  }
}

async function quizPage(req, res) {
  try {
    const page = parsePage(req.query.page);
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }
    const quizQuestions = Array.isArray(level.quiz) ? level.quiz : [];
    const paginated = paginateArray(quizQuestions, page, ADMIN_PAGE_SIZE);
    return res.render('admin/quiz', {
      level,
      questions: paginated.items,
      pagination: paginated.pagination,
    });
  } catch (err) {
    console.error('Admin quiz error:', err);
    return res.status(500).render('404', { error: 'Unable to load quiz' });
  }
}

async function newQuizPage(req, res) {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }
  return res.render('admin/quiz-edit', { level, question: null, errors: [] });
}

async function createQuizQuestion(req, res) {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }

  const errors = validationErrors(req);
  if (errors) {
    return res.render('admin/quiz-edit', {
      level,
      question: {
        question: req.body.question,
        options: req.body.options,
        correct: req.body.correct,
      },
      errors,
    });
  }

  try {
    await adminLevelsService.createQuizQuestion(req.params.levelId, req.body);
    return res.redirect(`/admin/levels/${req.params.levelId}/quiz`);
  } catch (err) {
    console.error('Admin create quiz error:', err);
    return res.status(500).render('404', { error: 'Unable to create quiz question' });
  }
}

async function editQuizQuestionPage(req, res) {
  try {
    const level = await adminLevelsService.getLevel(req.params.levelId);
    if (!level) {
      return res.status(404).render('404', { error: 'Level not found' });
    }

    const question = (level.quiz || []).find(
      (item) => Number(item.id) === Number(req.params.questionId)
    );

    if (!question) {
      return res.status(404).render('404', { error: 'Question not found' });
    }

    return res.render('admin/quiz-edit', { level, question, errors: [] });
  } catch (err) {
    console.error('Admin edit quiz error:', err);
    return res.status(500).render('404', { error: 'Unable to load quiz question' });
  }
}

async function updateQuizQuestion(req, res) {
  const level = await adminLevelsService.getLevel(req.params.levelId);
  if (!level) {
    return res.status(404).render('404', { error: 'Level not found' });
  }

  const errors = validationErrors(req);
  if (errors) {
    return res.render('admin/quiz-edit', {
      level,
      question: {
        id: req.params.questionId,
        question: req.body.question,
        options: req.body.options,
        correct: req.body.correct,
      },
      errors,
    });
  }

  try {
    const updated = await adminLevelsService.updateQuizQuestion(
      req.params.levelId,
      req.params.questionId,
      req.body
    );

    if (!updated) {
      return res.status(404).render('404', { error: 'Question not found' });
    }

    return res.redirect(`/admin/levels/${req.params.levelId}/quiz`);
  } catch (err) {
    console.error('Admin update quiz error:', err);
    return res.status(500).render('404', { error: 'Unable to update quiz question' });
  }
}

async function deleteQuizQuestion(req, res) {
  try {
    const page = parsePage(req.body.page || req.query.page);
    const removed = await adminLevelsService.deleteQuizQuestion(
      req.params.levelId,
      req.params.questionId
    );
    if (!removed) {
      return res.status(404).render('404', { error: 'Question not found' });
    }
    return res.redirect(`/admin/levels/${req.params.levelId}/quiz?page=${page}`);
  } catch (err) {
    console.error('Admin delete quiz error:', err);
    return res.status(500).render('404', { error: 'Unable to delete quiz question' });
  }
}

module.exports = {
  dashboard,
  usersPage,
  toggleUser,
  resetUserPassword,
  levelsPage,
  newLevelPage,
  createLevel,
  editLevelPage,
  updateLevel,
  deleteLevel,
  lessonsPage,
  newLessonPage,
  createLesson,
  editLessonPage,
  updateLesson,
  deleteLesson,
  quizPage,
  newQuizPage,
  createQuizQuestion,
  editQuizQuestionPage,
  updateQuizQuestion,
  deleteQuizQuestion,
};
