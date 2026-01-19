const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'civic_education.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
      }
    }
  );

  // Progress table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      level_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      score INTEGER,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, level_id)
    )
  `,
    (err) => {
      if (err) {
        console.error('Error creating progress table:', err.message);
      } else {
        console.log('Progress table ready');
      }
    }
  );

  // Sessions table (used by connect-sqlite3)
  db.run(
    `
    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR PRIMARY KEY,
      sess TEXT NOT NULL,
      expired DATETIME NOT NULL
    )
  `,
    (err) => {
      if (err) {
        console.error('Error creating sessions table:', err.message);
      } else {
        console.log('Sessions table ready');
      }
    }
  );
});

module.exports = db;
