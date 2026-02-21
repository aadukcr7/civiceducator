const User = require('../models/User');

function getConcurrentLimiter(req) {
  return req.app.locals.concurrentUserLimiter;
}

function setAuthenticatedSession(req, user) {
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.email = user.email;

  const limiter = getConcurrentLimiter(req);
  if (limiter) {
    limiter.registerSession(req.sessionID);
  }
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    const limiter = getConcurrentLimiter(req);
    const currentSessionId = req.sessionID;

    req.session.destroy((err) => {
      if (err) {
        return reject(err);
      }
      if (limiter) {
        limiter.unregisterSession(currentSessionId);
      }
      resolve();
    });
  });
}

async function validateCurrentUserCredentials(userId, inputEmail, inputPassword) {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return { ok: false, code: 'USER_NOT_FOUND' };
  }

  if (currentUser.email.toLowerCase() !== inputEmail.toLowerCase()) {
    return { ok: false, code: 'EMAIL_MISMATCH' };
  }

  const userWithPassword = await User.findByEmail(currentUser.email);
  if (!userWithPassword) {
    return { ok: false, code: 'PASSWORD_RECORD_MISSING' };
  }

  const isPasswordValid = await User.verifyPassword(inputPassword, userWithPassword.password);
  if (!isPasswordValid) {
    return { ok: false, code: 'PASSWORD_MISMATCH' };
  }

  return { ok: true, user: currentUser };
}

function mapCredentialErrorToMessage(code, mode) {
  const prefix = mode === 'reset' ? 'resetError' : 'deleteError';

  if (code === 'EMAIL_MISMATCH') {
    return `${prefix}=Email%20does%20not%20match%20your%20account`;
  }
  if (code === 'PASSWORD_RECORD_MISSING') {
    return `${prefix}=Unable%20to%20validate%20account`;
  }
  if (code === 'PASSWORD_MISMATCH') {
    return `${prefix}=Incorrect%20password`;
  }
  return `${prefix}=Could%20not%20validate%20account`;
}

module.exports = {
  destroySession,
  getConcurrentLimiter,
  mapCredentialErrorToMessage,
  setAuthenticatedSession,
  validateCurrentUserCredentials,
};
