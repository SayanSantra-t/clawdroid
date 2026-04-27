// ═══════════════════════════════════════════════
// Gateway Page — Connect to OpenClaw gateway
// ═══════════════════════════════════════════════

export function renderGateway(container, app) {
  const gwUrl = app.storage.getSetting('gateway_url', '');
  const gwStatus = gwUrl ? 'checking' : 'disconnected';

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h2>Gateway</h2>
        <p>Connect to an OpenClaw gateway for full agent capabilities.</p>
      </div>
      <div class="card gateway-status-card">
        <div class="gateway-dot ${gwStatus === 'disconnected' ? 'disconnected' : 'disconnected'}" id="gw-dot"></div>
        <div class="card-title" id="gw-status-text">${gwUrl ? 'Checking connection...' : 'Not Connected'}</div>
        <div class="card-subtitle" style="margin-top:4px" id="gw-url-display">${gwUrl || 'No gateway configured'}</div>
      </div>
      <div class="section-title">Connection</div>
      <div class="card">
        <div class="input-group" style="margin-bottom:12px">
          <label class="input-label">Gateway URL</label>
          <input class="input-field" id="gw-url" value="${gwUrl}" placeholder="http://192.168.1.100:18789"/>
        </div>
        <div class="input-group" style="margin-bottom:12px">
          <label class="input-label">Auth Token (optional)</label>
          <input class="input-field" id="gw-token" type="password" value="${app.storage.getSetting('gateway_token', '')}" placeholder="Bearer token or API key"/>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" id="btn-gw-connect" style="flex:1">Connect</button>
          <button class="btn btn-secondary" id="btn-gw-test">Test</button>
        </div>
      </div>
      <div class="section-title">What is the Gateway?</div>
      <div class="card">
        <div class="card-body">
          <p>The <strong>OpenClaw Gateway</strong> is the control plane that runs on your PC, Mac, or server. It provides:</p>
          <ul style="margin:8px 0;padding-left:20px;color:var(--text-secondary);font-size:13px;line-height:1.8">
            <li>🖥️ Full shell & file access on your computer</li>
            <li>🌐 Web browser automation</li>
            <li>📬 Multi-channel message routing</li>
            <li>🧠 Persistent memory & context</li>
            <li>⚡ Cron jobs & proactive tasks</li>
            <li>🔧 Custom skills & tools</li>
          </ul>
          <p style="margin-top:8px;font-size:12px;color:var(--text-muted)">Without a gateway, ClawDroid works as a standalone AI chat app using your API key directly.</p>
        </div>
      </div>
      <div class="section-title">Gateway Info</div>
      <div id="gw-info"></div>
      <div class="section-title">Setup Guide</div>
      <div class="card">
        <div class="card-body" style="font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.8;color:var(--text-secondary)">
          <p style="color:var(--text-primary);font-weight:600;margin-bottom:8px">Quick Setup on your PC:</p>
          <code style="display:block;background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin-bottom:8px">npm install -g openclaw@latest<br>openclaw onboard --install-daemon</code>
          <p style="margin-top:8px">Then enter your PC's local IP and port 18789 above.</p>
          <p style="margin-top:4px">Find your IP: <code>ipconfig</code> (Windows) or <code>ifconfig</code> (Mac/Linux)</p>
        </div>
      </div>
    </div>
  `;

  // Connect
  document.getElementById('btn-gw-connect')?.addEventListener('click', () => {
    const url = document.getElementById('gw-url').value.trim().replace(/\/$/, '');
    const token = document.getElementById('gw-token').value.trim();
    app.storage.setSetting('gateway_url', url);
    app.storage.setSetting('gateway_token', token);
    app.device.showToast(url ? 'Gateway URL saved!' : 'Gateway disconnected');
    testGateway(url, token, app);
  });

  // Test
  document.getElementById('btn-gw-test')?.addEventListener('click', () => {
    const url = document.getElementById('gw-url').value.trim().replace(/\/$/, '');
    const token = document.getElementById('gw-token').value.trim();
    testGateway(url, token, app);
  });

  // Auto-test on load
  if (gwUrl) testGateway(gwUrl, app.storage.getSetting('gateway_token', ''), app);
}

async function testGateway(url, token, app) {
  const dot = document.getElementById('gw-dot');
  const text = document.getElementById('gw-status-text');
  const info = document.getElementById('gw-info');
  if (!url) {
    dot?.classList.remove('connected');
    dot?.classList.add('disconnected');
    if (text) text.textContent = 'Not Connected';
    return;
  }

  if (text) text.textContent = 'Connecting...';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${url}/api/health`, { headers, signal: AbortSignal.timeout(5000) });

    if (res.ok) {
      dot?.classList.remove('disconnected');
      dot?.classList.add('connected');
      if (text) text.textContent = 'Connected ✓';
      app.device.showToast('Gateway connected!');

      try {
        const data = await res.json();
        if (info) {
          info.innerHTML = `
            <div class="card">
              <div class="card-body" style="font-size:13px">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Version</span><span style="color:var(--text-primary)">${data.version || 'Unknown'}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Uptime</span><span style="color:var(--text-primary)">${data.uptime || 'N/A'}</span></div>
                <div style="display:flex;justify-content:space-between"><span>Channels</span><span style="color:var(--text-primary)">${data.channels || 'N/A'}</span></div>
              </div>
            </div>`;
        }
      } catch { /* no JSON body */ }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    dot?.classList.remove('connected');
    dot?.classList.add('disconnected');
    if (text) text.textContent = `Connection failed: ${err.message}`;
    if (info) info.innerHTML = '';
  }
}
