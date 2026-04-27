// ═══════════════════════════════════════════════
// VoiceService — Speech recognition & synthesis
// ═══════════════════════════════════════════════

export class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this._initRecognition();
  }

  _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  startListening(onInterim, onFinal) {
    if (!this.recognition) {
      onFinal?.('Voice recognition not supported on this device.');
      return;
    }
    this.isListening = true;
    let finalTranscript = '';

    this.recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      onInterim?.(interim || finalTranscript);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onFinal?.(finalTranscript.trim());
    };

    this.recognition.onerror = (e) => {
      this.isListening = false;
      if (e.error !== 'aborted') onFinal?.(finalTranscript.trim() || null);
    };

    try { this.recognition.start(); } catch { /* already started */ }
  }

  stopListening() {
    this.isListening = false;
    try { this.recognition?.stop(); } catch { /* silent */ }
  }

  speak(text, onEnd) {
    if (!this.synthesis) return;
    this.synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    // Prefer a natural-sounding voice
    const voices = this.synthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Enhanced') || v.name.includes('Natural'));
    if (preferred) utterance.voice = preferred;
    if (onEnd) utterance.onend = onEnd;
    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    this.synthesis?.cancel();
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}
