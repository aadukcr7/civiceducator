const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const { chatbotPage, askChatbot } = require('../controllers/chatbotController');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', chatbotPage);
router.post('/ask', askChatbot);

module.exports = router;
