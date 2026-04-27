// ═══════════════════════════════════════════════
// Chat Page — Main AI conversation interface
// ═══════════════════════════════════════════════

export function renderChat(container, app) {
  const sessionId = app.storage.getSetting('current_session', 'default');

  container.innerHTML = `
    <div class="chat-container">
      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome" id="chat-welcome">
          <div class="chat-welcome-icon">🦞</div>
          <h2>Welcome to ClawDroid</h2>
          <p>Your personal AI assistant, running right on your device.<br>Ask anything, automate tasks, or manage your digital life.</p>
          <div class="chat-suggestions">
            <button class="suggestion-chip" data-msg="What can you do?">What can you do?</button>
            <button class="suggestion-chip" data-msg="Help me write a message">Write a message</button>
            <button class="suggestion-chip" data-msg="Show my device info">Device info</button>
            <button class="suggestion-chip" data-msg="Set up a daily reminder">Daily reminder</button>
            <button class="suggestion-chip" data-msg="Summarize my conversations">Summarize chats</button>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="chat-input-wrapper">
          <div class="chat-input-actions">
            <button class="chat-action-btn" id="btn-attach" title="Attach">📎</button>
            <button class="chat-action-btn" id="btn-camera" title="Camera">📷</button>
          </div>
          <textarea id="chat-input" rows="1" placeholder="Message ClawDroid..." autocomplete="off"></textarea>
          <button class="chat-send-btn" id="btn-send" title="Send">➤</button>
        </div>
      </div>
    </div>
  `;

  const messagesDiv = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('btn-send');
  const welcome = document.getElementById('chat-welcome');

  // Load history
  loadHistory(messagesDiv, welcome, app, sessionId);

  // Auto-resize input
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    sendBtn.classList.toggle('has-text', input.value.trim().length > 0);
  });

  // Send on Enter (not Shift+Enter)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  sendBtn.addEventListener('click', sendMessage);

  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.msg;
      sendMessage();
    });
  });

  // Attach button (file picker)
  document.getElementById('btn-attach')?.addEventListener('click', async () => {
    try {
      const photo = await app.device.pickPhoto();
      if (photo?.dataUrl) {
        appendMessage(messagesDiv, 'user', `[📎 Image attached]`, sessionId, app);
        appendMessage(messagesDiv, 'assistant', 'I can see you attached an image. Image analysis is available when connected to a vision-capable model (GPT-4o, Gemini Pro Vision).', sessionId, app);
      }
    } catch { /* cancelled */ }
  });

  // Camera button
  document.getElementById('btn-camera')?.addEventListener('click', async () => {
    try {
      const photo = await app.device.takePhoto();
      if (photo?.dataUrl) {
        appendMessage(messagesDiv, 'user', `[📷 Photo captured]`, sessionId, app);
        appendMessage(messagesDiv, 'assistant', 'Photo captured! Connect a vision-capable model to analyze images.', sessionId, app);
      }
    } catch (e) { app.device.showToast(e.message); }
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    sendBtn.classList.remove('has-text');
    welcome?.classList.add('hidden');

    appendMessage(messagesDiv, 'user', text, sessionId, app);

    // Handle built-in commands
    const builtInResponse = handleBuiltIn(text, app);
    if (builtInResponse) {
      appendMessage(messagesDiv, 'assistant', builtInResponse, sessionId, app);
      return;
    }

    // Show typing
    const typing = showTyping(messagesDiv);

    try {
      const response = await app.ai.sendMessage(text);
      typing.remove();
      appendMessage(messagesDiv, 'assistant', response, sessionId, app);
      // Read aloud if voice mode is active
      if (app.storage.getSetting('auto_speak', false)) {
        app.voice.speak(response);
      }
    } catch (err) {
      typing.remove();
      appendMessage(messagesDiv, 'assistant', `⚠️ ${err.message}`, sessionId, app);
    }
  }
}

async function loadHistory(container, welcome, app, sessionId) {
  try {
    const messages = await app.storage.getMessages(sessionId);
    if (messages.length > 0) {
      welcome?.classList.add('hidden');
      messages.forEach(m => {
        addMessageBubble(container, m.role, m.content, m.timestamp);
      });
      container.scrollTop = container.scrollHeight;
    }
  } catch { /* no history */ }
}

function appendMessage(container, role, content, sessionId, app) {
  addMessageBubble(container, role, content);
  container.scrollTop = container.scrollHeight;
  app.storage.addMessage({ sessionId, role, content });
  app.device.hapticFeedback('light');
}

function addMessageBubble(container, role, content, timestamp = null) {
  const time = timestamp ? new Date(timestamp) : new Date();
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const avatar = role === 'assistant' ? '🦞' : '👤';
  const formatted = formatContent(content);

  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div>
      <div class="message-content">${formatted}</div>
      <div class="message-time">${timeStr}</div>
    </div>
  `;
  container.appendChild(div);
}

function formatContent(text) {
  // Simple markdown-like formatting
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  return html;
}

function showTyping(container) {
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.innerHTML = `
    <div class="message-avatar">🦞</div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function handleBuiltIn(text, app) {
  const cmd = text.toLowerCase().trim();
  if (cmd === '/clear' || cmd === '/reset') {
    app.ai.clearHistory();
    app.storage.clearMessages(app.storage.getSetting('current_session', 'default'));
    setTimeout(() => app.navigateTo('chat'), 100);
    return null;
  }
  if (cmd === '/device' || cmd.includes('device info')) {
    app.device.getDeviceInfo().then(info => {
      app.device.showToast(`${info.platform} • ${info.model}`);
    });
    return null; // Let AI handle it
  }
  return null;
}
