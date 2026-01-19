# Civic Education Nepal

A secure, modern web application to learn Nepal's Constitution (2072), civic duties, social responsibility, and digital citizenship — complete with structured lessons, quizzes, and progress tracking.

## Features

- Secure auth: session-based login, bcrypt-hashed passwords
- SQLite-backed sessions and progress tracking
- Strong input validation, CSRF protection, Helmet, rate limiting
- EJS + Bootstrap 5 UI with responsive, professional design
- Dark mode with persistent theme toggle
- 6 learning levels with lessons and quizzes, dashboard overview
- Deployment-ready setup (Procfile, `.env.example`)

## Tech Stack

- Node.js, Express.js, EJS
- SQLite (`sqlite3`), `connect-sqlite3` session store
- Security: `helmet`, `express-rate-limit`, `csurf`, `express-validator`
- Styling: Bootstrap 5, custom CSS

## Getting Started

1. Prerequisites
   - Node.js >= 16 recommended (>=14 supported)
   - npm >= 6

2. Install dependencies

```bash
npm install
```

3. Configure environment
   - Copy `.env.example` to `.env` and update values

```env
PORT=5000
SESSION_SECRET=change_me
DATABASE_PATH=./civic_education.db
PASSING_SCORE=70
```

4. Run the app

```bash
npm start     # production mode
npm run dev   # development (nodemon)
```

Visit: http://localhost:5000

## Project Structure

```
civic/
  server.js                # App entry
  routes/                  # Express routes (auth, levels)
  models/                  # DB models (User, Progress)
  middleware/              # Auth guards
  config/                  # Database init
  views/                   # EJS templates
  public/                  # Static assets (css, js)
  data/                    # Lessons & quizzes
  docs/                    # Additional documentation
  Procfile                 # Heroku process file
  .env.example             # Environment variable template
  README.md                # This file
```

## Scripts

- `npm start` — run server
- `npm run dev` — run with nodemon
- `npm run format` — format code with Prettier
- `npm run check-format` — check formatting

## Security & Best Practices

- Use strong `SESSION_SECRET` in production; set `secure` cookies behind HTTPS
- CSRF tokens are required on all forms; do not remove hidden `_csrf`
- Rate limiting is applied globally; tune thresholds per environment
- Input validation enforced server-side via `express-validator`

## Deployment

- Heroku: uses `Procfile` (`web: node server.js`)
- Ensure environment variables are set (`PORT`, `SESSION_SECRET`, `DATABASE_PATH`, `PASSING_SCORE`)
- Use persistent storage (e.g., Heroku SQLite plugin or external DB) for production needs

## Contributing

- Fork the repo, create a feature branch, and submit a PR
- Keep changes focused and maintain the established project style

## License

The project includes a default `license` field in `package.json`. Please confirm or update according to your publishing needs.
