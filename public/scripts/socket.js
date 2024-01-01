const chat = document.getElementById("chat");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

const infoConnections = document.getElementById("info-connections");

const usernameForm = document.getElementById("username-form")
const usernameFormInput = document.getElementById("username-form-input");

const colorFormInput = document.getElementById("color-form-input");

const socket = io({
  auth: {
    serverOffset: 0
  }
});

usernameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newUsername = usernameFormInput.value;
  if (newUsername) {
    socket.emit("setUsername", newUsername);
    usernameFormInput.placeholder = newUsername;
    usernameFormInput.value = "";
  }
});

function setColor() {
  const newColor = colorFormInput.value;
  if (newColor) {
    socket.emit("setColor", newColor);
    usernameFormInput.style.setProperty("--color", newColor);
    colorFormInput.style.backgroundColor = newColor;
  }
}

chat.addEventListener("submit", (e) => {
  e.preventDefault();
  if (chatInput.value) {
    socket.emit("chatMessage", chatInput.value);
    chatInput.value = "";
  }
});

socket.on("chatMessage", (msg, serverOffset, timestamp, username, color) => {
  const item = document.createElement("li");
  item.classList.add("message")

  const usernameSpan = document.createElement("span");
  usernameSpan.textContent = username ?? "guest";
  usernameSpan.classList.add("message__username");
  usernameSpan.style.color = color;

  const timestampSpan = document.createElement("span");
  timestampSpan.textContent = `${timestamp} `;
  timestampSpan.classList.add("message__timestamp");

  item.appendChild(timestampSpan);
  item.appendChild(usernameSpan);
  for (const node of parseMessage(msg)) {
    console.log(node);
    item.appendChild(node)
  }

  chatMessages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  socket.auth.serverOffset = serverOffset;
});

socket.on("connectionCount", (count) => {
  infoConnections.textContent = count;
});

socket.on("initialUserInfo", (userInfo) => {
  usernameFormInput.placeholder = userInfo.username;
  usernameFormInput.style.setProperty("--color", userInfo.color);
  colorFormInput.value = userInfo.color;
  colorFormInput.style.backgroundColor = userInfo.color;
});

function parseMessage(msg) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const splitMsg = msg.split(urlRegex);

  if (splitMsg.length === 1) {
    return [
      document.createTextNode(`: ${msg}`)
    ]
  }

  let result = [document.createTextNode(": ")];

  for (let i = 0; i < splitMsg.length; i++) {
    let e;
    if (i % 2 === 0) {
      e = document.createTextNode(splitMsg[i])
    } else {
      e = document.createElement("a")
      e.target = "_blank"
      e.href = splitMsg[i];
      e.innerText = splitMsg[i];
    }
    result = [...result, e]
  }

  return result;
}
