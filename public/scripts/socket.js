function offsetTimestamp(timestamp) {
  const messageTime = new Date(timestamp);
  const offset = new Date().getTimezoneOffset();
  return new Date(messageTime.getTime() - offset * 60000);
}

function formatTimestamp(timestamp) {
  const options = {
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit"
  };

  return new Intl.DateTimeFormat("en-US", { ...options }).format(timestamp);
}

function setColor() {
  const newColor = colorFormInput.value;
  if (newColor) {
    socket.emit("setColor", newColor);
    usernameFormInput.style.setProperty("--color", newColor);
    colorFormInput.style.backgroundColor = newColor;
  }
}

function handleNewDay(newMessage) {
  if (!lastMessage) {
    const item = document.createElement("li");
    item.classList.add("message", "message--center")

    item.appendChild(document.createTextNode(`${newMessage.getDate()}.${newMessage.getMonth()+1}.${newMessage.getFullYear()}`));
    chatMessages.appendChild(item);
    lastMessage = newMessage;
  }

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  if (!isSameDay(lastMessage, newMessage)) {
    const item = document.createElement("li");
    item.classList.add("message", "message--center")

    item.appendChild(document.createTextNode(`${newMessage.getDate()}.${newMessage.getMonth()+1}.${newMessage.getFullYear()}`));
    chatMessages.appendChild(item);
  }
  lastMessage = newMessage
}

document.addEventListener("scroll", () => {
  autoScroll = (window.scrollY + lineHeight*16*5) >= document.body.scrollHeight - window.innerHeight;
  if (autoScroll) {
    chatWarning.classList.remove("visible");
  }
});

chatWarning.addEventListener("click", () => {
  window.scrollTo(0, document.body.scrollHeight);
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

chatButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (chatInput.value) {
    socket.emit("chatMessage", chatInput.value);
    chatInput.value = "";
    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

socket.on("chatMessage", (msg, serverOffset, timestamp, username, color) => {
  timestamp = offsetTimestamp(timestamp);
  handleNewDay(timestamp);
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

  for (const node of parseMessage(msg)) {
    item.appendChild(node)
  }

  chatMessages.appendChild(item);
  if (autoScroll) {
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    chatWarning.classList.add("visible");
  }
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
  const emoRegex = /(:[a-zA-Z_]+:)/;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const finalRegex = new RegExp(`${emoRegex.source}|${urlRegex.source}`)

  const splitMsg = msg.split(emoRegex);

  if (splitMsg.length === 1) {
    return [
      document.createTextNode(`: ${msg}`)
    ]
  }

  let result = [document.createTextNode(": ")];

  for (const piece of splitMsg) {
    let e;
    switch (true) {
      case urlRegex.test(piece):
        e = document.createElement("a")
        e.target = "_blank"
        e.href = piece;
        e.innerText = piece;
        break;
      case emoRegex.test(piece):
        e = document.createTextNode("EMO")
        break;
      default:
        e = document.createTextNode(piece)
        break;
    }
    result = [...result, e]
  }

  return result;
}
