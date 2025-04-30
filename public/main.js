const btnSend = document.querySelector("#send");
const messagesDiv = document.querySelector(".messages");
const usersDiv = document.querySelector(".current-users");
const chatMessageInput = document.getElementById("chat-message");
const connQtyElem = document.querySelector(".conn-qty");
let currentSocketId;
let currUser = getUserFromUrl();
const currUserSpan = document.querySelector(".curr-user");
const loginUsername = document.getElementById("username");
const btnEnter = document.getElementById("btn-enter");
const btnLeave = document.querySelector(".btn-leave");

btnSend.addEventListener("click", (e) => {
  e.preventDefault();
  socket.emit("chat-message", {
    chatMsg: chatMessageInput.value,
    username: currUser,
  });
  chatMessageInput.value = "";
  console.log("sending new chat message to server");
});

function getUserFromUrl() {
  const queryString = location.search;
  const idx = queryString.indexOf("=") + 1;
  const username = queryString.slice(idx);
  const decodedName = decodeURIComponent(username.replace(/\+/g, " "));
  console.log(decodedName);
  return decodedName;
}
currUserSpan.textContent = `Username: ${currUser}`;

socket.on("connection", (msg) => {
  connQtyElem.textContent = `there are ${msg.connQty} users in the room`;
  if (!currentSocketId) {
    currentSocketId = msg.msg;
    console.log(msg.msg);
    console.log(currUser);
    socket.emit("newUsername", {
      userSocketId: msg.msg,
      username: currUser,
    });
  }
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
  console.log(arr);
  arr.forEach((user, idx) => {
    if (idx === arr.length - 1) {
      usersDiv.textContent += `${user.username}`;
    } else {
      usersDiv.textContent += `${user.username}, `;
    }
  });
}
socket.on("room-qty-change", (msg) => {
  updateAttendees(msg);
});

function handleLeave(e) {
  e.preventDefault();
  socket.emit("leave");
  location.href = "/index.html";
}

btnLeave.addEventListener("click", handleLeave);
