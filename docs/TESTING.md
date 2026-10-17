# Testing Manual & Quality Assurance Protocol — OLearn

## 1. Testing Philosophy & Quality Gates

OLearn maintains a rigorous multi-tier testing strategy combining static analysis, automated unit tests, component simulation tests, end-to-end task progression tests, security invariant scans, and physical device smoke tests.

Every commit and pull request must satisfy the **Four Release Quality Gates**:
1. `npm run lint` (`tsc --noEmit`): **0 type errors**.
2. `npm test` (`vitest run`): **100% pass rate across all 12 test suites (123 tests)**.
3. `npm run build` (`tsc && vite build`): **0 production build warnings/errors**.
4. `npm run android:sync` (`npx cap sync android`): **Clean native asset synchronization**.

---

## 2. Automated Test Suite Breakdown

The automated test suite is powered by **Vitest 2.1.9** and **React Testing Library**. It comprises **123 tests across 12 suites**:

| Test Suite File | Test Count | Scope & Behaviors Verified |
|---|---|---|
| `fontSizeAccessibility.test.tsx` | 10 tests | Validates the global text size slider in Settings (16–30sp), increment/decrement tap targets, reset to default (20sp), live sample text rendering, ARIA slider semantics, and layout stability at min/max scales across WhatsApp and Google Pay. |
| `deviceValidationQA.test.tsx` | 17 tests | Validates Google Pay safety invariants across all screens, sandboxed UPI PIN keypad touch targets, authentic WhatsApp call screen controls, trilingual balance checking (EN, HI, ML), rapid double-tap lockout, and airplane mode offline resilience. |
| `mobileResponsiveness.test.tsx` | 14 tests | Verifies responsive mobile layouts across standard Android viewports (320px–412px), text truncation prevention, action buttons accessibility, and keyboard input responsiveness. |
| `taskRouterService.test.ts` | 23 tests | Multilingual intent routing in English, Hindi, and Malayalam for all 9 tasks; short query handling (`photo`, `balance`); phonetic variations (`foto`, `balence`); punctuation normalization; ambiguity resolution (`call`, `pay`, `send`); unsupported intent detection (`order food`, `train ticket`). |
| `nineTutorials.test.tsx` | 14 tests | Complete end-to-end simulation across all 9 core tutorials (WhatsApp Tasks 1–5, Google Pay Tasks 6–9); outgoing message animation timing; audio playback triggers; double-tap lockout protection; repeat practice; exit confirmation modal; configuration error boundaries. |
| `storageService.test.ts` | 11 tests | User profile schema persistence; language selection storage; font-size persistence and boundary clamping (16–30sp); dynamic CSS typography token scaling; legacy profile migration; corrupt JSON recovery; speed rate persistence; quota overflow memory-store fallback. |
| `taskValidator.test.ts` | 9 tests | Static schema validation of `tasks.json`; detection of missing IDs, unsupported app IDs, empty steps, non-existent replica screens, and invalid highlight element IDs. |
| `securitySafety.test.ts` | 7 tests | Financial simulation data invariants (fictional accounts, masked balances); source code scanning for forbidden payment gateways (`upi://pay`, Razorpay, Stripe) and third-party trackers (Google Analytics, Sentry); AndroidManifest minimal permissions; localStorage security isolation. |
| `seniorAccessibility.test.tsx` | 5 tests | WCAG 2.1 AA senior accessibility standards; non-threatening wrong-tap handling; minimum 64dp touch target sizes; 20sp+ readable typography; independent text instruction visibility; audio mute/unmute and speech rate controls. |
| `offlineStorageAudio.test.ts` | 5 tests | 100% offline execution (`navigator.onLine = false`); missing audio file fallback; narration play/pause/resume controls; 10-second narration safety watchdog; cold-restart data persistence. |
| `tasksConfig.test.ts` | 4 tests | Curriculum structure validation; 9 tasks inventory; physical file existence of all 93 `.mp3` audio files in `public/assets/audio/`. |
| `tutorialLifecycle.test.ts` | 4 tests | Lifecycle state transitions; WhatsApp representative path; Google Pay representative path; non-penalizing repetition across multiple attempts. |

---

## 3. Test Execution Commands

### 3.1 Run Complete Test Suite
```bash
npm test
```
Runs all 12 test suites in non-watch mode.

### 3.2 Run Specific Test Suites
```bash
npm test src/__tests__/fontSizeAccessibility.test.tsx
npm test src/__tests__/deviceValidationQA.test.tsx
npm test src/__tests__/mobileResponsiveness.test.tsx
npm test src/__tests__/nineTutorials.test.tsx
npm test src/__tests__/taskRouterService.test.ts
npm test src/__tests__/securitySafety.test.ts
```

### 3.3 Run Tests with Coverage Report
```bash
npx vitest run --coverage
```

---

## 4. Manual Physical Device Smoke Test Protocol

Before approving an Android Release Candidate APK, the QA engineer must perform this physical device smoke test on a physical Android handset (Android 10+):

### Step 1: Clean Installation & First Launch
1. Install debug/release APK via ADB: `adb install -r app-release.apk`.
2. Launch the application.
3. Verify the splash screen displays cleanly without white flickering.
4. Verify the **Select Language** onboarding screen appears with 3 large buttons (English, हिन्दी, മലയാളം).
5. Select a language and tap **Continue**.

### Step 2: Airplane Mode Offline Verification
1. Enable **Airplane Mode** on the device (turn off both Wi-Fi and Mobile Data).
2. Tap the **WhatsApp** tile $\rightarrow$ Launch **Task 1: Send a text message**.
3. Verify native voice narration speaks clearly in the selected language.
4. Verify the instruction text is at least 20sp and clearly legible.
5. Tap an inactive part of the screen $\rightarrow$ verify gentle chime plays and yellow border guide appears.
6. Tap the highlighted input, type message, tap send arrow.
7. Verify task completes with the celebration chime and confetti.
8. Verify the WhatsApp task list now shows a green **Completed** badge.

### Step 3: Google Pay Financial Simulation Safety
1. Launch **Task 6: Scan QR code & pay**.
2. Verify the top disclaimer banner displays: *"🛡️ Practice Simulation: No real money or bank account is used"*.
3. Tap the shop QR code $\rightarrow$ Proceed to pay ₹200 $\rightarrow$ Tap checkmark on mock numpad.
4. Verify payment success screen shows ₹200.00 with mock UPI Ref.
5. Confirm that no banking app or live payment activity was launched.

### Step 4: Ask Me Intent Discovery
1. Tap the **Ask Me** button in the header.
2. Tap the example chip: *"Send a photo"*.
3. Verify it immediately routes directly into the photo sending tutorial.
4. In the text box, type: `"order food"`.
5. Verify it clearly displays the unsupported notice: *"OLearn doesn't support this task yet. OLearn currently teaches WhatsApp and Google Pay."* and offers available tutorial options.

### Step 5: Cold Restart Persistence
1. Force close OLearn from the Android recent apps switcher.
2. Relaunch OLearn while still in Airplane Mode.
3. Verify language preference is remembered and completed badges remain intact.
