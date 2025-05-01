const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));
app.set("socketio", io);

app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/public/index.html");
});

let currentConnections = [];

function getUserName(id) {
  const userObj = currentConnections.filter((con) => con.socketId === id)[0];
  const userName = userObj;
  if (userName.user) {
    return userName.user;
  } else {
    return "something went wrong";
  }
}

io.on("connection", (socket) => {
  // console.log("just connected socket id: " + socket.id);
  currentConnections.push({
    socketId: socket.id,
    username: "",
    room: "",
  });

  socket.on("newUsername", (newUser) => {
    const idx = currentConnections.findIndex((item) => {
      return item.socketId === newUser.userSocketId;
    });
    currIdx = idx;

    currentConnections[idx].username = newUser.username;
    currentConnections[idx].room = newUser.room;

    socket.join(newUser.room);

    io.to(newUser.room).emit("room-qty-change", currentConnections);
    io.to(newUser.room).emit("new-chat-message", {
      message: `${newUser.username} joined the room.`,
      joining: true,
    });
  });
  io.emit("connection", {
    msg: socket.id,
    name: getUserName(socket.id),
    connQty: currentConnections,
  });

  io.emit("room-qty-change", currentConnections);

  socket.on("chat-message", (msg) => {
    if (msg.chatMsg !== "") {
      io.to(msg.room).emit("new-chat-message", {
        username: msg.username,
        message: msg.chatMsg,
      });
    }
  });
  socket.on("disconnect", () => {
    const idx = currentConnections.findIndex(
      (conn) => conn.socketId === socket.id
    );
    let userLeft = currentConnections.splice(idx, 1);

    const room = userLeft[0].room;
    const roomQty = currentConnections.filter(
      (con) => con.room === room
    ).length;

    io.to(room).emit("new-chat-message", {
      message: `${userLeft[0].username} left the room.`,
      joining: true,
    });
    io.emit("room-qty-change", currentConnections);
  });
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, (req, res, next) => {
  console.log(`listening on port: ${PORT}`);
});
