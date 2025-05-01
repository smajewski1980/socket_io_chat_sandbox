const btnSend = document.querySelector("#send");
const messagesDiv = document.querySelector(".messages");
const usersDiv = document.querySelector(".current-users");
const chatMessageInput = document.getElementById("chat-message");
const connQtyElem = document.querySelector(".conn-qty");
let currentSocketId = null;
let currUser = getQueryVariable("username");
let currRoom = getQueryVariable("room-name");
const currUserSpan = document.querySelector(".curr-user");
const loginUsername = document.getElementById("username");
const btnEnter = document.getElementById("btn-enter");
const btnLeave = document.querySelector(".btn-leave");
const roomNameSpan = document.querySelector("#room-name-span");

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      // return pair[1];
      return decodeURIComponent(pair[1].replace(/\+/g, " "));
    }
  }
  return false;
}

currUserSpan.textContent = `Username: ${currUser}`;
roomNameSpan.textContent = ` ${currRoom} `;

socket.on("connection", (msg) => {
  const filteredList = msg.connQty.filter((msg) => msg.room === currRoom);
  const qty = filteredList.length;
  console.log("filtered list: " + filteredList);
  console.log("qty: " + qty);

  console.log(msg.msg);
  if (currentSocketId === null) {
    socket.emit("newUsername", {
      userSocketId: msg.msg,
      username: currUser,
      room: currRoom,
    });
  }
  currentSocketId = msg.msg;
  console.log(currentSocketId);
});

socket.on("new-chat-message", (msg) => {
  const pElem = document.createElement("p");
  //make each users own messages justify left
  if (msg.joining) {
    pElem.classList.add("joining");
    pElem.classList.add("new-message");
    pElem.textContent = `${msg.message}`;
  } else {
    pElem.classList.add("message");
    pElem.classList.add("new-message");
    pElem.textContent = `: ${msg.message}`;
  }

  if (msg.username) {
    const spanElem = document.createElement("span");
    spanElem.classList.add("msg-user-span");
    spanElem.textContent = `${msg.username === currUser ? "me" : msg.username}`;
    pElem.prepend(spanElem);
  }

  messagesDiv.prepend(pElem);
  setTimeout(() => {
    pElem.classList.remove("new-message");
  }, 100);
  messagesDiv.scrollTop = 0;
});

function updateAttendees(arr) {
  usersDiv.textContent = "";
  console.log(arr);
  const filteredArr = arr.filter((obj) => {
    return obj.room === currRoom;
  });
  const qty = filteredArr.length;
  connQtyElem.textContent = `there ${qty === 1 ? "is" : "are"} ${qty} ${
    qty === 1 ? "user" : "users"
  } in this room`;

  filteredArr.forEach((user, idx) => {
    if (idx === filteredArr.length - 1) {
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
btnSend.addEventListener("click", (e) => {
  e.preventDefault();
  socket.emit("chat-message", {
    chatMsg: chatMessageInput.value,
    username: currUser,
    room: currRoom,
  });
  chatMessageInput.value = "";
  console.log("sending new chat message to server");
});
