// ═══════════════════════════════════════════════
// Settings Page — App configuration
// ═══════════════════════════════════════════════

export function renderSettings(container, app) {
  const provider = app.storage.getSetting('ai_provider', 'openai');
  const model = app.storage.getSetting('ai_model', 'gpt-4o-mini');
  const apiKey = app.storage.getSetting('ai_api_key', '');
  const userName = app.storage.getSetting('user_name', 'User');
  const autoSpeak = app.storage.getSetting('auto_speak', false);
  const darkMode = app.storage.getSetting('dark_mode', true);

    const providerModels = {
      openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'],
      anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
      google: ['gemini-3.1-pro', 'gemini-3.1-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b'],
      ollama: ['llama3', 'mistral', 'codellama', 'phi3'],
      custom: ['default'],
      nano: ['default']
    };

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h2>Settings</h2>
        <p>Configure ClawDroid to your liking.</p>
      </div>

      <div class="section-title">Profile</div>
      <div class="card">
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">Display Name</label>
          <input class="input-field" id="set-name" value="${userName}" placeholder="Your name"/>
        </div>
      </div>

      <div class="section-title">AI Provider</div>
      <div class="card">
        <div class="input-group">
          <label class="input-label">Provider</label>
          <select class="input-field" id="set-provider">
            <option value="openai" ${provider === 'openai' ? 'selected' : ''}>OpenAI</option>
            <option value="anthropic" ${provider === 'anthropic' ? 'selected' : ''}>Anthropic</option>
            <option value="google" ${provider === 'google' ? 'selected' : ''}>Google (Gemini)</option>
            <option value="nano" ${provider === 'nano' ? 'selected' : ''}>Google AI Edge (On-Device)</option>
            <option value="ollama" ${provider === 'ollama' ? 'selected' : ''}>Ollama (Local)</option>
            <option value="custom" ${provider === 'custom' ? 'selected' : ''}>Custom / Gateway</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Model</label>
          <select class="input-field" id="set-model">
            ${(providerModels[provider] || []).map(m => `<option value="${m}" ${m === model ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">API Key</label>
          <input class="input-field" id="set-apikey" type="password" value="${apiKey}" placeholder="sk-... or your API key"/>
          <p style="font-size:11px;color:var(--text-muted);margin-top:4px">Stored locally on your device. Never sent anywhere except your chosen provider.</p>
        </div>
      </div>

      <div class="section-title">Voice</div>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="card-title">Auto-Speak Responses</div>
            <div class="card-subtitle">Read AI responses aloud</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-autospeak" ${autoSpeak ? 'checked' : ''}/>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="section-title">Device & Integrations</div>
      <div class="card" id="device-info-card">
        <div class="card-body" style="font-size:13px;color:var(--text-secondary)">Loading device info...</div>
      </div>
      <div class="card">
        <button class="btn btn-secondary btn-block" id="btn-test-termux">⚡ Test Termux Connection</button>
        <p style="font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center;">This will send a 'termux-toast' command to verify the bridge.</p>
      </div>

      <div class="section-title">Data</div>
      <div class="card">
        <button class="btn btn-secondary btn-block mb-8" id="btn-export">📤 Export All Data</button>
        <button class="btn btn-secondary btn-block mb-8" id="btn-import">📥 Import Data</button>
        <button class="btn btn-danger btn-block" id="btn-clear">🗑️ Clear All Data</button>
      </div>

      <div class="section-title">About</div>
      <div class="card" style="text-align:center">
        <div style="font-size:40px;margin-bottom:8px">🦞</div>
        <div class="card-title" style="font-size:18px">ClawDroid</div>
        <div class="card-subtitle" style="margin-top:4px">Version 1.0.0</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:8px">
          Open-source Android alternative to OpenClaw.<br>
          Built with Capacitor • MIT License
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px">
          <button class="btn btn-sm btn-secondary" onclick="window.open('https://github.com/openclaw/openclaw','_blank')">GitHub</button>
          <button class="btn btn-sm btn-secondary" onclick="window.open('https://docs.openclaw.ai','_blank')">Docs</button>
        </div>
      </div>
      <div style="height:40px"></div>
    </div>
  `;

  // Provider change -> update models
  document.getElementById('set-provider')?.addEventListener('change', (e) => {
    const models = providerModels[e.target.value] || ['default'];
    const sel = document.getElementById('set-model');
    sel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
  });

  // Save all settings on change
  const saveAll = () => {
    app.storage.setSetting('user_name', document.getElementById('set-name')?.value || 'User');
    app.storage.setSetting('ai_provider', document.getElementById('set-provider')?.value);
    app.storage.setSetting('ai_model', document.getElementById('set-model')?.value);
    app.storage.setSetting('ai_api_key', document.getElementById('set-apikey')?.value);
    app.storage.setSetting('auto_speak', document.getElementById('set-autospeak')?.checked || false);
    app.device.showToast('Settings saved!');
  };

  ['set-name', 'set-provider', 'set-model', 'set-apikey'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', saveAll);
  });
  document.getElementById('set-autospeak')?.addEventListener('change', saveAll);

  // Device info
  loadDeviceInfo(app);

  // Test Termux
  document.getElementById('btn-test-termux')?.addEventListener('click', async () => {
    try {
      await app.device.runTermuxCommand('/data/data/com.termux/files/usr/bin/termux-toast', ['ClawDroid Termux Bridge is Working!'], true);
      app.device.showToast('Test command sent to Termux!');
    } catch (e) {
      app.device.showToast('Error: ' + e.message);
    }
  });

  // Export
  document.getElementById('btn-export')?.addEventListener('click', async () => {
    const data = {
      messages: await app.storage._getAll('messages'),
      sessions: await app.storage._getAll('sessions'),
      memory: await app.storage._getAll('memory'),
      skills: await app.storage._getAll('skills'),
      automations: await app.storage._getAll('automations'),
      channels: await app.storage._getAll('channels'),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `clawdroid-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    app.device.showToast('Data exported!');
  });

  // Import
  document.getElementById('btn-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = JSON.parse(reader.result);
          if (data.messages) for (const m of data.messages) await app.storage._put('messages', m);
          if (data.memory) for (const m of data.memory) await app.storage._put('memory', m);
          if (data.skills) for (const s of data.skills) await app.storage._put('skills', s);
          if (data.automations) for (const a of data.automations) await app.storage._put('automations', a);
          if (data.channels) for (const c of data.channels) await app.storage._put('channels', c);
          app.device.showToast('Data imported successfully!');
        } catch { app.device.showToast('Invalid backup file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // Clear
  document.getElementById('btn-clear')?.addEventListener('click', async () => {
    if (confirm('This will delete ALL data including messages, notes, automations, and channels. Continue?')) {
      await app.storage._clear('messages');
      await app.storage._clear('sessions');
      await app.storage._clear('memory');
      await app.storage._clear('skills');
      await app.storage._clear('automations');
      await app.storage._clear('channels');
      localStorage.clear();
      app.ai.clearHistory();
      app.device.showToast('All data cleared');
      app.navigateTo('chat');
    }
  });
}

async function loadDeviceInfo(app) {
  const card = document.getElementById('device-info-card');
  if (!card) return;
  try {
    const info = await app.device.getDeviceInfo();
    const battery = await app.device.getBatteryInfo();
    const network = await app.device.getNetworkStatus();
    const batteryPct = battery.batteryLevel >= 0 ? Math.round(battery.batteryLevel * 100) + '%' : 'N/A';

    card.innerHTML = `
      <div class="card-body" style="font-size:13px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Platform</span><span>${info.platform || 'Web'}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">OS</span><span>${info.operatingSystem || 'Unknown'} ${info.osVersion || ''}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Model</span><span>${info.model || 'Unknown'}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Battery</span><span>${batteryPct}${battery.isCharging ? ' ⚡' : ''}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text-secondary)">Network</span><span>${network.connected ? '🟢 ' + (network.connectionType || 'Connected') : '🔴 Offline'}</span></div>
      </div>
    `;
  } catch {
    card.innerHTML = `<div class="card-body" style="font-size:13px;color:var(--text-muted)">Could not fetch device info</div>`;
  }
}
