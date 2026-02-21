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
      const sql = 'SELECT id, username, email, is_disabled, created_at FROM users WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // List all users
  static async listAll() {
    return new Promise((resolve, reject) => {
      const sql =
        'SELECT id, username, email, is_disabled, created_at FROM users ORDER BY created_at DESC';
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  }

  // Count all users
  static async countAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) as count FROM users';
      db.get(sql, [], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? row.count : 0);
      });
    });
  }

  // Disable or enable a user
  static async setDisabled(userId, isDisabled) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET is_disabled = ? WHERE id = ?';
      db.run(sql, [isDisabled ? 1 : 0, userId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: userId, isDisabled: !!isDisabled, changes: this.changes });
      });
    });
  }

  // Update password
  static async updatePassword(userId, plainPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
        if (err) {
          return reject(err);
        }

        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        db.run(sql, [hashedPassword, userId], function (updateErr) {
          if (updateErr) {
            return reject(updateErr);
          }
          resolve({ id: userId, changes: this.changes });
        });
      });
    });
  }

  static generateTempPassword() {
    return Math.random().toString(36).slice(-10) + 'A1!';
  }

  // Delete user account and related records
  static async deleteAccount(userId) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run('DELETE FROM quiz_attempts WHERE user_id = ?', [userId], (attemptsErr) => {
          if (attemptsErr) {
            return db.run('ROLLBACK', () => reject(attemptsErr));
          }

          db.run('DELETE FROM progress WHERE user_id = ?', [userId], (progressErr) => {
            if (progressErr) {
              return db.run('ROLLBACK', () => reject(progressErr));
            }

            db.run('DELETE FROM users WHERE id = ?', [userId], function (userErr) {
              if (userErr) {
                return db.run('ROLLBACK', () => reject(userErr));
              }

              if (this.changes === 0) {
                return db.run('ROLLBACK', () => reject(new Error('User not found')));
              }

              db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  return db.run('ROLLBACK', () => reject(commitErr));
                }

                resolve({ id: userId, deleted: true });
              });
            });
          });
        });
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
          COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as total_completed,
          AVG(score) as average_score
        FROM progress 
        WHERE user_id = ?
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
