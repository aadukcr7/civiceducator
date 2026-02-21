# Civic Education Nepal

A full-stack civic learning platform that teaches constitutional rights, responsibilities, and civic behavior through structured lessons, quizzes, and progress analytics.

## Live Deployment

- **Production URL:** https://civiceducator.onrender.com/

## What This Project Does

This project provides a guided civic education experience where users can study lesson content, take level-based quizzes, and track their learning progress over time. It combines content delivery, adaptive assessment, and performance insights in one web application.

Core capabilities:

- User registration, login, and session-based authentication
- Level-based civic lessons and quizzes
- Adaptive quiz behavior based on recent performance and speed
- Learner dashboard with score history and topic-level analytics
- Admin panel for managing levels, lessons, quizzes, and users

## Who This Project Helps

- **Students and self-learners** who want practical civic knowledge in a structured format
- **Teachers and trainers** who need measurable learning activities for civic instruction
- **Community organizations / NGOs** that run civic awareness programs
- **Administrators and maintainers** who need a manageable content platform without frequent code changes

## How It Works

### 1. Authentication and Access

- Users register and sign in through secure auth routes
- Passwords are hashed with `bcryptjs`
- Sessions are persisted using `express-session` + `connect-sqlite3`
- Optional concurrent-user limiting can control active logins

### 2. Learning and Assessment Flow

- Learners open a level and study the lesson content
- Quiz questions are served with randomization and anti-repeat logic
- On submission, the app computes score, correctness, and completion status
- Progress is stored and shown in dashboard/profile views

### 3. Adaptive Quiz and Recommendations

- Quiz attempt history (score + time data) is stored per learner
- Difficulty can be adapted (`easy`, `medium`, `hard`) based on recent attempts
- For larger quizzes, question counts can be configured via environment variables
- The app highlights stronger/weaker topics and recommends next learning steps

### 4. Admin Content Management

- Admin users can create, edit, and remove levels and lessons
- Quiz question banks can be updated from the admin interface
- User management supports account control operations

## Technical Overview

- **Backend:** Node.js, Express
- **Views:** EJS (server-rendered)
- **Database:** SQLite (`sqlite3`)
- **Sessions:** `connect-sqlite3`
- **Security:** `helmet`, `express-rate-limit`, `csurf`, `express-validator`
- **Observability:** `morgan` request logging

## Project Structure

```text
civiceducator/
  config/           # Database setup and initialization
  controllers/      # Request handlers for auth, levels, admin
  data/             # Level content and store utilities
  middleware/       # Auth and concurrent-user controls
  models/           # User and progress database operations
  public/           # Static CSS/JS assets
  routes/           # Route definitions (auth, levels, admin)
  services/         # Business logic (analytics, quiz, profile)
  validators/       # Input validation rules
  views/            # EJS templates (learner + admin)
  server.js         # Application bootstrap
```

## Getting Started Locally

### Prerequisites

- Node.js `>=14`
- npm `>=6`

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the project root and configure at least:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-strong-secret
ADMIN_EMAIL=admin@example.com
MAX_CONCURRENT_USERS=0
ADAPTIVE_QUIZ_QUESTION_COUNT=12
MAX_PORT_RETRIES=10
```

### Run the Application

```bash
npm start
```

Development mode:

```bash
npm run dev
```

## Scripts

- `npm start` - Start the application
- `npm run dev` - Start with nodemon for development
- `npm run format` - Format files with Prettier
- `npm run check-format` - Check formatting

## Deployment

The application is deployed on Render:

- https://civiceducator.onrender.com/

`Procfile` is included for web process startup:

```text
web: node server.js
```

## License

ISC
