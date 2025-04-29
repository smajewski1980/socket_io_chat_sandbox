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
let currentUserId = 1;

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
  currentConnections.push({
    user: `user ${currentUserId}`,
    socketId: socket.id,
    username: "",
  });
  socket.on("newUsername", (newUser) => {
    const idx = currentConnections.findIndex((item) => {
      return item.socketId === newUser.userSocketId;
    });
    currentConnections[idx].username = newUser.username;
    io.emit("room-qty-change", currentConnections);
    io.emit("new-chat-message", `${newUser.username} joined the room.`);
  });
  currentUserId++;
  io.emit("connection", {
    msg: socket.id,
    name: getUserName(socket.id),
    connQty: currentConnections.length,
  });
  io.emit("room-qty-change", currentConnections);

  socket.on("chat-message", (msg) => {
    if (msg.chatMsg !== "") {
      io.emit("new-chat-message", `${msg.username}: ${msg.chatMsg}`);
    }
  });
  socket.on("disconnect", (socket) => {
    const idx = currentConnections.findIndex(
      (conn) => conn.socketId == socket.id
    );
    let userLeft = currentConnections.splice(idx, 1);
    console.log(userLeft[0].username);

    io.emit("user-left-room", { connQty: currentConnections.length });
    io.emit("new-chat-message", `${userLeft[0].username} left the room.`);
    io.emit("room-qty-change", currentConnections);
  });
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, (req, res, next) => {
  console.log(`listening on port: ${PORT}`);
});
