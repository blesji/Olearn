# Security, Privacy & Financial Safety Specification — OLearn

## 1. Financial Simulation Safety & Safeguards

Financial literacy is a critical area where senior citizens are vulnerable to anxiety and fraud. OLearn implements strict safeguards to guarantee absolute safety during all simulated Google Pay tasks.

### 1.1 Fictional Data Invariants
All data presented in Google Pay replica screens is entirely fictional and hardcoded in `src/config/mockData.ts`:
- **Account Number**: `State Bank of India •••• 4829` (fictional masked number).
- **Available Balance**: `₹14,250.00` (fixed static display string).
- **Merchant Names**: Sharma Groceries / Sharma Kirana Store (fictional mock store).
- **Contacts**: Ramesh (Son) `+91 98765 43210`, Priya (Daughter) `+91 98765 43211` (fictional non-allocated numbers).
- **UPI Reference ID**: `428901847192` (static fictional mock ID).

### 1.2 Zero Banking Connection
- No code path initiates any real UPI transaction (`upi://pay`), invokes any banking SDK, or connects to NPCI gateways.
- Simulated UPI PIN entry uses purely visual masked dots with a local mock keypad. The learner's real PIN is never asked for, collected, or transmitted.

### 1.3 Prominent Visual Disclaimers
Every single Google Pay replica view renders the high-contrast `<SimulationSafetyBanner />`:
- English: `🛡️ Practice Simulation: No real money or bank account is used`
- Hindi: `🛡️ सुरक्षित अभ्यास: कोई वास्तविक पैसे या बैंक खाता इस्तेमाल नहीं हो रहा`
- Malayalam: `🛡️ പരിശീലന മോഡ്: യഥാർത്ഥ പണമോ ബാങ്ക് അക്കൗണ്ടോ ഉപയോഗിക്കുന്നില്ല`

This ensures older learners are constantly reassured that they are in a safe, risk-free training sandbox.

---

## 2. Privacy & Telemetry Audit

### 2.1 Zero External Tracking
The codebase has been verified to contain **zero** third-party tracking, analytics, or behavioral telemetry libraries:
- No Google Analytics / Google Tag Manager
- No Firebase Analytics
- No Mixpanel, Amplitude, or Segment
- No Sentry, Crashlytics, or Datadog
- No advertising SDKs (AdMob, Unity Ads)

Learner interactions, taps, mistakes, and tutorial completion times remain entirely on the local device and are never sent over the network.

### 2.2 Optional Cloud Integrations Isolation
The application includes optional OpenAI Whisper (STT) and GPT-4o-mini intent classification integrations. These are strictly sandboxed:
- **Default State**: Disabled. Core learning and natural language matching use the offline local matcher (`TaskRouterService.localSemanticMatch`) with 0 network calls.
- **Activation**: Requires the user to explicitly navigate to Settings and manually enter their own private OpenAI API key.
- **Fail-Safe Fallback**: If an API key is provided but the device is offline or the API call fails, the application instantly and silently falls back to the local deterministic semantic matcher without interrupting the learner.

---

## 3. Android Platform Permissions Audit

OLearn follows the principle of least privilege. Its `AndroidManifest.xml` requests only three permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

| Permission | Purpose | Justification |
|---|---|---|
| `android.permission.INTERNET` | Internal webview routing | Required by Capacitor to serve local web assets via `http://localhost/` inside the native Android WebView. |
| `android.permission.RECORD_AUDIO` | Optional speech input | Allows the learner to tap the microphone in "Ask Me" to speak their query. |
| `android.permission.MODIFY_AUDIO_SETTINGS` | Audio playback routing | Ensures narration clips can route cleanly to device speakers. |

### Explicitly Excluded High-Risk Permissions
- ❌ `android.permission.BIND_ACCESSIBILITY_SERVICE`: Demanded by fragile overlay apps; completely avoided by using sandboxed replicas.
- ❌ `android.permission.READ_SMS` / `RECEIVE_SMS`: Zero access to banking OTPs or private text messages.
- ❌ `android.permission.READ_CONTACTS`: Zero access to the user's real personal phonebook.
- ❌ `android.permission.ACCESS_FINE_LOCATION`: Zero tracking of user geographical location.
- ❌ `android.permission.CAMERA`: Simulated QR scanning uses a bundled viewfinder replica without requiring live camera hardware access.

---

## 4. Automated Security Verification Gates

Security and privacy invariants are enforced on every build by the automated test suite in `src/__tests__/securitySafety.test.ts`:
1. `verifies all financial and banking mock data is strictly fictional and sandboxed`
2. `verifies Google Pay tasks do not require personal UPI PINs or live credentials`
3. `ensures no live banking, payment gateways, or UPI endpoints exist in production source files`
4. `ensures zero third-party telemetry, tracking, or analytics libraries are embedded`
5. `verifies AndroidManifest.xml requests strictly minimal, non-financial permissions`
6. `stores strictly non-sensitive user profile data`
7. `handles corrupted localStorage without throwing fatal unhandled exceptions`
