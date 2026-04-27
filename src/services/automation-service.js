// ═══════════════════════════════════════════════
// AutomationService — Task scheduling & cron-like automation
// ═══════════════════════════════════════════════

export class AutomationService {
  constructor(storage) {
    this.storage = storage;
    this.timers = new Map();
  }

  async getAutomations() { return this.storage.getAutomations(); }

  async createAutomation(automation) {
    const auto = {
      id: `auto_${Date.now()}`,
      name: automation.name,
      description: automation.description || '',
      trigger: automation.trigger, // 'interval' | 'time' | 'event'
      triggerConfig: automation.triggerConfig, // { intervalMs, time, eventName }
      action: automation.action, // 'ai_message' | 'notification' | 'channel_send' | 'custom'
      actionConfig: automation.actionConfig, // { message, channelId, script }
      enabled: true,
      createdAt: Date.now(),
      lastRun: null,
      runCount: 0
    };
    await this.storage.saveAutomation(auto);
    if (auto.enabled) this._scheduleAutomation(auto);
    return auto;
  }

  async toggleAutomation(id) {
    const autos = await this.getAutomations();
    const auto = autos.find(a => a.id === id);
    if (!auto) return;
    auto.enabled = !auto.enabled;
    await this.storage.saveAutomation(auto);
    if (auto.enabled) this._scheduleAutomation(auto);
    else this._cancelAutomation(id);
    return auto;
  }

  async deleteAutomation(id) {
    this._cancelAutomation(id);
    await this.storage.deleteAutomation(id);
  }

  _scheduleAutomation(auto) {
    this._cancelAutomation(auto.id);
    if (auto.trigger === 'interval' && auto.triggerConfig?.intervalMs) {
      const timer = setInterval(() => this._runAutomation(auto), auto.triggerConfig.intervalMs);
      this.timers.set(auto.id, timer);
    } else if (auto.trigger === 'time' && auto.triggerConfig?.time) {
      this._scheduleDailyAt(auto);
    }
  }

  _scheduleDailyAt(auto) {
    const [hours, minutes] = auto.triggerConfig.time.split(':').map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    const timer = setTimeout(() => {
      this._runAutomation(auto);
      this._scheduleDailyAt(auto); // Reschedule for next day
    }, delay);
    this.timers.set(auto.id, timer);
  }

  async _runAutomation(auto) {
    auto.lastRun = Date.now();
    auto.runCount++;
    await this.storage.saveAutomation(auto);
    // The actual action execution happens via callback — app controller handles it
    if (this.onAutomationRun) this.onAutomationRun(auto);
  }

  _cancelAutomation(id) {
    if (this.timers.has(id)) {
      clearInterval(this.timers.get(id));
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
  }

  startAll() {
    this.getAutomations().then(autos => {
      autos.filter(a => a.enabled).forEach(a => this._scheduleAutomation(a));
    });
  }

  stopAll() {
    this.timers.forEach((_, id) => this._cancelAutomation(id));
  }

  getPresets() {
    return [
      { name: '☀️ Daily Digest', description: 'Get a morning summary of weather, calendar, and news', trigger: 'time', triggerConfig: { time: '08:00' }, action: 'ai_message', actionConfig: { message: 'Give me a morning digest: weather summary, top 3 news headlines, and any reminders for today.' } },
      { name: '📊 System Check', description: 'Check device battery and storage every 2 hours', trigger: 'interval', triggerConfig: { intervalMs: 7200000 }, action: 'ai_message', actionConfig: { message: 'Check my device status: battery level, storage usage, and network connectivity.' } },
      { name: '🔔 Reminder Ping', description: 'Send a reminder notification every hour', trigger: 'interval', triggerConfig: { intervalMs: 3600000 }, action: 'notification', actionConfig: { title: 'ClawDroid Reminder', body: 'Time to take a break and stretch! 🧘' } },
      { name: '📬 Evening Wrap-up', description: 'End-of-day summary at 9 PM', trigger: 'time', triggerConfig: { time: '21:00' }, action: 'ai_message', actionConfig: { message: 'Give me an evening wrap-up: summarize what we discussed today and any pending tasks.' } }
    ];
  }
}
