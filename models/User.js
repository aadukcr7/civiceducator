const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(username, email, password) {
    return new Promise((resolve, reject) => {
      // Hash password with 10 salt rounds
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return reject(err);
        }

        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.run(sql, [username, email, hashedPassword], function (err) {
          if (err) {
            return reject(err);
          }
          resolve({ id: this.lastID, username, email });
        });
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Find user by username
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE username = ?';
      db.get(sql, [username], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user statistics
  static async getStats(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_completed,
          AVG(score) as average_score
        FROM progress 
        WHERE user_id = ? AND completed = 1
      `;
      db.get(sql, [userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve({
          totalCompleted: row.total_completed || 0,
          averageScore: row.average_score ? Math.round(row.average_score) : 0,
        });
      });
    });
  }
}

module.exports = User;
