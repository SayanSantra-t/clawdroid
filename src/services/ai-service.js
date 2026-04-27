// ═══════════════════════════════════════════════
// AIService — Multi-provider LLM integration (OpenAI, Anthropic, Google, Ollama)
// ═══════════════════════════════════════════════

export class AIService {
  constructor(storage) {
    this.storage = storage;
    this.providers = {
      openai: { name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'], endpoint: 'https://api.openai.com/v1/chat/completions' },
      anthropic: { name: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'], endpoint: 'https://api.anthropic.com/v1/messages' },
      google: { name: 'Google', models: ['gemini-3.1-pro', 'gemini-3.1-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b'], endpoint: 'https://generativelanguage.googleapis.com/v1beta/models' },
      ollama: { name: 'Ollama (Local)', models: ['llama3', 'mistral', 'codellama'], endpoint: 'http://localhost:11434/api/chat' },
      custom: { name: 'Custom / Gateway', models: ['default'], endpoint: '' },
      nano: { name: 'Google AI Edge', models: ['default'], endpoint: 'window.ai' }
    };
    this.conversationHistory = [];
    this.systemPrompt = `You are ClawDroid, a personal AI assistant running on the user's Android device. You are helpful, concise, and capable.
You have access to native Android capabilities. To use them, you MUST output a command in this exact format:
<tool_call>{"name": "methodName", "args": {"param1": "value"}}</tool_call>

Available tools:
- getBatteryInfo(): Get battery level and charging status.
- getDeviceInfo(): Get device model, OS, etc.
- getNetworkStatus(): Get wifi/cellular connection status.
- getCurrentPosition(): Get GPS coordinates.
- showToast(message): Show a popup notification on the screen.
- hapticFeedback(type): Vibrate the device (type: 'light', 'medium', 'heavy').
- runTermuxCommand(executable, args, background): Run a Termux API command (e.g. executable: '/data/data/com.termux/files/usr/bin/termux-camera-photo', args: ['-c', '0', '/sdcard/photo.jpg'], background: true).

If you use a tool, output ONLY the tool call, then wait for the tool result to be provided.`;
  }

  getProvider() { return this.storage.getSetting('ai_provider', 'openai'); }
  getModel() { return this.storage.getSetting('ai_model', 'gpt-4o-mini'); }
  getApiKey() { return this.storage.getSetting('ai_api_key', ''); }
  getGatewayUrl() { return this.storage.getSetting('gateway_url', ''); }

  async sendMessage(userMessage, onChunk = null) {
    const provider = this.getProvider();
    const model = this.getModel();
    const apiKey = this.getApiKey();

    this.conversationHistory.push({ role: 'user', content: userMessage });

    // Keep last 40 messages for context
    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-40);
    }

    try {
      let response = await this._callProvider(provider, model, apiKey);
      this.conversationHistory.push({ role: 'assistant', content: response });

      // Check for universal tool calls
      const toolMatch = response.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
      if (toolMatch && this.device) {
        try {
          const toolReq = JSON.parse(toolMatch[1].trim());
          let toolResult = '';
          if (this.device[toolReq.name]) {
            const args = toolReq.args ? Object.values(toolReq.args) : [];
            const res = await this.device[toolReq.name](...args);
            toolResult = JSON.stringify(res || { success: true });
          } else {
            toolResult = `Error: Tool ${toolReq.name} not found`;
          }
          
          // Feed result back
          this.conversationHistory.push({ role: 'user', content: `Tool result: ${toolResult}` });
          const secondResponse = await this._callProvider(provider, model, apiKey);
          this.conversationHistory.push({ role: 'assistant', content: secondResponse });
          return response + '\n\n' + secondResponse;
        } catch (e) {
          return response + `\n\n[Tool Execution Error: ${e.message}]`;
        }
      }

      return response;
    } catch (err) {
      const errMsg = `⚠️ Error: ${err.message || 'Failed to reach AI provider'}`;
      this.conversationHistory.push({ role: 'assistant', content: errMsg });
      return errMsg;
    }
  }

  async _callProvider(provider, model, apiKey) {
    switch (provider) {
      case 'openai': return await this._callOpenAI(model, apiKey);
      case 'anthropic': return await this._callAnthropic(model, apiKey);
      case 'google': return await this._callGoogle(model, apiKey);
      case 'ollama': return await this._callOllama(model);
      case 'custom': return await this._callGateway(this.conversationHistory[this.conversationHistory.length-1].content);
      case 'nano': return await this._callNano(this.conversationHistory[this.conversationHistory.length-1].content);
      default: return 'No AI provider configured.';
    }
  }

  async _callOpenAI(model, apiKey, onChunk) {
    if (!apiKey) return 'Please set your OpenAI API key in Settings.';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model, stream: false,
        messages: [{ role: 'system', content: this.systemPrompt }, ...this.conversationHistory]
      })
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response.';
  }

  async _callAnthropic(model, apiKey, onChunk) {
    if (!apiKey) return 'Please set your Anthropic API key in Settings.';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model, max_tokens: 4096, system: this.systemPrompt,
        messages: this.conversationHistory.map(m => ({ role: m.role, content: m.content }))
      })
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.content?.[0]?.text || 'No response.';
  }

  async _callGoogle(model, apiKey, onChunk) {
    if (!apiKey) return 'Please set your Google AI API key in Settings.';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contents = this.conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: this.systemPrompt }] },
        contents
      })
    });
    if (!res.ok) throw new Error(`Google ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  }

  async _callOllama(model, onChunk) {
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, stream: false,
        messages: [{ role: 'system', content: this.systemPrompt }, ...this.conversationHistory]
      })
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const data = await res.json();
    return data.message?.content || 'No response.';
  }

  async _callGateway(message, onChunk) {
    const url = this.getGatewayUrl();
    if (!url) return 'Please set your Gateway URL in Settings → Gateway.';
    const res = await fetch(`${url}/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message })
    });
    if (!res.ok) throw new Error(`Gateway ${res.status}`);
    const data = await res.json();
    return data.output?.[0]?.content?.[0]?.text || data.response || 'No response.';
  }

  async _callNano(message) {
    if (typeof window === 'undefined' || !window.ai || !window.ai.languageModel) {
      return 'Google AI Edge (window.ai.languageModel) is not available on this device or browser. Ensure you are using a supported environment like Chrome 131+ with Gemini Nano enabled in flags.';
    }
    try {
      const session = await window.ai.languageModel.create({
        systemPrompt: this.systemPrompt
      });
      // Convert history to text format for simple prompt
      const historyText = this.conversationHistory
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\\n');
      const response = await session.prompt(historyText);
      session.destroy();
      return response;
    } catch (e) {
      return `On-device AI error: ${e.message}`;
    }
  }

  clearHistory() { this.conversationHistory = []; }
}
