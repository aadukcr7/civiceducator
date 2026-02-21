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
          COUNT(CASE WHEN score IS NOT NULL THEN 1 END) as completed_count,
          AVG(score) as avg_score
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

  static async countQuizAttempts(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?';
      db.get(sql, [userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? row.count : 0);
      });
    });
  }

  static async getQuizAttemptsPage(userId, limit = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT *
        FROM quiz_attempts
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `;

      db.all(sql, [userId, limit, offset], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  }

  static async getQuizAttemptSummary(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          COUNT(*) as total_attempts,
          SUM(CASE WHEN score >= 70 THEN 1 ELSE 0 END) as passed_attempts,
          AVG(score) as average_score,
          MAX(score) as best_score,
          SUM(COALESCE(total_questions, 0)) as total_questions,
          SUM(COALESCE(correct_count, 0)) as total_correct
        FROM quiz_attempts
        WHERE user_id = ?
      `;

      db.get(sql, [userId], (err, row) => {
        if (err) {
          return reject(err);
        }

        resolve({
          totalAttempts: row?.total_attempts || 0,
          passedAttempts: row?.passed_attempts || 0,
          averageScore: row?.average_score ? Math.round(row.average_score) : 0,
          bestScoreOverall: row?.best_score || 0,
          totalQuestionsAttempted: row?.total_questions || 0,
          totalCorrectAnswers: row?.total_correct || 0,
        });
      });
    });
  }

  static async getAttemptStatsByLevel(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          level_id,
          COUNT(*) as attempts_count,
          MAX(score) as best_score
        FROM quiz_attempts
        WHERE user_id = ?
        GROUP BY level_id
      `;

      db.all(sql, [userId], (err, rows) => {
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

  // Reset user's learning data while keeping account
  static async resetLearningData(userId) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run('DELETE FROM quiz_attempts WHERE user_id = ?', [userId], function (attemptsErr) {
          if (attemptsErr) {
            return db.run('ROLLBACK', () => reject(attemptsErr));
          }

          const deletedAttempts = this.changes || 0;

          db.run('DELETE FROM progress WHERE user_id = ?', [userId], function (progressErr) {
            if (progressErr) {
              return db.run('ROLLBACK', () => reject(progressErr));
            }

            const deletedProgress = this.changes || 0;

            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                return db.run('ROLLBACK', () => reject(commitErr));
              }

              resolve({
                userId,
                deletedAttempts,
                deletedProgress,
              });
            });
          });
        });
      });
    });
  }
}

module.exports = Progress;
