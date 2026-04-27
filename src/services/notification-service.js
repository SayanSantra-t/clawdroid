// ═══════════════════════════════════════════════
// NotificationService — Local notifications via Capacitor
// ═══════════════════════════════════════════════

export class NotificationService {
  constructor() {
    this._capacitorAvailable = typeof window !== 'undefined' && window.Capacitor;
    this._nextId = 1;
  }

  async requestPermission() {
    if (this._capacitorAvailable) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.requestPermissions();
        return perm.display === 'granted';
      } catch { /* fallback */ }
    }
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }

  async schedule(title, body, scheduleAt = null, id = null) {
    const notifId = id || this._nextId++;
    if (this._capacitorAvailable) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const notif = {
          notifications: [{
            title, body, id: notifId,
            schedule: scheduleAt ? { at: new Date(scheduleAt) } : undefined,
            smallIcon: 'ic_stat_icon',
            iconColor: '#6366f1'
          }]
        };
        await LocalNotifications.schedule(notif);
        return notifId;
      } catch (e) { console.warn('Notification failed:', e); }
    }
    // Web fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      if (scheduleAt) {
        const delay = new Date(scheduleAt).getTime() - Date.now();
        if (delay > 0) setTimeout(() => new Notification(title, { body }), delay);
      } else {
        new Notification(title, { body });
      }
    }
    return notifId;
  }

  async cancel(id) {
    if (this._capacitorAvailable) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch { /* silent */ }
    }
  }

  async cancelAll() {
    if (this._capacitorAvailable) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length) await LocalNotifications.cancel(pending);
      } catch { /* silent */ }
    }
  }
}
