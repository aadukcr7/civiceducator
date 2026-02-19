const db = require('../config/database');

class Progress {
  // Get user's progress for a specific level
  static async getProgress(userId, levelId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM progress WHERE user_id = ? AND level_id = ?';
      db.get(sql, [userId, levelId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  // Get all progress for a user
  static async getAllProgress(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM progress WHERE user_id = ? ORDER BY level_id';
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  // Save or update progress
  static async saveProgress(userId, levelId, score, completed = true) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO progress (user_id, level_id, score, completed, completed_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, level_id) 
        DO UPDATE SET 
          score = ?,
          completed = ?,
          completed_at = CURRENT_TIMESTAMP
      `;

      db.run(
        sql,
        [userId, levelId, score, completed ? 1 : 0, score, completed ? 1 : 0],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve({ id: this.lastID, userId, levelId, score, completed });
        }
      );
    });
  }

  // Get completion statistics
  static async getStats(userId, totalLevels) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count,
          AVG(CASE WHEN completed = 1 THEN score END) as avg_score
        FROM progress 
        WHERE user_id = ?
      `;

      db.get(sql, [userId], (err, row) => {
        if (err) {
          return reject(err);
        }

        const completedCount = row.completed_count || 0;
        const avgScore = row.avg_score ? Math.round(row.avg_score) : 0;
        const progressPercentage =
          totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

        resolve({
          completedCount,
          totalLevels,
          progressPercentage,
          avgScore,
        });
      });
    });
  }

  // Global completion statistics
  static async getGlobalStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count,
          AVG(CASE WHEN completed = 1 THEN score END) as avg_score
        FROM progress
      `;

      db.get(sql, [], (err, row) => {
        if (err) {
          return reject(err);
        }

        resolve({
          completedCount: row?.completed_count || 0,
          averageScore: row?.avg_score ? Math.round(row.avg_score) : 0,
        });
      });
    });
  }

  // Check if level is completed
  static async isLevelCompleted(userId, levelId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT completed FROM progress WHERE user_id = ? AND level_id = ?';
      db.get(sql, [userId, levelId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row && row.completed === 1);
      });
    });
  }

  // Get completed levels list
  static async getCompletedLevels(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT level_id FROM progress WHERE user_id = ? AND completed = 1';
      db.all(sql, [userId], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.map((row) => row.level_id));
      });
    });
  }

  // Save individual quiz attempt metrics
  static async saveQuizAttempt({
    userId,
    levelId,
    score,
    correctCount,
    totalQuestions,
    durationSeconds,
    difficulty,
  }) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO quiz_attempts (
          user_id, level_id, score, correct_count, total_questions, duration_seconds, difficulty
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        sql,
        [
          userId,
          levelId,
          score,
          correctCount,
          totalQuestions,
          durationSeconds,
          difficulty || 'medium',
        ],
        function (err) {
          if (err) {
            return reject(err);
          }

          resolve({
            id: this.lastID,
            userId,
            levelId,
            score,
            correctCount,
            totalQuestions,
            durationSeconds,
            difficulty: difficulty || 'medium',
          });
        }
      );
    });
  }

  // Get recent quiz attempts across all levels
  static async getRecentQuizAttempts(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT *
        FROM quiz_attempts
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `;

      db.all(sql, [userId, limit], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  }

  // Get recent attempts for a specific level
  static async getRecentQuizAttemptsForLevel(userId, levelId, limit = 3) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT *
        FROM quiz_attempts
        WHERE user_id = ? AND level_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `;

      db.all(sql, [userId, levelId, limit], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  }
}

module.exports = Progress;
