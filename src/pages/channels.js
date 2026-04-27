// ═══════════════════════════════════════════════
// Channels Page — Messaging integrations
// ═══════════════════════════════════════════════

export function renderChannels(container, app) {
  container.innerHTML = `<div class="page-container" id="channels-page"></div>`;
  refreshChannels(app);
}

async function refreshChannels(app) {
  const page = document.getElementById('channels-page');
  if (!page) return;
  const connected = await app.channels.getConnectedChannels();
  const types = app.channels.getChannelTypes();

  page.innerHTML = `
    <div class="page-header">
      <h2>Channels</h2>
      <p>Connect messaging platforms to interact with ClawDroid from anywhere.</p>
    </div>
    ${connected.length > 0 ? `
      <div class="section-title">Connected</div>
      ${connected.map(ch => {
        const type = types.find(t => t.id === ch.type) || {};
        return `
          <div class="card">
            <div class="card-row">
              <div class="channel-icon ${type.color || ''}">${type.icon || '📡'}</div>
              <div style="flex:1">
                <div class="card-title">${ch.name || type.name}</div>
                <div class="card-subtitle">Connected ${new Date(ch.connectedAt).toLocaleDateString()}</div>
              </div>
              <span class="badge badge-success">Active</span>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
              <button class="btn btn-sm btn-secondary" onclick="document.dispatchEvent(new CustomEvent('ch-test',{detail:'${ch.id}'}))">Test</button>
              <button class="btn btn-sm btn-danger" onclick="document.dispatchEvent(new CustomEvent('ch-disconnect',{detail:'${ch.id}'}))">Disconnect</button>
            </div>
          </div>`;
      }).join('')}
    ` : ''}
    <div class="section-title">Available Channels</div>
    ${types.map(t => `
      <div class="card" style="cursor:pointer" onclick="document.dispatchEvent(new CustomEvent('ch-connect',{detail:'${t.id}'}))">
        <div class="card-row">
          <div class="channel-icon ${t.color}">${t.icon}</div>
          <div style="flex:1">
            <div class="card-title">${t.name}</div>
            <div class="card-subtitle">${t.desc}</div>
          </div>
          <span style="color:var(--text-muted);font-size:20px">›</span>
        </div>
      </div>
    `).join('')}
  `;

  // Event handlers
  document.addEventListener('ch-disconnect', async (e) => {
    await app.channels.disconnectChannel(e.detail);
    app.device.showToast('Channel disconnected');
    refreshChannels(app);
  }, { once: true });

  document.addEventListener('ch-test', async (e) => {
    try {
      await app.channels.sendToChannel(e.detail, '🦞 Test message from ClawDroid!');
      app.device.showToast('Test message sent!');
    } catch (err) { app.device.showToast(err.message); }
  }, { once: true });

  document.addEventListener('ch-connect', (e) => {
    showConnectModal(e.detail, app);
  }, { once: true });
}

function showConnectModal(typeId, app) {
  const types = app.channels.getChannelTypes();
  const type = types.find(t => t.id === typeId);
  if (!type) return;

  const configs = {
    telegram: `<div class="input-group"><label class="input-label">Bot Token</label><input class="input-field" id="cfg-token" placeholder="123456:ABC-DEF..."/></div>
               <div class="input-group"><label class="input-label">Chat ID</label><input class="input-field" id="cfg-chatid" placeholder="-1001234567890"/></div>`,
    discord: `<div class="input-group"><label class="input-label">Webhook URL</label><input class="input-field" id="cfg-webhook" placeholder="https://discord.com/api/webhooks/..."/></div>`,
    slack: `<div class="input-group"><label class="input-label">Webhook URL</label><input class="input-field" id="cfg-webhook" placeholder="https://hooks.slack.com/services/..."/></div>`,
    whatsapp: `<div class="input-group"><label class="input-label">Gateway Bridge URL</label><input class="input-field" id="cfg-bridge" placeholder="http://your-gateway:18789"/></div>`,
    signal: `<div class="input-group"><label class="input-label">Signal CLI API URL</label><input class="input-field" id="cfg-bridge" placeholder="http://localhost:8080"/></div>`,
    webchat: `<p style="color:var(--text-secondary);font-size:13px">WebChat is built-in. No configuration needed.</p>`,
    matrix: `<div class="input-group"><label class="input-label">Homeserver URL</label><input class="input-field" id="cfg-bridge" placeholder="https://matrix.org"/></div>
             <div class="input-group"><label class="input-label">Access Token</label><input class="input-field" id="cfg-token" placeholder="syt_..."/></div>`,
    irc: `<div class="input-group"><label class="input-label">Server</label><input class="input-field" id="cfg-bridge" placeholder="irc.libera.chat:6697"/></div>
          <div class="input-group"><label class="input-label">Channel</label><input class="input-field" id="cfg-chatid" placeholder="#mychannel"/></div>`
  };

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">${type.icon} Connect ${type.name}</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      ${configs[typeId] || '<p style="color:var(--text-secondary)">Configuration via Gateway recommended.</p>'}
      <div style="margin-top:20px;display:flex;gap:8px">
        <button class="btn btn-primary btn-block" id="modal-save">Connect</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

  backdrop.querySelector('#modal-save').onclick = async () => {
    const config = { type: typeId };
    const token = backdrop.querySelector('#cfg-token');
    const chatid = backdrop.querySelector('#cfg-chatid');
    const webhook = backdrop.querySelector('#cfg-webhook');
    const bridge = backdrop.querySelector('#cfg-bridge');
    if (token) config.botToken = token.value;
    if (chatid) config.chatId = chatid.value;
    if (webhook) config.webhookUrl = webhook.value;
    if (bridge) config.bridgeUrl = bridge.value;

    await app.channels.connectChannel(config);
    app.device.showToast(`${type.name} connected!`);
    backdrop.remove();
    refreshChannels(app);
  };
}
