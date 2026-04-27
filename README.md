# ClawDroid 🦞

**Open-source Android alternative to [OpenClaw](https://github.com/openclaw/openclaw)**

Your personal AI assistant running directly on your Android phone — no root required.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **AI Chat** | Multi-provider: OpenAI, Anthropic, Google Gemini, Ollama (local), or custom gateway |
| 📡 **Channels** | Connect WhatsApp, Telegram, Discord, Slack, Signal, Matrix, IRC, and more |
| 🎙️ **Voice Mode** | Talk to your AI with speech-to-text and text-to-speech |
| 🔧 **Skills** | Extensible plugin system with 12+ built-in skills |
| ⚡ **Automation** | Cron-like scheduling, daily digests, recurring tasks |
| 📁 **Files** | Notes, file import, and document management |
| 🖥️ **Gateway** | Connect to OpenClaw gateway on your PC for full agent powers |
| 🔔 **Notifications** | Local push notifications for reminders and alerts |
| 📷 **Camera** | Take photos and attach images to conversations |
| 📍 **Location** | GPS access for location-aware features |
| 🧠 **Memory** | Persistent conversation history stored locally |
| 📤 **Share** | Share content from any app directly to ClawDroid |

## 📱 Android Permissions (Non-Root)

- `INTERNET` — AI API calls & gateway connection
- `CAMERA` — Photo capture
- `RECORD_AUDIO` — Voice mode
- `ACCESS_FINE_LOCATION` — GPS features
- `READ_EXTERNAL_STORAGE` — File management
- `POST_NOTIFICATIONS` — Push notifications
- `VIBRATE` — Haptic feedback
- `RECEIVE_BOOT_COMPLETED` — Background automations
- `READ_CONTACTS` — Contacts skill (optional)
- `READ_CALENDAR` / `WRITE_CALENDAR` — Calendar skill (optional)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (recommended: Node 22+)
- **Android Studio** (for building APK)
- **Java JDK 17+**

### 1. Install Dependencies

```bash
cd claw
npm install
```

### 2. Build & Set Up Android Project

```bash
# Automated setup (recommended)
node scripts/setup-android.js

# OR manual steps:
npm run build
npx cap add android
npx cap sync android
```

### 3. Build APK

**Option A: Android Studio (recommended)**
```bash
npx cap open android
# Then in Android Studio: Build → Build Bundle / APK → Build APK
```

**Option B: Command Line**
```bash
cd android
./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

**Option C: Direct to device**
```bash
npx cap run android
```

### 4. Install on Phone

Transfer the APK to your phone and install it. Enable "Install from Unknown Sources" if needed.

## 🔧 Development

```bash
# Start dev server (web preview)
npm run dev

# Build and sync to Android
npm run android:build

# Open in Android Studio
npm run cap:open
```

## 🏗️ Project Structure

```
claw/
├── index.html                    # App entry point
├── package.json                  # Dependencies & scripts
├── capacitor.config.ts           # Capacitor (Android wrapper) config
├── vite.config.js                # Build tool config
├── src/
│   ├── main.js                   # Bootstrap
│   ├── app.js                    # App controller
│   ├── styles/
│   │   └── main.css              # Design system
│   ├── services/
│   │   ├── ai-service.js         # Multi-provider AI (OpenAI/Anthropic/Google/Ollama)
│   │   ├── storage-service.js    # IndexedDB persistent storage
│   │   ├── device-service.js     # Camera, GPS, haptics, share
│   │   ├── notification-service.js  # Local push notifications
│   │   ├── channel-service.js    # Messaging platform integrations
│   │   ├── automation-service.js # Task scheduling & cron
│   │   └── voice-service.js      # Speech recognition & synthesis
│   ├── pages/
│   │   ├── chat.js               # AI conversation UI
│   │   ├── channels.js           # Channel management
│   │   ├── skills.js             # Skills/plugins
│   │   ├── automation.js         # Automation manager
│   │   ├── files.js              # File browser & notes
│   │   ├── gateway.js            # Gateway connection
│   │   └── settings.js           # App settings
│   └── components/
│       └── navigation.js         # Sidebar & bottom nav
├── android-template/             # Android native configs
│   ├── AndroidManifest.xml       # All permissions
│   ├── network_security_config.xml
│   ├── file_paths.xml
│   └── styles.xml                # Dark theme
├── scripts/
│   └── setup-android.js          # Automated build script
└── public/                       # Static assets
```

## 🔌 AI Provider Setup

### OpenAI
1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Settings → AI Provider → OpenAI → Paste key

### Anthropic
1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Settings → AI Provider → Anthropic → Paste key

### Google Gemini
1. Get API key from [aistudio.google.com](https://aistudio.google.com)
2. Settings → AI Provider → Google → Paste key

### Ollama (Local)
1. Install [Ollama](https://ollama.com) on your PC
2. Run: `ollama serve` and `ollama pull llama3`
3. Settings → AI Provider → Ollama

### OpenClaw Gateway
1. Install OpenClaw on your PC: `npm install -g openclaw@latest`
2. Run: `openclaw onboard --install-daemon`
3. Gateway tab → Enter your PC's IP:18789

## 📜 License

MIT License — Based on [OpenClaw](https://github.com/openclaw/openclaw)

---

**ClawDroid** — *Your AI. Your Device. Your Rules.* 🦞
