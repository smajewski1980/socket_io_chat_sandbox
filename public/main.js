const btnSend = document.querySelector("#send");
const messagesDiv = document.querySelector(".messages");
const usersDiv = document.querySelector(".current-users");
const chatMessageInput = document.getElementById("chat-message");
const connQtyElem = document.querySelector(".conn-qty");
let currentSocketId = null;
let currUser = getQueryVariable("username");
let currRoom = getQueryVaruable("room-name");
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

// going to try this func
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}
// **********************

// function getUserFromUrl() {
//   const queryString = location.search;
//   const idx = queryString.indexOf("=") + 1;
//   const username = queryString.slice(idx);
//   const decodedName = decodeURIComponent(username.replace(/\+/g, " "));
//   // console.log(decodedName);
//   return decodedName;
// }
// **********************

currUserSpan.textContent = `Username: ${currUser}`;

socket.on("connection", (msg) => {
  connQtyElem.textContent = `there are ${msg.connQty} users in the room`;

  console.log(msg.msg);
  // console.log(currUser);
  if (currentSocketId === null) {
    socket.emit("newUsername", {
      userSocketId: msg.msg,
      username: currUser,
    });
  }
  currentSocketId = msg.msg;
  console.log(currentSocketId);
});

socket.on("user-left-room", (msg) => {
  connQtyElem.textContent = `there are ${msg.connQty} users in the room`;
});

socket.on("new-chat-message", (msg) => {
  const pElem = document.createElement("p");
  pElem.classList.add("message");
  pElem.textContent = ` ${msg.message}`;

  if (msg.username) {
    const spanElem = document.createElement("span");
    spanElem.classList.add("msg-user-span");
    spanElem.textContent = `${msg.username}:`;
    pElem.prepend(spanElem);
  }

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
