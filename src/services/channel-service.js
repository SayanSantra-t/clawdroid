// ═══════════════════════════════════════════════
// ChannelService — Messaging channel integrations
// ═══════════════════════════════════════════════

export class ChannelService {
  constructor(storage) {
    this.storage = storage;
    this.channelTypes = [
      { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'channel-whatsapp', desc: 'Connect via WhatsApp Business API or gateway bridge' },
      { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'channel-telegram', desc: 'Connect via Telegram Bot API token' },
      { id: 'discord', name: 'Discord', icon: '🎮', color: 'channel-discord', desc: 'Connect via Discord bot token' },
      { id: 'slack', name: 'Slack', icon: '💼', color: 'channel-slack', desc: 'Connect via Slack app token' },
      { id: 'signal', name: 'Signal', icon: '🔒', color: 'channel-signal', desc: 'Connect via Signal CLI or gateway' },
      { id: 'webchat', name: 'WebChat', icon: '🌐', color: 'channel-whatsapp', desc: 'Built-in web chat interface' },
      { id: 'matrix', name: 'Matrix', icon: '🔷', color: 'channel-telegram', desc: 'Connect via Matrix/Element homeserver' },
      { id: 'irc', name: 'IRC', icon: '📡', color: 'channel-discord', desc: 'Connect to IRC networks' }
    ];
    this.activePolls = {};
    this.onMessageReceived = null;
  }

  getChannelTypes() { return this.channelTypes; }

  async getConnectedChannels() { return this.storage.getChannels(); }

  async startPolling() {
    const channels = await this.getConnectedChannels();
    channels.forEach(channel => {
      if (channel.type === 'telegram') {
        this._startTelegramPolling(channel);
      }
    });
  }

  stopPolling() {
    for (const channelId in this.activePolls) {
      this.activePolls[channelId] = false;
    }
  }

  async connectChannel(channelConfig) {
    const channel = {
      id: `${channelConfig.type}_${Date.now()}`,
      type: channelConfig.type,
      name: channelConfig.name || this.channelTypes.find(c => c.id === channelConfig.type)?.name,
      config: channelConfig,
      status: 'connected',
      connectedAt: Date.now()
    };
    await this.storage.saveChannel(channel);
    if (channel.type === 'telegram') {
      this._startTelegramPolling(channel);
    }
    return channel;
  }

  async disconnectChannel(id) {
    if (this.activePolls[id]) {
      this.activePolls[id] = false;
    }
    await this.storage.deleteChannel(id);
  }

  async sendToChannel(channelId, message) {
    const channel = (await this.getConnectedChannels()).find(c => c.id === channelId);
    if (!channel) throw new Error('Channel not found');

    const gatewayUrl = this.storage.getSetting('gateway_url', '');
    if (gatewayUrl) {
      // Route through OpenClaw gateway
      try {
        await fetch(`${gatewayUrl}/api/channels/${channel.type}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: channel.config, message })
        });
      } catch (e) {
        throw new Error(`Failed to send via gateway: ${e.message}`);
      }
    }

    // For direct API integrations
    switch (channel.type) {
      case 'telegram': return this._sendTelegram(channel.config, message);
      case 'discord': return this._sendDiscord(channel.config, message);
      default: return { sent: true, via: 'local' };
    }
  }

  async _sendTelegram(config, message) {
    if (!config.botToken || !config.chatId) throw new Error('Missing Telegram config');
    const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: config.chatId, text: message, parse_mode: 'Markdown' })
    });
    if (!res.ok) throw new Error(`Telegram error: ${res.status}`);
    return res.json();
  }

  async _sendDiscord(config, message) {
    if (!config.webhookUrl) throw new Error('Missing Discord webhook URL');
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message, username: 'ClawDroid' })
    });
    if (!res.ok) throw new Error(`Discord error: ${res.status}`);
    return { sent: true };
  }

  _startTelegramPolling(channel) {
    if (this.activePolls[channel.id]) return;
    this.activePolls[channel.id] = true;
    let lastUpdateId = 0;

    const poll = async () => {
      if (!this.activePolls[channel.id]) return;
      try {
        const res = await fetch(`https://api.telegram.org/bot${channel.config.botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await res.json();
        if (data.ok && data.result) {
          for (const update of data.result) {
            lastUpdateId = update.update_id;
            // Only process new messages (from the last 60 seconds)
            if (update.message && update.message.text && update.message.chat.id.toString() === channel.config.chatId.toString()) {
              const now = Math.floor(Date.now() / 1000);
              if (now - update.message.date < 60) {
                if (this.onMessageReceived) {
                  this.onMessageReceived(channel.id, update.message.text);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Telegram poll error', e);
      }
      if (this.activePolls[channel.id]) {
        setTimeout(poll, 1000);
      }
    };
    poll();
  }
}
