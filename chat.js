// URL base do seu backend no Render (sem a barra no final)
const API_BASE_URL = "https://chat-bot-back-1.onrender.com";

const messagesEl = document.getElementById("chatMessages");
const inputEl    = document.getElementById("userInput");
const sendBtn    = document.getElementById("sendBtn");

// Array para armazenar o histórico da conversa e manter o Binho IA contextualizado
let chatHistory = [];

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) sendMessage();
});

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // Adiciona a mensagem do usuário na tela
  appendMessage("user", text);
  inputEl.value = "";
  setLoading(true);

  const typingId = showTyping();

  try {
    // Faz a requisição apontando exatamente para a rota /chat do seu backend
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: text,
        historico: chatHistory // Envia o histórico acumulado para a IA
      }),
    });

    const data = await res.json();
    removeTyping(typingId);

    if (data.success) {
      appendMessage("bot", data.response);
      
      // Atualiza o histórico local com a interação atual (padrão que o app.py espera)
      chatHistory.push({ role: "user", content: text });
      chatHistory.push({ role: "assistant", content: data.response });
      
      // Limita o histórico local para guardar apenas as últimas 10 mensagens e evitar sobrecarga
      if (chatHistory.length > 10) {
        chatHistory = chatHistory.slice(-10);
      }
    } else {
      appendMessage("bot", data.error || data.message || "Ocorreu um erro.");
    }

  } catch (err) {
    removeTyping(typingId);
    appendMessage("bot", "Erro de conexão: " + err.message);
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