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

function formatTimestamp(timestamp) {
  const messageTime = new Date(timestamp);

  const offset = new Date().getTimezoneOffset();

  const localTime = new Date(messageTime.getTime() - offset * 60000);

  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(localTime);
}

function setColor() {
  const newColor = colorFormInput.value;
  if (newColor) {
    socket.emit("setColor", newColor);
    usernameFormInput.style.setProperty("--color", newColor);
    colorFormInput.style.backgroundColor = newColor;
  }
}

usernameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newUsername = usernameFormInput.value;
  if (newUsername) {
    socket.emit("setUsername", newUsername);
    usernameFormInput.placeholder = newUsername;
    usernameFormInput.value = "";
  }
});

chat.addEventListener("submit", (e) => {
  e.preventDefault();
  if (chatInput.value) {
    socket.emit("chatMessage", chatInput.value);
    chatInput.value = "";
  }
});

socket.on("chatMessage", (msg, serverOffset, timestamp, username, color) => {
  timestamp = formatTimestamp(timestamp);

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
  item.appendChild(document.createTextNode(`: ${msg}`));

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