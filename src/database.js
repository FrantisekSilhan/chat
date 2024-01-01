// database.js
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function initializeDatabase() {
  const db = await open({
    filename: "chat.db",
    driver: sqlite3.Database
  });

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      ip TEXT,
      username TEXT,
      color TEXT,

      id INTEGER,
      FOREIGN KEY (id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT,
      timestamp TIMESTAMP,

      uid INTEGER,
      FOREIGN KEY (uid) REFERENCES sessions(id)
    );

  `);

  return db;
}

module.exports = { initializeDatabase };
