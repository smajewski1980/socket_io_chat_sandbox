const btnSend = document.querySelector("#send");
const messagesDiv = document.querySelector(".messages");
const usersDiv = document.querySelector(".current-users");
const chatMessageInput = document.getElementById("chat-message");
const connQtyElem = document.querySelector(".conn-qty");
let currentSocketId;
let currUser = "";
const currUserSpan = document.querySelector(".curr-user");

btnSend.addEventListener("click", (e) => {
  e.preventDefault();
  socket.emit("chat-message", chatMessageInput.value);
  chatMessageInput.value = "";
  console.log("sending new chat message to server");
});

// function getUserName(id) {
//   const userObj = currentConnections.filter((con) => con.socketId === id)[0];
//   const userName = userObj;
//   if (userName.user !== undefined) {
//     return userName.user;
//   } else {
//     return "something went wrong";
//   }
// }

socket.on("connection", (msg) => {
  connQtyElem.textContent = `there are ${msg.connQty} users in the room`;
  if (!currentSocketId) {
    currentSocketId = msg.msg;
    currUserSpan.textContent = msg.user;
  }
  currUserSpan.textContent = msg.user;

  // currUser = currentSocketId;
  // currUserSpan.textContent = currentSocketId;
  // console.log(msg.msg);
});

socket.on("user-left-room", (msg) => {
  connQtyElem.textContent = `there are ${msg.connQty} users in the room`;
});

socket.on("new-chat-message", (msg) => {
  const pElem = document.createElement("p");
  pElem.classList.add("message");
  pElem.textContent = msg;

  messagesDiv.prepend(pElem);
});

function updateAttendees(arr) {
  usersDiv.textContent = "";
  arr.forEach((user) => {
    if (user.socketId === currentSocketId) {
      currUserSpan.textContent = user.user;
    }
    usersDiv.textContent += `${user.user}, `;
  });
}
socket.on("room-qty-change", (msg) => {
  updateAttendees(msg);
});

socket.on("server-restart", (msg) => {
  console.log(msg);
  location.reload();
});
