# Coding Agent Guidelines & Repository Instructions — OLearn

## 1. Project Context & Non-Negotiable Invariants

OLearn is an Android-first, offline-first digital literacy trainer for seniors in India. When modifying or extending this repository, every AI coding agent must strictly adhere to these core rules:

1. **Zero Real Financial Bridges**: Never introduce real payment gateways, UPI intents (`upi://pay`), banking SDKs, or banking APIs. All financial transactions must remain mock fixtures in `mockData.ts` with prominent `<SimulationSafetyBanner />` disclaimers.
2. **100% Offline Integrity**: Core tutorials, replica screens, and audio narration must never depend on an active internet connection. Never make `fetch` or HTTP calls inside the core tutorial loop.
3. **Senior Accessibility Floor**:
   - Never set instructional or body text below **20sp / 20px**.
   - Never create interactive touch targets smaller than **64dp × 64dp** (and 120dp for primary home tiles).
   - Never implement punitive failure states on wrong taps; always use gentle nudges.
4. **Android-First Asset Synchronization**: After modifying any web assets, public files, or CSS, always synchronize Android assets via `npm run android:sync`.
5. **Preserve Green Test Suite**: All 79+ tests across 9 test suites must pass (`npm test` exit code 0).

---

## 2. Directory Structure & Key Files

```
OLEARN/
├── android/                   # Capacitor Android native project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml # Permissions (INTERNET, RECORD_AUDIO)
│   │   └── assets/public/     # Synchronized web bundle & audio files
├── public/
│   └── assets/audio/          # 93 Bundled MP3 audio narration files
│       ├── en/ (31 files)     # English recordings
│       ├── hi/ (31 files)     # Hindi recordings
│       └── ml/ (31 files)     # Malayalam recordings
├── src/
│   ├── config/
│   │   ├── tasks.json         # Master curriculum config (9 tasks / 31 steps)
│   │   ├── i18n.ts            # Trilingual dictionary (en, hi, ml)
│   │   └── mockData.ts        # Sandboxed fictional banking fixtures
│   ├── engine/
│   │   ├── TaskEngine.tsx     # Tutorial lifecycle state machine
│   │   └── HighlightTarget.tsx # Accessible single-action target guard
│   ├── replicas/
│   │   ├── WhatsAppReplica.tsx # WhatsApp simulation component
│   │   └── GPayReplica.tsx    # Google Pay simulation component
│   ├── screens/
│   │   ├── HomeScreen.tsx     # 120dp Home dashboard
│   │   ├── AskMeScreen.tsx    # Natural language intent discovery
│   │   ├── SettingsScreen.tsx # Settings & progress reset
│   │   └── LanguageSelectScreen.tsx # First-launch onboarding
│   ├── services/
│   │   ├── AudioService.ts    # Audio player, TTS fallback, WebAudio SFX
│   │   ├── StorageService.ts  # Memory + LocalStorage profile manager
│   │   ├── TaskRouterService.ts # Trilingual local semantic intent router
│   │   ├── STTService.ts      # Web Speech API + Whisper recorder
│   │   └── TaskValidator.ts   # Static configuration schema validator
│   └── __tests__/             # 9 Vitest automated test suites
├── docs/                      # Complete project documentation suite
├── capacitor.config.ts        # Capacitor configuration (com.olearn.app)
└── package.json               # Scripts & dependencies
```

---

## 3. Mandatory Verification Sequence for Agents

Before submitting changes, run these commands in order:

```bash
# 1. Typecheck
npm run lint

# 2. Automated Tests
npm test

# 3. Production Bundle
npm run build

# 4. Synchronize Android Native Shell
npm run android:sync
```

All commands must exit with code 0.
