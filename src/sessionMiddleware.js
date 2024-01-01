// sessionMiddleware.js
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
require("dotenv").config();

const sessionMiddleware = session({
  store: new SQLiteStore({
    db: "sessions.db",
    concurrentDB: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
  },
});

module.exports = { sessionMiddleware };