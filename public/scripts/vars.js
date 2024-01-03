let autoScroll = true;
let lastMessage;

const body = document.getElementsByTagName("body")[0];

const chat = document.getElementById("chat");
const chatButton = document.getElementById("chat-button");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatWarning = document.getElementById("chat-warning");

const infoConnections = document.getElementById("info-connections");

const usernameForm = document.getElementById("username-form")
const usernameFormInput = document.getElementById("username-form-input");

const colorFormInput = document.getElementById("color-form-input");

const socket = io({
  auth: {
    serverOffset: 0
  }
});

const lineHeight = parseFloat(getComputedStyle(body).getPropertyValue('--chat-line-height'));