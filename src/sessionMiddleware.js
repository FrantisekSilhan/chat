// sessionMiddleware.js
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

const sessionMiddleware = session({
  store: new SQLiteStore({
    db: "sessions.db",
    concurrentDB: true,
  }),
  secret: "your-secret-key",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
  },
});

module.exports = { sessionMiddleware };