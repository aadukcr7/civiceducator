# Civic Education Nepal

Civic Education Nepal is an interactive learning platform that helps people understand civic responsibilities, constitutional values, social behavior, public systems, and informed digital citizenship in a practical way.

It combines lesson-based learning with quizzes, adaptive difficulty, progress tracking, and analytics so learners can see where they are improving and what to study next.

## What This Project Does

- Delivers structured civic learning levels with readable lessons and quizzes
- Tracks each learner's progress, score history, and level completion
- Uses adaptive quiz behavior (difficulty + question selection) based on recent performance and time-to-complete
- Provides learner analytics (strengths, weak areas, recommended next lesson)
- Offers an admin panel for managing levels, lessons, and quiz questions

## Who This Helps

- **Students and learners:** understand civic concepts in a guided, measurable format
- **Teachers and trainers:** use levels/quizzes to support civic classes and revision
- **Community programs and NGOs:** deliver awareness modules in a lightweight web app
- **Project maintainers/admins:** manage content without changing code each time

## How the System Works

### 1) Authentication and Sessions

- Users register/login through secure routes
- Passwords are hashed with `bcryptjs`
- Sessions are stored in SQLite using `connect-sqlite3`
- Optional concurrent-user limiting can restrict active logged-in sessions

### 2) Learning Flow

- A learner opens a level and studies the lesson content
- Quiz questions are presented with randomization + anti-repeat logic
- On submit, score and completion are calculated and saved
- Results are shown immediately with per-question correctness

### 3) Adaptive Quiz Engine

- Recent attempts (scores + duration per question) are stored in `quiz_attempts`
- The app recommends next difficulty (`easy`, `medium`, `hard`) per level
- For larger quizzes, a configurable number of questions is selected adaptively
- Question order is shuffled while avoiding repeated lead/question patterns

### 4) Analytics and Recommendation

- Dashboard aggregates topic-wise attempts, average score, and average speed
- Learners see strengths and weak areas
- The system recommends a next lesson based on weakest current topic and progress state

### 5) Admin Content Management

- Admins can create/update/delete levels
- Admins can manage lessons and quiz questions from UI
- User management includes disable/enable and password reset actions

## Technical Architecture

### Backend

- **Runtime:** Node.js + Express
- **Templating:** EJS server-rendered views
- **Persistence:** SQLite (`sqlite3`)
- **Session store:** `connect-sqlite3`

### Security and Reliability

- `helmet` for secure headers and CSP
- `express-rate-limit` to reduce abuse
- `csurf` for CSRF protection in forms
- `express-validator` for server-side input checks
- Centralized error handling and request logging (`morgan`)

### Key Modules

- `server.js` – app bootstrap, middleware chain, route mounting
- `routes/auth.js` – registration/login/logout flows
- `routes/levels.js` – learner levels, quizzes, adaptive logic, analytics endpoint
- `routes/admin.js` – admin content and user management
- `models/User.js`, `models/Progress.js` – database access and domain operations
- `config/database.js` – table creation and DB initialization
- `data/levels.js` + `data/levelsStore.js` – default and editable content source

## Data Model (High Level)

- **users**: account identity, hashed password, disabled state
- **progress**: per-user, per-level latest completion and score
- **quiz_attempts**: attempt history with score, correctness counts, duration, difficulty
- **sessions**: active session persistence for login state

## Environment Configuration

Copy `.env.example` to `.env` and set values:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=change-this-to-a-strong-random-secret
DATABASE_PATH=./civic_education.db
PASSING_SCORE=70

# Optional features
MAX_CONCURRENT_USERS=100
ADAPTIVE_QUIZ_QUESTION_COUNT=12

# Admin access control (recommended)
ADMIN_EMAIL=admin@example.com
```

### Important Notes

- Set `MAX_CONCURRENT_USERS=0` (or unset) to disable concurrent-user limiting
- `ADAPTIVE_QUIZ_QUESTION_COUNT` controls adaptive quiz size for larger quizzes
- In production, use a strong `SESSION_SECRET` and HTTPS

## Getting Started

### Prerequisites

- Node.js `>=14` (recommended `>=16`)
- npm `>=6`

### Install

```bash
npm install
```

### Run

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

App URL: `http://localhost:5000`

## Scripts

- `npm start` – run production server
- `npm run dev` – run with nodemon
- `npm run format` – format code with Prettier
- `npm run check-format` – verify formatting

## Project Structure

```text
civiceducator/
   server.js
   config/
      database.js
   data/
      levels.js
      levelsStore.js
   middleware/
      auth.js
      concurrentUsers.js
   models/
      User.js
      Progress.js
   routes/
      auth.js
      levels.js
      admin.js
   views/
      admin/
      partials/
   public/
      css/
      js/
   Procfile
   README.md
```

## Deployment Notes

- `Procfile` is included for Heroku-style process startup (`web: node server.js`)
- SQLite works for small/single-instance deployments; for larger scale consider moving to managed DB
- Ensure production env vars are configured in hosting platform

## Roadmap Ideas

- More question metadata/tags for stronger difficulty classification
- Explanation-based feedback after each question
- Badges/streaks and richer engagement loops
- Exportable analytics for teachers/program coordinators

## Contribution

- Keep changes focused and consistent with existing style
- Prefer small PRs with clear descriptions
- Include validation steps for behavior changes

## License

This project currently uses the license defined in `package.json`. Update as needed for distribution.
