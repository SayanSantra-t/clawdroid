// ═══════════════════════════════════════════════
// Files Page — Device file browser (non-root)
// ═══════════════════════════════════════════════

export function renderFiles(container, app) {
  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h2>Files</h2>
        <p>Browse and manage files accessible to ClawDroid.</p>
      </div>
      <div class="card">
        <div class="card-row">
          <div class="skill-icon" style="background:rgba(59,130,246,0.15)">📄</div>
          <div style="flex:1">
            <div class="card-title">App Documents</div>
            <div class="card-subtitle">Files created by ClawDroid</div>
          </div>
        </div>
      </div>
      <div id="file-list"></div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary" id="btn-new-file" style="flex:1">📝 New Note</button>
        <button class="btn btn-secondary" id="btn-import-file" style="flex:1">📥 Import File</button>
      </div>
      <div class="section-title">Saved Notes</div>
      <div id="notes-list"></div>
    </div>
  `;
  loadNotes(app);

  document.getElementById('btn-new-file')?.addEventListener('click', () => showNoteEditor(app));
  document.getElementById('btn-import-file')?.addEventListener('click', () => importFile(app));
}

async function loadNotes(app) {
  const list = document.getElementById('notes-list');
  if (!list) return;
  const notes = await app.storage.getMemory('notes');
  const notesList = notes ? JSON.parse(notes) : [];

  if (notesList.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>No notes yet</h3>
        <p>Create your first note or import a file.</p>
      </div>`;
    return;
  }

  list.innerHTML = notesList.map((n, i) => `
    <div class="card" style="cursor:pointer" data-note="${i}">
      <div class="card-header">
        <div class="card-title">${n.title || 'Untitled'}</div>
        <span class="card-subtitle">${new Date(n.updatedAt).toLocaleDateString()}</span>
      </div>
      <div class="card-body" style="margin-top:4px">${(n.content || '').substring(0, 100)}${n.content?.length > 100 ? '...' : ''}</div>
    </div>
  `).join('');

  list.querySelectorAll('[data-note]').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.note);
      showNoteEditor(app, notesList[idx], idx);
    });
  });
}

function showNoteEditor(app, note = null, idx = -1) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" style="max-height:90vh">
      <div class="modal-header">
        <span class="modal-title">${note ? '✏️ Edit Note' : '📝 New Note'}</span>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="input-group"><label class="input-label">Title</label><input class="input-field" id="note-title" value="${note?.title || ''}" placeholder="Note title"/></div>
      <div class="input-group"><label class="input-label">Content</label><textarea class="input-field" id="note-content" rows="10" placeholder="Write your note...">${note?.content || ''}</textarea></div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary" id="note-save" style="flex:1">Save</button>
        ${note ? '<button class="btn btn-danger" id="note-delete" style="flex:1">Delete</button>' : ''}
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

  backdrop.querySelector('#note-save').onclick = async () => {
    const existing = await app.storage.getMemory('notes');
    const notes = existing ? JSON.parse(existing) : [];
    const entry = {
      title: backdrop.querySelector('#note-title').value.trim() || 'Untitled',
      content: backdrop.querySelector('#note-content').value,
      updatedAt: Date.now()
    };
    if (idx >= 0) notes[idx] = entry;
    else notes.unshift(entry);
    await app.storage.setMemory('notes', JSON.stringify(notes));
    app.device.showToast('Note saved!');
    backdrop.remove();
    loadNotes(app);
  };

  backdrop.querySelector('#note-delete')?.addEventListener('click', async () => {
    const existing = await app.storage.getMemory('notes');
    const notes = existing ? JSON.parse(existing) : [];
    notes.splice(idx, 1);
    await app.storage.setMemory('notes', JSON.stringify(notes));
    app.device.showToast('Note deleted');
    backdrop.remove();
    loadNotes(app);
  });
}

function importFile(app) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.md,.json,.csv,.log';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const existing = await app.storage.getMemory('notes');
      const notes = existing ? JSON.parse(existing) : [];
      notes.unshift({
        title: file.name,
        content: reader.result,
        updatedAt: Date.now()
      });
      await app.storage.setMemory('notes', JSON.stringify(notes));
      app.device.showToast(`"${file.name}" imported!`);
      loadNotes(app);
    };
    reader.readAsText(file);
  };
  input.click();
}
