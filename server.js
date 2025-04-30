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
// let currentUserId = 1;

function getUserName(id) {
  const userObj = currentConnections.filter((con) => con.socketId === id)[0];
  const userName = userObj;
  if (userName.user) {
    return userName.user;
  } else {
    return "something went wrong";
  }
}
// is the below func working???
const getRoomName = (id) => {
  const userObj = currentConnections.filter((con) => con.socketId === id)[0];
  const room = userObj.room;
  return room;
};

io.on("connection", (socket) => {
  // console.log("just connected socket id: " + socket.id);
  currentConnections.push({
    // user: `user ${currentUserId}`,
    socketId: socket.id,
    username: "",
    room: "",
  });

  socket.on("newUsername", (newUser) => {
    const idx = currentConnections.findIndex((item) => {
      return item.socketId === newUser.userSocketId;
    });
    currIdx = idx;
    // console.log(idx);
    // console.log(currentConnections);

    currentConnections[idx].username = newUser.username;
    currentConnections[idx].room = newUser.room;

    socket.join(newUser.room);

    io.to(newUser.room).emit("room-qty-change", currentConnections);
    io.to(newUser.room).emit("new-chat-message", {
      message: `${newUser.username} joined the room.`,
    });
    // console.log(newUser.username + " has joined the room");
  });
  // currentUserId++;

  // the next two emits need to have acces to the room
  io.emit("connection", {
    msg: socket.id,
    name: getUserName(socket.id),
    connQty: currentConnections.length,
  });

  io.emit("room-qty-change", currentConnections);
  // console.log(
  //   "this is supposed to be the room name: " + getRoomName(socket.id)
  // );
  // console.log("socketid: " + socket.id);
  // console.log("curr connections: " + currentConnections[0].socketId);
  // ****************

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
    console.log(socket.id);
    console.log(idx);
    console.log(currentConnections);
    let userLeft = currentConnections.splice(idx, 1);
    console.log(userLeft[0].username + " has left");
    console.log(currentConnections);

    io.emit("user-left-room", { connQty: currentConnections.length });
    io.to(userLeft[0].room).emit("new-chat-message", {
      message: `${userLeft[0].username} left the room.`,
    });
    io.emit("room-qty-change", currentConnections);
  });
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, (req, res, next) => {
  console.log(`listening on port: ${PORT}`);
});
