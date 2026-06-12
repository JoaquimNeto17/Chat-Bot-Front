const API_URL = "http://localhost:5000/chat";

const messagesEl = document.getElementById("chatMessages");
const inputEl    = document.getElementById("userInput");
const sendBtn    = document.getElementById("sendBtn");

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) sendMessage();
});

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  appendMessage("user", text);
  inputEl.value = "";
  setLoading(true);

  const typingId = showTyping();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    removeTyping(typingId);

    if (data.success) {
      appendMessage("bot", data.response);
    } else {
      appendMessage("bot", data.message || "Ocorreu um erro. Tente novamente.");
    }

  } catch (err) {
    removeTyping(typingId);
    appendMessage("bot", "Não consegui conectar ao servidor. Verifique se o backend está rodando em <strong>localhost:5000</strong>.");
  }

  setLoading(false);
}

function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const avatarEl = document.createElement("div");
  avatarEl.className = "msg-avatar";
  avatarEl.textContent = role === "bot" ? "BI" : "EU";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = formatText(text);

  wrapper.appendChild(avatarEl);
  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
}

function showTyping() {
  const id = "typing-" + Date.now();
  const wrapper = document.createElement("div");
  wrapper.className = "message bot typing";
  wrapper.id = id;

  const avatarEl = document.createElement("div");
  avatarEl.className = "msg-avatar";
  avatarEl.textContent = "BI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>`;

  wrapper.appendChild(avatarEl);
  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function setLoading(state) {
  sendBtn.disabled = state;
  inputEl.disabled = state;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function formatText(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}