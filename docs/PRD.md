# Product Requirements Document (PRD) — OLearn

## 1. Executive Overview

**OLearn** is an Android-first, offline-first digital literacy training application engineered specifically for senior citizens (ages 60+) and low digital-literacy users in India. The application provides safe, sandboxed, interactive training for critical modern smartphone tasks across **WhatsApp** and **Google Pay**.

By utilizing high-fidelity local interactive simulation replicas rather than brittle and invasive OS-level overlays (which demand high-risk Android accessibility permissions), OLearn creates a completely risk-free learning environment with zero real money, zero financial risk, and zero personal data leakage.

---

## 2. Target Audience & Core Personas

### Persona A: Smt. Kamala Devi (Age 68, Retired Teacher, Kochi / Varanasi)
- **Smartphone Literacy**: Owns an Android smartphone gifted by children; feels intimidated by fast UI changes, small icons, and complex English menus.
- **Primary Goals**: Wants to independently make video calls to her grandchildren, send photos, and check whether her pension was deposited in the bank without bothering family members.
- **Pain Points**: Fear of pressing the "wrong button" and losing money or deleting contacts; difficulty reading text smaller than 18sp; hearing loss requiring clear, slow narration in her native language.

### Persona B: Shri Rameshwar Lal (Age 72, Small Shop Owner, Jaipur / Thrissur)
- **Smartphone Literacy**: Uses phone primarily for calls; reluctant to use Google Pay due to fear of banking fraud and complex UPI screens.
- **Primary Goals**: Wants to learn how to scan a merchant QR code at the local chemist or tea stall, and send money to his son.
- **Pain Points**: Anxiety around UPI PINs; confused by multi-layered navigation; sensitive to high-pressure error messages.

---

## 3. Product Scope & Curriculum

The OLearn core curriculum consists of **9 interactive tutorials** across two primary applications:

### 3.1 WhatsApp Curriculum
| ID | Task Name | Screens Simulating | Interaction Highlights |
|---|---|---|---|
| `whatsapp_send_text` | Send a Text Message | Chat screen $\rightarrow$ Keyboard $\rightarrow$ Outgoing bubble | Tap chat input, type message, tap green send arrow |
| `whatsapp_send_photo` | Send a Photo | Chat screen $\rightarrow$ Attachment sheet $\rightarrow$ Photo selection $\rightarrow$ Preview | Tap paperclip, select Photo, tap send |
| `whatsapp_voice_call` | Make a Voice Call | Chat screen $\rightarrow$ Confirmation dialog $\rightarrow$ Active Call screen | Tap phone icon, tap Call in dialog, tap red End Call |
| `whatsapp_video_call` | Make a Video Call | Chat screen $\rightarrow$ Video call confirmation $\rightarrow$ Video screen | Tap camera icon, tap Start Call, tap End Video Call |
| `whatsapp_voice_message` | Send a Voice Note | Chat screen $\rightarrow$ Mic button $\rightarrow$ Voice recording bubble | Tap & hold/tap mic button, release to send audio note |

### 3.2 Google Pay Curriculum (Simulated Sandbox)
| ID | Task Name | Screens Simulating | Interaction Highlights |
|---|---|---|---|
| `gpay_check_balance` | Check Account Balance | GPay Home $\rightarrow$ Bank list $\rightarrow$ Mock PIN entry $\rightarrow$ Balance display | Tap "Check balance", enter mock PIN `1234`, view ₹14,250 |
| `gpay_scan_qr` | Scan a QR Code & Pay | GPay Home $\rightarrow$ Scanner viewfinder $\rightarrow$ Amount entry $\rightarrow$ PIN $\rightarrow$ Receipt | Tap "Scan QR", align camera, proceed to pay ₹200, view receipt |
| `gpay_send_contact` | Pay a Saved Contact | GPay Home $\rightarrow$ Contact list $\rightarrow$ Contact chat $\rightarrow$ Amount $\rightarrow$ PIN $\rightarrow$ Receipt | Tap "Pay contacts", select Ramesh (Son), pay ₹1,000 |
| `gpay_transaction_history` | View Transaction History | GPay Home $\rightarrow$ History list $\rightarrow$ Transaction detail receipt | Tap "See history", select Sharma Groceries, review receipt |

---

## 4. Key Functional Requirements

### FR-1: 100% Offline-First Operation
- All 9 core tutorials, replica UI screens, interactive state machines, and voice narration audio clips must operate without any active internet connection (`navigator.onLine = false`).
- 93 pre-recorded native audio recordings (`.mp3`) across English (`en`), Hindi (`hi`), and Malayalam (`ml`) are pre-bundled into the Android package assets.
- External API calls (such as OpenAI Whisper or GPT) are strictly optional conveniences and must never block core offline learning.

### FR-2: Non-Threatening, Single-Action Guided Learning Engine
- At any point during a tutorial, exactly **one** target element is active and highlighted with a high-contrast gold/amber pulsating border (`4px solid #F59E0B`).
- **Wrong-Tap Handling**: Tapping any inactive area must **never** fail the user, dock points, or reset the step. Instead, it triggers a gentle acoustic harmonic chime (330Hz $\rightarrow$ 260Hz) and visual reassurance: *"Try tapping the highlighted button with the yellow border"*.
- **Double-Tap Lockout**: State transitions enforce a 400ms debounce guard to prevent accidental double-taps from skipping steps.

### FR-3: Audio Narration & Elderly-Centric Player Controls
- Pre-recorded spoken audio plays automatically upon step entry.
- Persistent audio controls available on every step:
  - **Play / Pause / Resume**: Allows the learner to pause narration if interrupted.
  - **Repeat Voice (Replay)**: Re-triggers the audio clip as many times as desired.
  - **Narration Speed**: Toggle between `Normal (1.0x)` and `Slow & Clear (0.8x)`.
  - **Mute / Unmute**: Allows silent operation while keeping instructional text fully visible.
- Safety timeout (10 seconds) prevents broken or missing audio files from halting step progression.

### FR-4: Natural Language Intent Discovery ("Ask Me")
- Allows senior users to discover tutorials by speaking or typing naturally in English, Hindi, or Malayalam.
- Utilizes deterministic local semantic matching with zero network requirement.
- Handles short queries (`"photo"`, `"balance"`, `"call"`), misspellings (`"foto"`, `"balence"`), and ambiguous requests (`"call"` $\rightarrow$ asks whether Voice or Video call).
- Clearly explains unsupported requests (e.g. `"order food"`, `"book train ticket"`) and offers direct links to available tutorials.

### FR-5: Complete Financial Safety Invariants
- Zero connection to the Unified Payments Interface (UPI) network or banking APIs.
- No real banking credentials, passwords, or personal UPI PINs are ever requested, collected, or stored.
- Prominent persistent safety banner on all simulated Google Pay screens:
  *"🛡️ Practice Simulation: No real money or bank account is used"*.

---

## 5. Non-Functional & Accessibility Requirements

### NFR-1: Senior Typography Standards & Accessibility Slider
- Body instructional text: Minimum **20sp / 20px** (1.25rem).
- Step headers and prominent labels: **24sp – 28sp** bold.
- Absolute minimum font size anywhere in the application: **18sp** (no fine print).
- **Global Font Size Accessibility Slider**: Configurable in Settings from **16sp** to **30sp** with standard **20sp** default, flanked by `A-`/`A+` steppers, live multilingual sample text preview (EN, HI, ML), reset button, and persistent storage across app cold restarts.
- Fluid scaling support up to 200% via standard Android display accessibility settings.

### NFR-2: Accessible Touch Ergonomics
- Interactive buttons and targets: Minimum **64dp × 64dp** bounding box.
- Primary home screen app tiles: Minimum **120dp × 120dp**.
- Minimum spacing between interactive targets: **12dp** to prevent accidental mis-taps.

### NFR-3: Contrast & Color Independence
- Strict WCAG 2.1 AA / AAA contrast ratios:
  - Dark surfaces: Deep Slate (`#0F172A`) with White (`#FFFFFF`) or Gold (`#F59E0B`) text (contrast ratio $> 12:1$).
  - Light surfaces: Pure White (`#FFFFFF`) with Dark Slate (`#0F172A`) text (contrast ratio $> 14:1$).
- Information is never conveyed by color alone; all icons include clear accompanying text labels.

### NFR-4: Vestibular Comfort & Accessibility
- Full support for `@media (prefers-reduced-motion: reduce)`.
- Explicit `:focus-visible` ring (`4px solid #F59E0B` with 4px offset) for hardware keyboard / accessibility switch access.
- Accessible semantic HTML with `role="button"`, `tabIndex={0}`, and `aria-label` attributes on all interactive elements.

---

## 6. Release Criteria & Quality Gates

1. **Compilation**: Clean TypeScript build (`tsc --noEmit`) with 0 errors.
2. **Automated Testing**: 100% pass rate across all 12 test suites (123 tests).
3. **Android Synchronization**: Capacitor Android assets synchronizable via `npm run android:sync`.
4. **Native Android APK Build**: Clean compilation via `npm run android:build` producing `app-debug.apk` (7.22 MB).
5. **Offline Resilience**: Complete task completion under airplane mode (`navigator.onLine = false`).
6. **Cold Start Persistence**: User language, completed task badges, font-size preference (16–30sp), and audio settings survive app kill and restart.
