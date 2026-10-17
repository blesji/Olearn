# Android Release Candidate Verification Checklist — OLearn

## 1. Release Candidate Identity & Configuration

| Check Item | Required Specification | Status | Evidence / Verification Method |
|---|---|---|---|
| **App Name** | `OLearn` | Verified | `android/app/src/main/res/values/strings.xml` $\rightarrow$ `app_name: OLearn` |
| **Package ID** | `org.olearn.app` | Verified | `capacitor.config.ts` & `android/app/build.gradle` $\rightarrow$ `applicationId: org.olearn.app` |
| **Min SDK** | `API 24` (Android 7.0 Nougat) | Verified | `android/variables.gradle` $\rightarrow$ `minSdkVersion = 24` |
| **Target SDK** | `API 34 / 36` | Verified | `android/variables.gradle` $\rightarrow$ `compileSdkVersion = 36`, `targetSdkVersion = 36` |
| **Version Code**| `1` | Verified | `android/app/build.gradle` $\rightarrow$ `versionCode 1` |
| **Version Name**| `1.0.0` | Verified | `android/app/build.gradle` $\rightarrow$ `versionName "1.0.0"` |
| **Window Soft Input** | `adjustResize` | Verified | `android/app/src/main/AndroidManifest.xml` $\rightarrow$ `android:windowSoftInputMode="adjustResize"` |

---

## 2. Asset Integrity & Packaging Verification

| Check Item | Required Specification | Status | Evidence |
|---|---|---|---|
| **Bundled Audio Files** | 93 physical `.mp3` files (31 EN, 31 HI, 31 ML) | Verified | Verified in `public/assets/audio/` and synced to `android/app/src/main/assets/public/assets/audio/` |
| **Web Assets Bundle** | Compiled React 18 / Vite 5 bundle in `dist/` | Verified | Generated via `npm run build` |
| **Native Sync Status** | Clean Capacitor 8 synchronization | Verified | `npm run android:sync` (`vite build && npx cap sync android`) exits with 0 errors |
| **Launcher Icons** | Adaptive mipmap icons (`ic_launcher`, `ic_launcher_round`) | Verified | Resides in `android/app/src/main/res/mipmap-*/` |
| **Hardware Back Navigation**| Intercept back button to return to home/menu | Verified | `@capacitor/app` listener in `App.tsx` |
| **App State Lifecycle**| Audio auto-pauses when app is backgrounded | Verified | `CapApp.addListener('appStateChange')` in `App.tsx` |

---

## 3. Security, Privacy & Safety Verification

| Check Item | Required Specification | Status | Evidence |
|---|---|---|---|
| **Financial Safety** | Zero real money, zero UPI banking bridges | Verified | `securitySafety.test.ts` scans all production files for forbidden endpoints |
| **Simulation Disclaimers**| Visible on all 10 Google Pay screens | Verified | `<SimulationSafetyBanner />` verified in `GPayReplica.tsx` |
| **Permissions Audit** | Strictly `INTERNET`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` | Verified | Verified in `AndroidManifest.xml`; zero SMS/Contacts/Accessibility permissions |
| **Telemetry Audit** | Zero tracking or analytics SDKs embedded | Verified | Verified via automated static code scan |
| **Credential Safeguards**| No real financial credentials or reusable API secrets in APK | Verified | In-memory simulated transactions and client-side deterministic routing |

---

## 4. Release Candidate Pre-Flight Smoke Test Sign-Off

- [x] **Static Typecheck**: `npm run lint` passes with 0 errors (`tsc --noEmit`).
- [x] **Automated Test Suite**: `npm test` passes all 123 tests across 12 test suites (including global font size accessibility, responsive mobile layouts, and device QA validation).
- [x] **Production Web Build**: `npm run build` generates clean production assets in `dist/`.
- [x] **Android Asset Synchronization**: `npm run android:sync` synchronizes bundle and 93 audio files to `android/` with 0 warnings.
- [x] **One-Command APK Build**: `npm run android:build` successfully compiles native debug APK (`android/app/build/outputs/apk/debug/app-debug.apk`, 7.22 MB).
- [x] **Offline Runtime**: All 9 tutorials execute without network access (`navigator.onLine = false`).
- [x] **Trilingual Voice Narration**: English, Hindi, and Malayalam narration files bundled into APK assets.
- [x] **State Persistence**: Language, profile, font-size preference (16–30sp), and completed badges persist across app restarts in LocalStorage.
- [x] **Ergonomic Accessibility**: Minimum 64dp touch targets, 20sp body text, global font size slider, and viewport-fit=cover verified.
- [x] **Keyboard Viewport Adjustment**: `android:windowSoftInputMode="adjustResize"` prevents soft keyboard from obscuring message composer.

---

## 5. Physical Android Device Testing Matrix

When installing on physical test hardware (via direct file transfer, `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`, or Android Studio Run):

| Verification Category | Test Procedure | Acceptance Criteria |
|---|---|---|
| **App Launch & Shell** | Launch OLearn from Android app drawer | Splash screen displays briefly, followed by the Home view; no browser URL bar or navigation chrome visible. |
| **Status Bar & Safe Areas** | Inspect top status bar and bottom Android navigation bar across devices | Status bar rendered cleanly without double status bars, overlap, or obscured header controls (`env(safe-area-inset-top)`). |
| **Hardware Back Button** | Press physical/gesture Android Back button during an active tutorial | Triggers the Exit Confirmation Modal rather than exiting to Android home screen; confirming exit safely returns to Home. |
| **Virtual Keyboard (`adjustResize`)** | Tap text input in WhatsApp "Send Message" tutorial | Keyboard slides up; viewport resizes dynamically; message composer remains fully visible and operable above keyboard. |
| **Multilingual Typography** | Switch language between English, Hindi, and Malayalam | All Malayalam ligatures and Hindi conjuncts render smoothly without font clipping, box glyphs (`tofu`), or text overflow. |
| **Voice Narration Playback** | Start any tutorial (e.g. WhatsApp Send Photo) in EN, HI, or ML | Pre-bundled MP3 audio plays immediately; Play/Pause/Replay audio controls function; zero audio clipping. |
| **Airplane Mode / 100% Offline** | Turn off Wi-Fi and Cellular Data (Airplane Mode ON) | All 9 tutorials execute completely from start to finish with audio, steps, and celebrations. Zero network errors. |
| **Backgrounding & Resumption** | Press Home button while narration audio is playing, then reopen | Audio immediately pauses when backgrounded and does not leak or overlap after returning to the app. |
| **Permission Handling** | Open "Ask Me" voice router and deny microphone permission | Displays clear fallback message and allows manual task selection with zero crash or dead ends. |
| **Process Restart Persistence** | Complete a task, swipe away app from Android Recents, relaunch | Completed task badge remains marked as completed; user profile and selected language remain intact. |
| **Financial Isolation** | Test Google Pay simulated payment or balance check | Uses strictly fictional mock data (₹15,000 balance, simulated contact); no real UPI or bank interaction possible. |

**Release Candidate Verdict**: **APPROVED FOR ANDROID PACKAGING & DEVICE TESTING (v1.0.0-RC1)**.
