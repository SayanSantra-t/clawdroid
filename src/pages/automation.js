// ═══════════════════════════════════════════════
// Automation Page — Task scheduling & cron jobs
// ═══════════════════════════════════════════════

export function renderAutomation(container, app) {
  container.innerHTML = `<div class="page-container" id="auto-page"></div>`;
  refreshAutomation(app);
}

async function refreshAutomation(app) {
  const page = document.getElementById('auto-page');
  if (!page) return;
  const automations = await app.automation.getAutomations();
  const presets = app.automation.getPresets();

  page.innerHTML = `
    <div class="page-header">
      <h2>Automation</h2>
      <p>Schedule recurring tasks, reminders, and proactive workflows.</p>
    </div>
    <button class="btn btn-primary btn-block mb-8" id="btn-create-auto">⚡ Create Automation</button>
    ${automations.length > 0 ? `
      <div class="section-title">Active Automations</div>
      ${automations.map(a => `
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">${a.name}</div>
              <div class="card-subtitle">${a.description || formatTrigger(a)}</div>
            </div>
            <label class="toggle">
              <input type="checkbox" data-auto-id="${a.id}" class="auto-toggle" ${a.enabled ? 'checked' : ''}/>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="card-body" style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>Runs: ${a.runCount || 0} • Last: ${a.lastRun ? new Date(a.lastRun).toLocaleString() : 'Never'}</span>
              <button class="btn btn-sm btn-danger" data-del-auto="${a.id}">Delete</button>
            </div>
          </div>
        </div>
      `).join('')}
    ` : `
      <div class="empty-state" style="margin-top:20px">
        <div class="empty-state-icon">⚡</div>
        <h3>No automations yet</h3>
        <p>Create one or use a preset to get started.</p>
      </div>
    `}
    <div class="section-title">Quick Presets</div>
    ${presets.map((p, i) => `
      <div class="card" style="cursor:pointer" data-preset="${i}">
        <div class="card-row">
          <div style="flex:1">
            <div class="card-title">${p.name}</div>
            <div class="card-subtitle">${p.description}</div>
          </div>
          <span style="color:var(--accent-light);font-size:13px;font-weight:600">+ Add</span>
        </div>
      </div>
    `).join('')}
  `;

  // Toggle handlers
  page.querySelectorAll('.auto-toggle').forEach(t => {
    t.addEventListener('change', async (e) => {
      await app.automation.toggleAutomation(e.target.dataset.autoId);
      app.device.showToast('Automation updated');
    });
  });

  // Delete handlers
  page.querySelectorAll('[data-del-auto]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await app.automation.deleteAutomation(btn.dataset.delAuto);
      app.device.showToast('Automation deleted');
      refreshAutomation(app);
    });
  });

  // Preset handlers
  page.querySelectorAll('[data-preset]').forEach(card => {
    card.addEventListener('click', async () => {
      const preset = presets[parseInt(card.dataset.preset)];
      await app.automation.createAutomation(preset);
      app.device.showToast(`"${preset.name}" added!`);
      refreshAutomation(app);
    });
  });

  // Create button
  document.getElementById('btn-create-auto')?.addEventListener('click', () => showCreateAutoModal(app));
}

function formatTrigger(auto) {
  if (auto.trigger === 'interval') {
    const mins = Math.round((auto.triggerConfig?.intervalMs || 0) / 60000);
    return `Every ${mins} minutes`;
  }
  if (auto.trigger === 'time') return `Daily at ${auto.triggerConfig?.time || '??:??'}`;
  return auto.trigger;
}

function showCreateAutoModal(app) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">⚡ New Automation</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="input-group"><label class="input-label">Name</label><input class="input-field" id="auto-name" placeholder="My Automation"/></div>
      <div class="input-group"><label class="input-label">Description</label><input class="input-field" id="auto-desc" placeholder="What it does"/></div>
      <div class="input-group">
        <label class="input-label">Trigger</label>
        <select class="input-field" id="auto-trigger">
          <option value="interval">Interval (repeat)</option>
          <option value="time">Daily at time</option>
        </select>
      </div>
      <div id="trigger-config">
        <div class="input-group"><label class="input-label">Interval (minutes)</label><input class="input-field" id="auto-interval" type="number" value="60" min="1"/></div>
      </div>
      <div class="input-group">
        <label class="input-label">Action</label>
        <select class="input-field" id="auto-action">
          <option value="ai_message">Send AI Prompt</option>
          <option value="notification">Show Notification</option>
        </select>
      </div>
      <div class="input-group"><label class="input-label">Message / Prompt</label><textarea class="input-field" id="auto-message" rows="3" placeholder="What should ClawDroid do?"></textarea></div>
      <button class="btn btn-primary btn-block mt-16" id="modal-save">Create</button>
    </div>
  `;
  document.body.appendChild(backdrop);

  const triggerSelect = backdrop.querySelector('#auto-trigger');
  const triggerConfig = backdrop.querySelector('#trigger-config');
  triggerSelect.addEventListener('change', () => {
    if (triggerSelect.value === 'time') {
      triggerConfig.innerHTML = `<div class="input-group"><label class="input-label">Time</label><input class="input-field" id="auto-time" type="time" value="08:00"/></div>`;
    } else {
      triggerConfig.innerHTML = `<div class="input-group"><label class="input-label">Interval (minutes)</label><input class="input-field" id="auto-interval" type="number" value="60" min="1"/></div>`;
    }
  });

  backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

  backdrop.querySelector('#modal-save').onclick = async () => {
    const name = backdrop.querySelector('#auto-name').value.trim();
    if (!name) return;
    const trigger = triggerSelect.value;
    const triggerConf = trigger === 'interval'
      ? { intervalMs: (parseInt(backdrop.querySelector('#auto-interval')?.value) || 60) * 60000 }
      : { time: backdrop.querySelector('#auto-time')?.value || '08:00' };
    const action = backdrop.querySelector('#auto-action').value;
    const message = backdrop.querySelector('#auto-message').value.trim();

    await app.automation.createAutomation({
      name,
      description: backdrop.querySelector('#auto-desc').value.trim(),
      trigger, triggerConfig: triggerConf,
      action, actionConfig: { message, title: name, body: message }
    });
    app.device.showToast(`"${name}" created!`);
    backdrop.remove();
    refreshAutomation(app);
  };
}
