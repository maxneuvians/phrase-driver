const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/phrasedriver.db');
const db = new sqlite3.Database(dbPath);

// Initialize the table if it doesn't exist
function initDB() {
    db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    english TEXT NOT NULL,
    french TEXT NOT NULL,
    original_sentence TEXT NOT NULL,
    corrected_sentence TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

function saveResult({ category, english, french, original_sentence, corrected_sentence }) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO results (category, english, french, original_sentence, corrected_sentence) VALUES (?, ?, ?, ?, ?)`,
            [category, english, french, original_sentence, corrected_sentence],
            function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            }
        );
    });
}

module.exports = { db, initDB, saveResult };
