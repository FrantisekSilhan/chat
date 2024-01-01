// app.js
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");

const { createServer } = require("http");

const { initializeDatabase } = require("./database");
const { initializeSocket } = require("./socket");
const { sessionMiddleware } = require("./sessionMiddleware");

const { Server } = require("socket.io");

const path = require("path");

async function main() {
  /* setup */
  const db = await initializeDatabase();

  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"))
  app.set("layout", "layouts/main-layout");
  
  app.use(cookieParser());
  app.use(sessionMiddleware);

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(expressLayouts);

  const server = createServer(app);
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  initializeSocket(io, db);


  /* routes */
  app.get("/", (req, res) => {
    res.render("index", {});
  });

  /* error handling */
  app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
  });
  
  app.use((err, req, res, next) => {
    const errorCode = err.status ?? 500;
    const errorMessage = err.message ?? "Internal Server Error";
  
    if (errorCode !== 404)
      console.error(err);
  
    res.status(errorCode).render("error", { errorCode, errorMessage });
  });


  /* listen */
  server.listen(6969, () => {
    console.log("server running at http://localhost:6969");
  });
}

main();