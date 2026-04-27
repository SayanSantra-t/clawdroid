// ═══════════════════════════════════════════════
// Skills Page — Extensible capabilities system
// ═══════════════════════════════════════════════

const BUNDLED_SKILLS = [
  { id: 'web-browse', name: 'Web Browser', icon: '🌐', desc: 'Search the web and fetch page content', tags: ['browse', 'search', 'fetch'], enabled: true, builtin: true },
  { id: 'file-manage', name: 'File Manager', icon: '📁', desc: 'Read, write, and organize files on device', tags: ['files', 'storage', 'organize'], enabled: true, builtin: true },
  { id: 'code-exec', name: 'Code Runner', icon: '💻', desc: 'Execute JavaScript code snippets locally', tags: ['code', 'javascript', 'eval'], enabled: true, builtin: true },
  { id: 'calendar', name: 'Calendar', icon: '📅', desc: 'Manage events, reminders, and schedules', tags: ['calendar', 'events', 'schedule'], enabled: false, builtin: true },
  { id: 'email', name: 'Email Compose', icon: '✉️', desc: 'Draft and prepare email messages', tags: ['email', 'compose', 'draft'], enabled: false, builtin: true },
  { id: 'translate', name: 'Translator', icon: '🌍', desc: 'Translate text between languages', tags: ['translate', 'language', 'i18n'], enabled: true, builtin: true },
  { id: 'summarize', name: 'Summarizer', icon: '📝', desc: 'Summarize long text, articles, and conversations', tags: ['summarize', 'tldr', 'digest'], enabled: true, builtin: true },
  { id: 'location', name: 'Location', icon: '📍', desc: 'Get current GPS location and nearby places', tags: ['gps', 'location', 'map'], enabled: false, builtin: true },
  { id: 'contacts', name: 'Contacts', icon: '👥', desc: 'Access and search device contacts', tags: ['contacts', 'people', 'phone'], enabled: false, builtin: true },
  { id: 'clipboard', name: 'Clipboard', icon: '📋', desc: 'Read and write to system clipboard', tags: ['clipboard', 'copy', 'paste'], enabled: true, builtin: true },
  { id: 'qr-scan', name: 'QR Scanner', icon: '🔲', desc: 'Scan QR codes and barcodes via camera', tags: ['qr', 'barcode', 'scan'], enabled: false, builtin: true },
  { id: 'notes', name: 'Notes', icon: '🗒️', desc: 'Create and manage persistent notes', tags: ['notes', 'memo', 'write'], enabled: true, builtin: true },
];

export function renderSkills(container, app) {
  container.innerHTML = `<div class="page-container" id="skills-page"></div>`;
  refreshSkills(app);
}

async function refreshSkills(app) {
  const page = document.getElementById('skills-page');
  if (!page) return;
  const custom = await app.storage.getSkills();
  const all = [...BUNDLED_SKILLS, ...custom];

  const enabled = all.filter(s => s.enabled);
  const disabled = all.filter(s => !s.enabled);

  page.innerHTML = `
    <div class="page-header">
      <h2>Skills</h2>
      <p>Manage capabilities that extend what ClawDroid can do.</p>
    </div>
    <button class="btn btn-secondary btn-block mb-8" id="btn-add-skill">+ Add Custom Skill</button>
    <div class="section-title">Enabled (${enabled.length})</div>
    ${enabled.map(s => skillCard(s)).join('')}
    <div class="section-title">Available (${disabled.length})</div>
    ${disabled.map(s => skillCard(s)).join('')}
  `;

  // Toggle handlers
  page.querySelectorAll('.skill-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const id = e.target.dataset.skillId;
      const skill = all.find(s => s.id === id);
      if (skill) {
        skill.enabled = e.target.checked;
        if (skill.builtin) {
          app.storage.setSetting(`skill_${id}`, skill.enabled);
        } else {
          await app.storage.saveSkill(skill);
        }
        app.device.showToast(`${skill.name} ${skill.enabled ? 'enabled' : 'disabled'}`);
      }
    });
  });

  document.getElementById('btn-add-skill')?.addEventListener('click', () => showAddSkillModal(app));
}

function skillCard(skill) {
  return `
    <div class="card">
      <div class="skill-card">
        <div class="skill-icon">${skill.icon}</div>
        <div class="skill-info">
          <div class="skill-name">${skill.name}${skill.builtin ? '' : ' <span class="badge badge-info">Custom</span>'}</div>
          <div class="skill-desc">${skill.desc}</div>
          <div class="skill-tags">${skill.tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" class="skill-toggle" data-skill-id="${skill.id}" ${skill.enabled ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>`;
}

function showAddSkillModal(app) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">🔧 Add Custom Skill</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="input-group"><label class="input-label">Skill Name</label><input class="input-field" id="skill-name" placeholder="My Custom Skill"/></div>
      <div class="input-group"><label class="input-label">Description</label><input class="input-field" id="skill-desc" placeholder="What does this skill do?"/></div>
      <div class="input-group"><label class="input-label">Icon (emoji)</label><input class="input-field" id="skill-icon" placeholder="🔧" maxlength="2"/></div>
      <div class="input-group"><label class="input-label">Tags (comma-separated)</label><input class="input-field" id="skill-tags" placeholder="tag1, tag2"/></div>
      <div class="input-group"><label class="input-label">System Prompt</label><textarea class="input-field" id="skill-prompt" rows="4" placeholder="Instructions for the AI when this skill is active..."></textarea></div>
      <button class="btn btn-primary btn-block mt-16" id="modal-save">Add Skill</button>
    </div>
  `;
  document.body.appendChild(backdrop);

  backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

  backdrop.querySelector('#modal-save').onclick = async () => {
    const name = backdrop.querySelector('#skill-name').value.trim();
    if (!name) return;
    const skill = {
      id: `custom_${Date.now()}`,
      name,
      desc: backdrop.querySelector('#skill-desc').value.trim(),
      icon: backdrop.querySelector('#skill-icon').value.trim() || '🔧',
      tags: backdrop.querySelector('#skill-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      prompt: backdrop.querySelector('#skill-prompt').value.trim(),
      enabled: true,
      builtin: false
    };
    await app.storage.saveSkill(skill);
    app.device.showToast(`Skill "${name}" added!`);
    backdrop.remove();
    refreshSkills(app);
  };
}
