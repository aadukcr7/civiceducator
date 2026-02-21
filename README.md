# Civic Education Nepal

<p align="center">
  <strong>A full-stack civic learning platform for rights, responsibilities, and informed citizenship.</strong>
</p>

<p align="center">
  <a href="https://civiceducator.onrender.com/">Live Demo</a> •
  <a href="#what-this-project-does">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#getting-started-locally">Setup</a>
</p>

---

## Live Deployment

- **Production URL:** https://civiceducator.onrender.com/

## What This Project Does

This application delivers structured civic education through lessons and quizzes, then tracks each learner’s progress with analytics and recommendations. It is designed to make civic learning practical, measurable, and easy to manage.

### Core Features

- Secure user registration and login
- Level-based lessons and quizzes
- Adaptive quiz behavior from recent performance
- Dashboard insights for strengths and weak areas
- Admin tools for content and learner management

## Who This Project Helps

- **Students and self-learners:** learn civic topics in a guided, trackable format
- **Teachers and trainers:** use measurable quizzes for practice and revision
- **Community programs and NGOs:** run civic awareness modules online
- **Admins and maintainers:** manage lessons and quiz content efficiently

## How It Works

### 1) Authentication & Session Management

- Users sign up and log in through secure auth routes
- Passwords are hashed with `bcryptjs`
- Sessions are stored with `express-session` + `connect-sqlite3`

### 2) Lesson and Quiz Flow

- Learners study a level lesson, then attempt the quiz
- Questions are randomized with anti-repeat behavior
- Scores and progress are calculated and saved after submission

### 3) Adaptive Learning Logic

- Past attempts (score and timing) influence quiz difficulty
- Difficulty is adjusted across `easy`, `medium`, and `hard`
- The app recommends next learning focus from weaker areas

### 4) Admin Content Operations

- Admin panel supports create/edit/delete for levels and lessons
- Quiz questions can be managed without direct code edits
- User access and account actions are available to admins

## Screenshots

### Homepage

![Homepage](images/homepage.jpg)

### Login

![Login](images/login.jpg)

### Levels

![Levels](images/levels.jpg)

### Dashboard

![Dashboard](images/dashboard.jpg)

## Technical Overview

- **Backend:** Node.js, Express
- **Template Engine:** EJS (server-rendered)
- **Database:** SQLite (`sqlite3`)
- **Security:** `helmet`, `express-rate-limit`, `csurf`, `express-validator`
- **Session Store:** `connect-sqlite3`
- **Logging:** `morgan`

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

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-strong-secret
ADMIN_EMAIL=admin@example.com
MAX_CONCURRENT_USERS=0
ADAPTIVE_QUIZ_QUESTION_COUNT=12
MAX_PORT_RETRIES=10
```

### Run

```bash
npm start
```

Development mode:

```bash
npm run dev
```

## Scripts

- `npm start` - Start server
- `npm run dev` - Start with nodemon
- `npm run format` - Format files with Prettier
- `npm run check-format` - Check formatting

## Deployment

Hosted on Render: https://civiceducator.onrender.com/

`Procfile` process definition:

```text
web: node server.js
```

## License

ISC
