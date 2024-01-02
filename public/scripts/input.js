const textarea = document.getElementById("textarea");
const chatButton = document.getElementById("send");

if (textarea !== undefined) {
    textarea.addEventListener("input", e => {
        const inputText = e.target.value;
        const lines = inputText.split("\n").length;
        textarea.style.height = (lines * 1.2) + "em";
    });

    textarea.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === "Enter") {
            console.log("pressed")
            chatButton.dispatchEvent(new Event('click', {}));
        }
    })
}
