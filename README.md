# OLearn — Elderly Digital Literacy Trainer

OLearn is an Android-first, offline-first digital literacy training application designed specifically for senior citizens and low-literacy users in India. It teaches 8 core real-world smartphone tasks across WhatsApp and Google Pay using sandboxed mock replica interfaces (never fragile overlays on real apps), clear voice narration in English, Hindi, and Malayalam, and a single-action highlight guidance system with zero progress penalties.

---

## Key Features

- **Sandboxed Interactive Replicas**: High-fidelity, self-contained simulations of WhatsApp and Google Pay interfaces. No dangerous Android accessibility permissions (`BIND_ACCESSIBILITY_SERVICE`) and zero connection to real financial or payment gateways.
- **Config-Driven Task Engine**: Curricula defined entirely in `src/config/tasks.json` with step-by-step guidance, single highlighted active element, and gentle harmonic nudges (330Hz $\rightarrow$ 260Hz) on wrong taps.
- **8 Core Tasks + Extensible 9th Task**:
  - **WhatsApp**: Send text message, Send photo, Make voice call, Make video call.
  - **Google Pay**: Check bank balance, Scan QR code & pay, Send money to saved contact, View transaction history.
  - **9th Modular Task (Extensibility Test)**: Send voice note — added solely via JSON configuration and audio assets with zero code modifications.
- **Trilingual Voice Narration**:
  - 93 pre-bundled offline MP3 audio clips located in `public/assets/audio/` (31 in `en/`, 31 in `hi/`, 31 in `ml/`).
  - Bundled directly into the native Android application bundle for 100% offline playback.
  - Web Audio API zero-latency acoustic chimes and nudges synthesized directly on device CPU.
- **"Ask Me" Natural Language Task Router**:
  - Large centered microphone with persistent "Tap and speak" label.
  - Natural language intent routing in English, Hindi, and Malayalam.
  - Clarifying question dialog on ambiguous inputs (e.g. Voice Call vs Video Call).
  - Web Speech API and Whisper-1 STT / GPT-4o-mini classification support with local semantic keyword fallback.
- **Senior Accessibility Standards (WCAG 2.1 AA Compliant)**:
  - Typography: Minimum 20sp body text, 24–28sp bold headers, nothing below 18sp.
  - Accessible viewport: Unlocked pinch-to-zoom with `viewport-fit=cover`.
  - Accessible touch targets: Minimum 64dp height for task buttons, 120dp for Home app icons.
  - TalkBack & Keyboard Support: Interactive targets implement `role="button"`, `tabIndex={0}`, `aria-label`, and Enter/Space event handlers.
  - Native Android back navigation via `@capacitor/app` hardware back button listener.

---

## Technology Stack

- **Runtime & View Layer**: React 18 (`^18.3.1`), TypeScript 5.6 (`^5.6.3`)
- **Build System**: Vite 5 (`^5.4.11`)
- **Styling**: Tailwind CSS 3.4 (`^3.4.15`), PostCSS, Autoprefixer
- **Android Shell & Packaging**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/cli`)
- **Testing**: Vitest 2 (`^2.1.9`)
- **Iconography**: Lucide React (`^1.16.0`)
- **Celebration Effects**: Canvas Confetti (`^1.9.4`)

---

## Reproducible Build & Developer Commands

### 1. Installation from Clean Checkout
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Starts the Vite development server with local network access enabled at `http://localhost:5173/`.

### 3. Run Static Type Checking & Linting
```bash
npm run lint
```
Executes `tsc --noEmit` across all modules without writing output files.

### 4. Run Automated Test Suite
```bash
npm test
```
Executes **123 unit, lifecycle, security, accessibility, responsiveness, and end-to-end component simulation tests** across 12 test suites via Vitest:
- `fontSizeAccessibility.test.tsx` (10 tests): Validates the global text size slider in Settings (16–30sp), increment/decrement tap targets, reset to default (20sp), live sample text rendering, ARIA slider semantics, and layout stability at min/max scales across WhatsApp and Google Pay.
- `deviceValidationQA.test.tsx` (17 tests): Validates Google Pay safety invariants across all screens, sandboxed UPI PIN keypad touch targets, authentic WhatsApp call screen controls, trilingual balance checking (EN, HI, ML), rapid double-tap lockout, and airplane mode offline resilience.
- `mobileResponsiveness.test.tsx` (14 tests): Verifies responsive mobile layouts across standard Android viewports (320px–412px), text truncation prevention, action buttons accessibility, and keyboard input responsiveness.
- `taskRouterService.test.ts` (23 tests): Verifies trilingual natural language intent routing (EN, HI, ML), short queries, phonetic variations, ambiguity resolution, and out-of-scope intent detection.
- `nineTutorials.test.tsx` (14 tests): Complete end-to-end simulation across all 9 individual tutorials (Tasks 1–9), message/voice note timing verification, repeatability ("Practice Again"), wrong tap guidance, rapid double-tap lockout, exit modal protection, and configuration error rendering.
- `storageService.test.ts` (11 tests): Verifies local user profile, language choice persistence, font-size persistence and boundary clamping (16–30sp), CSS typography token scaling, isolated completion history, legacy profile migration, and in-memory fallback.
- `taskValidator.test.ts` (9 tests): Validates configuration rules, detecting missing IDs, bad apps, empty steps, invalid screens/elements, and duplicate IDs.
- `securitySafety.test.ts` (7 tests): Enforces financial simulation invariants (fictional mock fixtures), scans production code for forbidden payment gateway endpoints and third-party trackers, and verifies minimal Android permissions.
- `seniorAccessibility.test.tsx` (5 tests): Verifies senior accessibility standards, non-threatening wrong-tap handling, 64dp touch target sizes, readable 20sp+ typography, independent text instruction visibility, and mute/speech rate controls.
- `offlineStorageAudio.test.ts` (5 tests): Verifies 100% offline runtime (`navigator.onLine = false`), missing audio fallback, play/pause/resume/replay controls, narration safety timeout, and persistence across cold restarts.
- `tasksConfig.test.ts` (4 tests): Verifies all 9 tasks, 31 steps, and physical existence of all 93 audio files in `public/assets/audio/`.
- `tutorialLifecycle.test.ts` (4 tests): Verifies 9 tasks / 31 steps exact inventory, WhatsApp representative workflow, Google Pay representative workflow, and zero progress loss across repetitions.

### 5. Production Web Build
```bash
npm run build
```
Executes `tsc && vite build`, creating the optimized production bundle in `dist/`.

### 6. Android Synchronization
```bash
npm run android:sync
```
Builds the web bundle and synchronizes all web assets, audio files, and plugins into `android/app/src/main/assets/public/`.

### 7. Open in Android Studio
```bash
npm run android:open
```
Launches the native project in Android Studio.

### 8. One-Command Debug APK Build (Automated CLI)
```bash
npm run android:build
```
Executes the complete end-to-end build pipeline in a single step:
1. Compiles the TypeScript/Vite web application (`npm run build`).
2. Synchronizes all assets and plugins to the native Android directory (`npx cap sync android`).
3. Automatically locates Android Studio's bundled JBR/JDK (no manual `JAVA_HOME` configuration needed).
4. Invokes Gradle to compile and assemble the debug APK.
5. Emits the installable APK to:
   ```text
   android/app/build/outputs/apk/debug/app-debug.apk (~7.2 MB)
   ```

---

## Documentation Suite

Complete, verified project specifications and operational guides are maintained in `docs/`:
- [PRD.md](file:///c:/Users/georg/OLEARN/docs/PRD.md) — Product requirements, senior personas, curriculum scope.
- [ARCHITECTURE.md](file:///c:/Users/georg/OLEARN/docs/ARCHITECTURE.md) — System topology, state machines, data flow diagrams.
- [DESIGN_SYSTEM.md](file:///c:/Users/georg/OLEARN/docs/DESIGN_SYSTEM.md) — Senior accessibility standards, global font-size accessibility slider, contrast ratios.
- [DATABASE.md](file:///c:/Users/georg/OLEARN/docs/DATABASE.md) — Persistence model, LocalStorage schema, migrations, fallback.
- [SECURITY.md](file:///c:/Users/georg/OLEARN/docs/SECURITY.md) — Privacy, permissions, and financial simulation safeguards.
- [CODE_STYLE.md](file:///c:/Users/georg/OLEARN/docs/CODE_STYLE.md) — Code conventions and defensive engineering practices.
- [TESTING.md](file:///c:/Users/georg/OLEARN/docs/TESTING.md) — Automated (123 tests) and manual tests, physical device smoke test.
- [AGENTS.md](file:///c:/Users/georg/OLEARN/docs/AGENTS.md) — Repository instructions and non-negotiable rules for coding agents.
- [TECH_STACK.md](file:///c:/Users/georg/OLEARN/docs/TECH_STACK.md) — Dependencies, justified decisions, and ADRs.
- [SETUP_AND_CREATION_GUIDE.md](file:///c:/Users/georg/OLEARN/docs/SETUP_AND_CREATION_GUIDE.md) — Reproducible setup, APK compilation, and Android Studio troubleshooting.
- [IMPLEMENTATION_AUDIT.md](file:///c:/Users/georg/OLEARN/docs/IMPLEMENTATION_AUDIT.md) — Complete verification audit.
- [RELEASE_CHECKLIST.md](file:///c:/Users/georg/OLEARN/docs/RELEASE_CHECKLIST.md) — Android Release Candidate verification sign-off.
- [PILOT_EVALUATION.md](file:///c:/Users/georg/OLEARN/docs/PILOT_EVALUATION.md) — Senior user pilot study protocol & observation sheets.
- [REQUIREMENTS_TRACEABILITY.md](file:///c:/Users/georg/OLEARN/docs/REQUIREMENTS_TRACEABILITY.md) — Bidirectional requirements-to-tests matrix.

---

## Android Build Environment & Device Installation

### System Requirements
- **Android Studio**: Ladybug (2024.2+) or Meerkat
- **Android SDK**: Android SDK Platform 36 (`compileSdkVersion = 36`, `minSdkVersion = 24`)
- **JDK**: Java 17 or 21 (bundled automatically with Android Studio in `jbr/`)
- **Gradle**: Gradle 8.14.3 (wrapper provided in `android/gradlew.bat`)

### How to Install the APK on Your Phone
1. **Via Direct File Transfer**:
   - Copy `android/app/build/outputs/apk/debug/app-debug.apk` to your phone via USB cable, Google Drive, WhatsApp, or Bluetooth.
   - On the phone, open Files / Downloads, tap `app-debug.apk`, and tap **Install** (allow "Install Unknown Apps" if prompted).
2. **Via ADB**:
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```
3. **Via Android Studio**:
   - Connect phone with USB Debugging enabled $\rightarrow$ click the green **Run ▶** button in Android Studio.

### Troubleshooting: "Build Bundle(s) / APK(s) is locked / greyed out"
If Android Studio shows `(No Configuration Selected)` and the **Build** options are greyed out:
1. Click **File** $\rightarrow$ **Sync Project with Gradle Files** (or the **Elephant icon with circular arrow** in the top-right toolbar).
2. Ensure **Android SDK Platform 36** is installed (Tools $\rightarrow$ SDK Manager $\rightarrow$ SDK Platforms $\rightarrow$ check **Android 16.0 / API 36**).
3. Once Gradle sync finishes, the configuration switches to `app` and **Build APK(s)** unlocks. Alternatively, run `npm run android:build` directly in your terminal.
