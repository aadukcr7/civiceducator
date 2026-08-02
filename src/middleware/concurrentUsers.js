function createConcurrentUserLimiter(options = {}) {
  const maxUsers = Number(options.maxUsers) || 0;

  if (maxUsers <= 0) {
    return {
      middleware: (req, res, next) => next(),
      registerSession: () => {},
      unregisterSession: () => {},
      isAtCapacity: () => false,
      getActiveCount: () => 0,
    };
  }

  const sessions = new Map();

  function registerSession(sessionId) {
    if (!sessionId) {
      return;
    }
    sessions.set(sessionId, Date.now());
  }

  function unregisterSession(sessionId) {
    if (!sessionId) {
      return;
    }
    sessions.delete(sessionId);
  }

  function isAtCapacity() {
    return sessions.size >= maxUsers;
  }

  function getActiveCount() {
    return sessions.size;
  }

  function middleware(req, res, next) {
    if (req.session?.userId) {
      registerSession(req.sessionID);
    }
    next();
  }

  return {
    middleware,
    registerSession,
    unregisterSession,
    isAtCapacity,
    getActiveCount,
  };
}

module.exports = {
  createConcurrentUserLimiter,
};
