// ═══════════════════════════════════════════════
// Navigation Components — Sidebar & Bottom Nav
// ═══════════════════════════════════════════════

const navItems = [
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'channels', icon: '📡', label: 'Channels' },
  { id: 'skills', icon: '🔧', label: 'Skills' },
  { id: 'automation', icon: '⚡', label: 'Automation' },
  { id: 'files', icon: '📁', label: 'Files' },
  { id: 'gateway', icon: '🖥️', label: 'Gateway' },
];

export function renderSidebar(container, app) {
  container.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-profile">
        <div class="profile-avatar">🦞</div>
        <div class="profile-info">
          <span class="profile-name">${app.storage.getSetting('user_name', 'User')}</span>
          <span class="profile-status"><span class="status-dot online"></span> Online</span>
        </div>
      </div>
    </div>
    <div class="sidebar-nav">
      ${navItems.map(n => `
        <button class="nav-item ${n.id === app.currentPage ? 'active' : ''}" data-page="${n.id}">
          <span style="font-size:18px">${n.icon}</span><span>${n.label}</span>
        </button>
      `).join('')}
      <div class="nav-divider"></div>
      <button class="nav-item ${app.currentPage === 'settings' ? 'active' : ''}" data-page="settings">
        <span style="font-size:18px">⚙️</span><span>Settings</span>
      </button>
    </div>
    <div class="sidebar-footer">
      <span class="sidebar-version">ClawDroid v1.0.0 • Open Source</span>
    </div>
  `;
  container.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => app.navigateTo(btn.dataset.page));
  });
}

export function renderBottomNav(container, app) {
  const bottomItems = [
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'channels', icon: '📡', label: 'Channels' },
    { id: 'skills', icon: '🔧', label: 'Skills' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];
  container.innerHTML = bottomItems.map(n => `
    <button class="bottom-nav-item ${n.id === app.currentPage ? 'active' : ''}" data-page="${n.id}">
      <span style="font-size:20px">${n.icon}</span><span>${n.label}</span>
    </button>
  `).join('');
  container.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      app.navigateTo(btn.dataset.page);
      renderBottomNav(container, app);
    });
  });
}
