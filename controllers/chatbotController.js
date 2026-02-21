const { askLessonAssistant } = require('../services/chatbotService');

function chatbotPage(req, res) {
  return res.render('chatbot');
}

async function askChatbot(req, res) {
  try {
    const question = String(req.body.question || '').trim();

    if (!question) {
      return res.status(400).json({
        answer: 'Please type your question first.',
        confidence: 0,
        sources: [],
      });
    }

    const response = await askLessonAssistant(question);
    return res.json(response);
  } catch (err) {
    console.error('Chatbot request error:', err);
    return res.status(500).json({
      answer: 'Unable to answer right now. Please try again.',
      confidence: 0,
      sources: [],
    });
  }
}

module.exports = {
  chatbotPage,
  askChatbot,
};
