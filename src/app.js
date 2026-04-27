// ═══════════════════════════════════════════════
// ClawDroid — App Controller
// ═══════════════════════════════════════════════
import { StorageService } from './services/storage-service.js';
import { AIService } from './services/ai-service.js';
import { DeviceService } from './services/device-service.js';
import { NotificationService } from './services/notification-service.js';
import { ChannelService } from './services/channel-service.js';
import { AutomationService } from './services/automation-service.js';
import { VoiceService } from './services/voice-service.js';
import { renderChat } from './pages/chat.js';
import { renderChannels } from './pages/channels.js';
import { renderSkills } from './pages/skills.js';
import { renderAutomation } from './pages/automation.js';
import { renderFiles } from './pages/files.js';
import { renderGateway } from './pages/gateway.js';
import { renderSettings } from './pages/settings.js';
import { renderSidebar, renderBottomNav } from './components/navigation.js';

export class App {
  constructor() {
    this.currentPage = 'chat';
    this.storage = new StorageService();
    this.ai = new AIService(this.storage);
    this.device = new DeviceService();
    this.ai.device = this.device; // Link device to AI for tool calling
    this.notifications = new NotificationService();
    this.channels = new ChannelService(this.storage);
    this.automation = new AutomationService(this.storage);
    this.voice = new VoiceService();
  }

  async init() {
    await this.storage.init();
    this.renderShell();
    this.bindEvents();
    // Splash -> App transition
    setTimeout(() => {
      document.getElementById('splash-screen')?.classList.add('fade-out');
      document.getElementById('app')?.classList.remove('hidden');
      setTimeout(() => document.getElementById('splash-screen')?.remove(), 500);
    }, 1800);
    this.navigateTo('chat');
    this.notifications.requestPermission();
    
    // Initialize channel polling and handle incoming messages
    this.channels.onMessageReceived = async (channelId, message) => {
      try {
        const reply = await this.ai.sendMessage(message, null);
        await this.channels.sendToChannel(channelId, reply);
      } catch (err) {
        console.error('Failed to handle incoming channel message:', err);
      }
    };
    await this.channels.startPolling();
  }

  renderShell() {
    renderSidebar(document.getElementById('sidebar'), this);
    renderBottomNav(document.getElementById('bottom-nav'), this);
  }

  bindEvents() {
    // Menu toggle
    document.getElementById('btn-menu')?.addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
    // Voice
    document.getElementById('btn-voice')?.addEventListener('click', () => this.toggleVoice());
  }

  navigateTo(page) {
    this.currentPage = page;
    this.closeSidebar();
    const main = document.getElementById('main-content');
    const title = document.getElementById('page-title');
    const pageTitles = { chat: 'ClawDroid', channels: 'Channels', skills: 'Skills', automation: 'Automation', files: 'Files', gateway: 'Gateway', settings: 'Settings' };
    title.textContent = pageTitles[page] || 'ClawDroid';
    // Update nav active states
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    // Render page
    const renderers = { chat: renderChat, channels: renderChannels, skills: renderSkills, automation: renderAutomation, files: renderFiles, gateway: renderGateway, settings: renderSettings };
    if (renderers[page]) renderers[page](main, this);
  }

  toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
  }

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.add('hidden');
  }

  toggleVoice() {
    const overlay = document.getElementById('voice-overlay');
    if (overlay.classList.contains('hidden')) {
      overlay.classList.remove('hidden');
      this.voice.startListening((transcript) => {
        document.getElementById('voice-transcript').textContent = transcript;
      }, (final) => {
        overlay.classList.add('hidden');
        this.voice.stopListening();
        if (final && this.currentPage === 'chat') {
          const input = document.getElementById('chat-input');
          if (input) { input.value = final; input.dispatchEvent(new Event('input')); }
        }
      });
    } else {
      overlay.classList.add('hidden');
      this.voice.stopListening();
    }
  }
}
