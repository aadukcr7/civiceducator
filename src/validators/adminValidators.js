const { body } = require('express-validator');

const levelValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
];

const lessonValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];

const quizValidation = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('options').trim().notEmpty().withMessage('Options are required'),
  body('correct').trim().notEmpty().withMessage('Correct index is required'),
];

module.exports = {
  levelValidation,
  lessonValidation,
  quizValidation,
};
