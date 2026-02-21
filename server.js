const express = require('express');
const session = require('express-session');
const SqliteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const levelsRoutes = require('./routes/levels');
const adminRoutes = require('./routes/admin');
const levelsStore = require('./data/levelsStore');
const Progress = require('./models/Progress');
const User = require('./models/User');
const { isAuthenticated } = require('./middleware/auth');
const { createConcurrentUserLimiter } = require('./middleware/concurrentUsers');

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_CONCURRENT_USERS = Number(process.env.MAX_CONCURRENT_USERS) || 0;

const concurrentUserLimiter = createConcurrentUserLimiter({
  maxUsers: MAX_CONCURRENT_USERS,
});

app.locals.concurrentUserLimiter = concurrentUserLimiter;

// Trust proxy (required for Render HTTPS)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
}));

// Rate limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware - use 'combined' in production for detailed logs
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CSRF protection - configure for production
const csrfProtection = csrf({ cookie: false });

// Session configuration with SQLite store
app.use(
  session({
    store: new SqliteStore({ db: 'civic_education.db' }),
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      sameSite: 'lax', // Allow form submissions from same site
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files - must come BEFORE CSRF protection
app.use(express.static(path.join(__dirname, 'public')));

// CSRF protection (must come after session and static files)
app.use(csrf({ cookie: false }));

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? req.session : null;
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.session = req.session;
  res.locals.isAdmin =
    !!req.session?.email &&
    !!process.env.ADMIN_EMAIL &&
    req.session.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (e) {
    res.locals.csrfToken = null;
  }
  next();
});

app.use(concurrentUserLimiter.middleware);

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
// Apply auth middleware within the levels route handler for data endpoints
app.use('/levels', levelsRoutes);

// Home page
app.get('/', (req, res) => {
  res.render('home');
});

// Dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard');
});

// Profile
app.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [user, levels, progressList, attempts] = await Promise.all([
      User.findById(userId),
      levelsStore.getLevels(),
      Progress.getAllProgress(userId),
      Progress.getRecentQuizAttempts(userId, 200),
    ]);

    const levelById = levels.reduce((acc, level) => {
      acc[level.id] = level;
      return acc;
    }, {});

    const completedLevelsCount = progressList.filter((item) => item.completed).length;
    const studiedLevelIds = new Set();
    progressList.forEach((item) => {
      if (item.completed || item.score !== null) {
        studiedLevelIds.add(Number(item.level_id));
      }
    });
    attempts.forEach((attempt) => {
      studiedLevelIds.add(Number(attempt.level_id));
    });

    const attemptsByLevel = attempts.reduce((acc, attempt) => {
      const key = Number(attempt.level_id);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(attempt);
      return acc;
    }, {});

    const studiedLevels = Array.from(studiedLevelIds)
      .map((levelId) => {
        const level = levelById[levelId];
        if (!level) {
          return null;
        }

        const levelAttempts = attemptsByLevel[levelId] || [];
        const bestScore = levelAttempts.length
          ? Math.max(...levelAttempts.map((item) => Number(item.score) || 0))
          : null;

        return {
          id: level.id,
          title: level.title,
          icon: level.icon,
          lessonsCount: Array.isArray(level.lessons) ? level.lessons.length : 0,
          attemptsCount: levelAttempts.length,
          bestScore,
          lastAttemptAt: levelAttempts[0]?.created_at || null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.attemptsCount - a.attemptsCount || a.id - b.id);

    const lessonsStudiedCount = studiedLevels.reduce((sum, level) => sum + level.lessonsCount, 0);
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((item) => (Number(item.score) || 0) >= 70).length;
    const averageScore = totalAttempts
      ? Math.round(attempts.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / totalAttempts)
      : 0;
    const bestScoreOverall = totalAttempts
      ? Math.max(...attempts.map((item) => Number(item.score) || 0))
      : 0;
    const totalQuestionsAttempted = attempts.reduce(
      (sum, item) => sum + (Number(item.total_questions) || 0),
      0
    );
    const totalCorrectAnswers = attempts.reduce(
      (sum, item) => sum + (Number(item.correct_count) || 0),
      0
    );
    const totalActivities = studiedLevels.length + lessonsStudiedCount + totalAttempts;

    const quizAttempts = attempts.map((attempt) => {
      const level = levelById[Number(attempt.level_id)];
      return {
        ...attempt,
        levelTitle: level?.title || `Level ${attempt.level_id}`,
      };
    });

    res.render('profile', {
      user,
      query: {
        deleteError: req.query.deleteError || null,
      },
      summary: {
        totalActivities,
        levelsStudiedCount: studiedLevels.length,
        lessonsStudiedCount,
        levelsCompletedCount: completedLevelsCount,
        totalAttempts,
        passedAttempts,
        averageScore,
        bestScoreOverall,
        totalQuestionsAttempted,
        totalCorrectAnswers,
      },
      studiedLevels,
      quizAttempts,
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).render('404', { error: 'Error loading profile data' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.warn('CSRF token validation failed for:', req.method, req.url);
    return res.status(403).render('403');
  }

  // Log error details
  console.error('Unhandled error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  // Generic error page in production, detailed in dev
  const errorMessage =
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(err.status || 500).render('404', { error: errorMessage });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ Civic Education App running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Session Secret configured: ${!!process.env.SESSION_SECRET}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
