// socket.js
const { sessionMiddleware } = require("./sessionMiddleware");
const { getRandomColor } = require("./random-color")

function initializeSocket(io, db) {
  /* session initialization */
  io.use((socket, next) => {
    const fakeRes = {
      setHeader: () => {},
      end: () => {},
    };

    sessionMiddleware(socket.request, fakeRes, next);
  });

  /* io connection */
  io.on("connection", async (socket) => {
    socket.username = "guest";
    socket.color = getRandomColor();
    
    socket.handshake.address = socket.handshake.headers["x-forwarded-for"] ?? socket.handshake.address;

    const sessionID = socket.request.session.id;

    io.emit("connectionCount", io.sockets.sockets.size);

    try {
      await db.run("BEGIN TRANSACTION");

      const sessionRecord = await db.get("SELECT id FROM sessions WHERE session = ?", sessionID);
      socket.sesid = sessionRecord?.id;
      
      if (!sessionRecord) {
        const result = await db.run("INSERT INTO sessions (session) VALUES (?)", sessionID);
        socket.sesid = result.lastID;
      }
      const userRecord = await db.get("SELECT username, color FROM users WHERE id = ?", socket.sesid);
      if (userRecord) {
        socket.username = userRecord.username;
        socket.color = userRecord.color;
      } else {
        await db.run("INSERT INTO users (ip, username, color, id) VALUES (?, ?, ?, ?)", socket.handshake.address, socket.username, socket.color, socket.sesid);
      }

      io.to(socket.id).emit("initialUserInfo", { username: socket.username, color: socket.color });
      await db.run("COMMIT");
    } catch (e) {
      console.error(e);
      socket.disconnect();

      try {
        await db.run("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    /* * */
    socket.on("disconnect", () => {
      io.emit("connectionCount", io.sockets.sockets.size);
    });

    socket.on("setUsername", async (username) => {
      try {
        socket.username = username;

        const existingUser = await db.get("SELECT * FROM users WHERE id = ?", socket.sesid);

        if (existingUser) {
          await db.run("UPDATE users SET username = ? WHERE id = ?", socket.username, socket.sesid);
        } else {
          await db.run("INSERT INTO users (ip, username, color, id) VALUES (?, ?, ?, ?)", socket.handshake.address, socket.username, socket.color, socket.sesid);
        }
        
      } catch (e) {
        console.error("Error setting username:", error);
      }
    });

    socket.on("setColor", async (color) => {
      try {
        socket.color = color;

        const existingUser = await db.get("SELECT * FROM users WHERE id = ?", socket.sesid);

        if (existingUser) {
          await db.run("UPDATE users SET color = ? WHERE id = ?", socket.color, socket.sesid);
        } else {
          await db.run("INSERT INTO users (ip, username, color, id) VALUES (?, ?, ?, ?)", socket.handshake.address, socket.username, socket.color, socket.sesid);
        }
        
      } catch (e) {
        console.error("Error setting color:", error);
      }
    });

    socket.on("chatMessage", async (msg) => {
      if (msg.length > 2048) {
        return;
      }
      let result;
      try {
        result = await db.run("INSERT INTO messages (content, timestamp, uid) VALUES (?, CURRENT_TIMESTAMP, ?)", msg, socket.sesid);
      } catch (e) {
        console.error(e);
        return;
      }

      const timestampRecord = await db.get("SELECT timestamp FROM messages WHERE id = ?", result.lastID);
      io.emit("chatMessage", msg, result.lastID, timestampRecord.timestamp, socket.username, socket.color);
    });

    if (!socket.recovered) {
      try {
        await db.each(
          "SELECT m.id, m.content, m.timestamp, u.username, u.color FROM messages m JOIN users u ON m.uid = u.id WHERE m.id > ?",
          [socket.handshake.auth.serverOffset ?? 0],
          (_err, row) => {
            socket.emit("chatMessage", row.content, row.id, row.timestamp, row.username, row.color);
          }
        );
      } catch (e) {
        console.error(e);
      }
    }
  });
}

module.exports = { initializeSocket };
