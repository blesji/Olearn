# Technology Stack & Architectural Decision Records (ADR) — OLearn

## 1. Confirmed Technology Stack & Versions

| Layer | Technology | Version | Purpose / Rationale |
|---|---|---|---|
| **Language** | TypeScript | `^5.6.3` | Strong static typing, config validation, refactoring safety |
| **View Framework** | React | `^18.3.1` | Component modularity, state-driven rendering |
| **Build System** | Vite | `^5.4.11` | Sub-second HMR, optimized tree-shaken production bundles |
| **Android Packaging** | Capacitor | `^8.1.2` | Clean web-to-native Android bridge, zero Cordova legacy bloat |
| **Capacitor Core Plugins**| `@capacitor/app`, `@capacitor/android` | `^8.1.2` | Hardware back-button listener, app lifecycle management |
| **Styling** | Tailwind CSS | `^3.4.15` | Accessible ergonomic utility tokens, responsive layout |
| **CSS Processing** | PostCSS & Autoprefixer | `^8.4.49`, `^10.4.20` | Vendor prefixing, CSS compatibility |
| **Audio Processing** | Web Audio API | Native Browser | Zero-latency synthesized harmonic chimes (D5 $\rightarrow$ A5, E4 $\rightarrow$ C4) |
| **Speech APIs** | Web Speech API | Native Browser | Free, offline, zero-network speech recognition and TTS on Android Chrome |
| **Testing** | Vitest & React Testing Library | `^2.1.9`, `^16.1.0` | Ultra-fast native ESM test runner with JSDOM simulation |
| **Iconography** | Lucide React | `^1.16.0` | High-contrast, clean vector iconography |
| **Animations** | Canvas Confetti | `^1.9.4` | Lightweight celebration particles for task completion |
| **Native SDK Target** | Android SDK Platform 36 | API 36 (Android 16.0) | High-performance modern Android runtime with `minSdkVersion = 24` |
| **Build Automation** | `scripts/build-apk.js` | Node.js | Single-command automated compilation with dynamic Android Studio JBR resolution |

---

## 2. Architectural Decision Records (ADRs)

### ADR-01: Packaging Strategy — Capacitor 8 vs Cordova vs React Native
- **Context**: The original prototype was built with React and Vite. We needed to package it for Android deployment while maintaining offline capabilities and web development velocity.
- **Alternatives Considered**:
  1. *React Native*: Would require rewriting all HTML/CSS replica components into native primitives (`<View>`, `<Text>`), throwing away working modules.
  2. *Apache Cordova*: Outdated, brittle build tooling, unmaintained plugin ecosystem.
  3. *Capacitor 8*: Native asset bundling, standard Android Studio / Gradle project, clean integration with existing Vite output.
- **Decision**: Adopt **Capacitor 8**.
- **Consequences**: Zero rewrites of working simulation components; production build synchronizes cleanly with `dist/` in under 350ms; direct access to native Android back navigation via `@capacitor/app`.

### ADR-02: Sandboxed Interactive Replicas vs OS Accessibility Overlays
- **Context**: Teaching real smartphone tasks could theoretically be done by drawing overlays over live third-party apps (WhatsApp, Google Pay).
- **Evaluation**: Drawing overlays over external apps requires Android's `BIND_ACCESSIBILITY_SERVICE` permission. This permission:
  - Is classified by Google Play as high-risk and dangerous for financial applications.
  - Breaks frequently whenever WhatsApp or Google Pay updates their native UI layouts.
  - Can accidentally trigger real UPI transactions or financial fraud.
- **Decision**: Build **self-contained, sandboxed replica components** (`WhatsAppReplica.tsx`, `GPayReplica.tsx`).
- **Consequences**: 100% financial safety, zero risk of real money loss, zero reliance on external app updates, zero accessibility permission hurdles on Google Play.

### ADR-03: Zero-Network Deterministic Local Intent Routing vs Remote LLM
- **Context**: "Ask Me" needs to understand senior user queries in 3 languages (English, Hindi, Malayalam).
- **Alternatives Considered**:
  1. *Remote LLM API (e.g. GPT-4)*: Requires continuous high-speed internet; introduces 1.5s–3s latency; incurs recurring API costs; fails completely offline in rural India.
  2. *Deterministic Local Semantic Keyword Matcher*: Runs synchronously in $< 5$ms on device CPU; operates 100% offline; predictable and testable.
- **Decision**: Make the **Local Semantic Matcher** the primary intent router, with optional LLM classification only when explicitly enabled by user API key.
- **Consequences**: Flawless offline discovery for all 9 tasks with zero latency and zero API cost.

### ADR-04: Automated Single-Command Native Build (`npm run android:build`)
- **Context**: Compiling an Android APK typically requires opening Android Studio, manually syncing Gradle, or having `JAVA_HOME` and Android SDK properly exported in the command line environment. If developers or QA engineers run `gradlew` in a terminal without `JAVA_HOME` set, the build fails.
- **Alternatives Considered**:
  1. *Require manual Android Studio GUI usage for all builds*: Fragile; requires IDE navigation and can be blocked by initial sync state.
  2. *Require manual global environment variable configuration (`JAVA_HOME`)*: Prone to configuration drift and requires system restarts.
  3. *Automated Node.js Build Script (`scripts/build-apk.js`)*: Automatically locates Android Studio's bundled JBR (`C:\Program Files\Android\Android Studio\jbr`), sets process environment variables dynamically, and invokes `gradlew.bat assembleDebug`.
- **Decision**: Implement **`scripts/build-apk.js`** wired to **`npm run android:build`**.
- **Consequences**: Flawless 1-step build in any shell without manual Java setup; emits `app-debug.apk` directly with verified size and path logging.

