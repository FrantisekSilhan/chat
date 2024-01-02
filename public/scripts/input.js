const textarea = document.getElementById("textarea");
const chatButton = document.getElementById("send");
const body = document.getElementsByTagName("body")[0];

if (textarea !== undefined) {

  textarea.addEventListener("input", e => {
    const inputText = e.target.value;
    const lines = inputText.split("\n").length;
    body.style.setProperty("--chat-height-input", (Math.ceil((lines * parseFloat(getComputedStyle(body).getPropertyValue('--chat-line-height')))*10)/10) + "em");
  });

  textarea.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatButton.dispatchEvent(new Event("click", {}));
    }

    if (e.key === "Enter" && e.shiftKey) {
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 10);
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    window.scrollTo(0, document.body.scrollHeight);
  }
});