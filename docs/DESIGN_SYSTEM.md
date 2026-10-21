# Senior-Centered Accessibility & Design System — OLearn

## 1. Design Vision & Accessibility Guiding Principles

Senior citizens and digitally inexperienced adults face distinct cognitive, motor, visual, and auditory challenges when interacting with smartphones:
- **Visual decline (Presbyopia)**: Reduced contrast sensitivity, difficulty focusing on small text, sensitivity to glare.
- **Motor decline (Tremors & Arthritis)**: Difficulty with precise tapping, accidental multi-taps, inability to perform complex gestures (pinch, drag-and-drop, multi-finger swipes).
- **Auditory decline (Presbycusis)**: Reduced high-frequency hearing, difficulty understanding fast speech or speech in noisy environments.
- **Technological anxiety**: Severe fear of "breaking the phone", losing money, or doing something irreversible.

OLearn's design system addresses these challenges with uncompromising ergonomic standards.

---

## 2. Color Palette & WCAG AAA Contrast Ratios

Colors are chosen for maximum contrast, emotional reassurance, and strict readability. Information is **never** conveyed through color alone.

| Token Name | Hex Code | Purpose | Background | Contrast Ratio |
|---|---|---|---|---|
| `slate-950` | `#020617` | Root background / deep contrast | - | - |
| `slate-900` | `#0F172A` | Card / surface container | White text | 18.2:1 (AAA) |
| `slate-800` | `#1E293B` | Interactive input surfaces | White text | 12.5:1 (AAA) |
| `amber-400` | `#F59E0B` | Active highlight pulse / Focus ring | Dark slate | 9.4:1 (AAA) |
| `amber-500` | `#D97706` | Primary action buttons | Dark slate | 7.1:1 (AAA) |
| `emerald-600`| `#059669` | Success / completed badge | White text | 5.2:1 (AA) |
| `rose-600`   | `#E11D48` | Microphone recording indicator | White text | 4.8:1 (AA) |
| `blue-600`   | `#1A73E8` | Google Pay simulation brand blue | White text | 4.6:1 (AA) |

---

## 3. Senior Typography Hierarchy

Browser default fonts are overridden with clear, modern, open-counter sans-serif typography (`Inter`, `system-ui`). Font sizes follow standard mobile scale points (sp):

| Text Role | Target Size | Tailwind Class | Usage Guidelines |
|---|---|---|---|
| **App Title / Hero** | `32sp` (2.0rem) | `text-3xl font-black` | Main app header and splash screen |
| **Section Header** | `24sp – 28sp` (1.5–1.75rem) | `text-2xl font-bold` | Screen headers, modal titles |
| **Body / Instruction** | **`20sp – 22sp`** (1.25–1.375rem) | `text-xl font-bold` | **All step instructions and primary prompts** |
| **Button Labels** | `20sp` (1.25rem) | `text-xl font-extrabold` | Primary and secondary touch buttons |
| **Minimum Allowable**| **`18sp`** (1.125rem) | `text-lg font-semibold` | Absolute floor for secondary labels |

> **Strict Rule**: No font size below 18sp is permitted anywhere in the user-facing curriculum. Fine print, low-contrast legal disclaimers, and tiny subtexts are strictly prohibited.

### 3.1 Global Font Size Accessibility Slider

To ensure elderly users with severe visual impairments or personal viewing preferences can comfortably use OLearn, a global font size slider is integrated in the Settings screen:

- **Configurable Range**: **`16sp`** (Compact) $\rightarrow$ **`30sp`** (Extra Large), with **`20sp`** as standard default.
- **Increment / Decrement Steppers**: Flanked by high-contrast `A-` (smaller) and `A+` (larger) touch buttons with minimum 48dp touch targets.
- **Dynamic CSS Variable Scaling**: Adjusting the slider dynamically updates root typography tokens (`--olearn-font-scale` and `--olearn-font-base`) on `document.documentElement`, instantly scaling headers, instructions, replica chats, and keypad labels without requiring a page refresh.
- **Live Multilingual Preview**: Displays a real-time preview card in the active language:
  - English: *"This is how text will look in OLearn"*
  - Hindi: *"ओ-लर्न में पाठ इस तरह दिखाई देगा"*
  - Malayalam: *"ഒ-ലേണിൽ അക്ഷരങ്ങൾ ഇങ്ങനെ കാണപ്പെടും"*
- **Reset to Default Action**: Dedicated button with circular refresh icon instantly resets font size to `20sp`.
- **Offline Persistence**: Automatically saved to user profile in LocalStorage (`olearn_user_profile.fontSize`), persisting across reloads and cold device restarts.
- **WCAG 2.1 AA Compliance**: Respects Android system display scaling without clipping text, overflowing containers, or obscuring interactive controls.

---

## 4. Touch Target Ergonomics

To accommodate tremors and decreased motor control:
- **Primary Home App Tiles**: **`120dp × 120dp`** (large tap target with prominent icon and text).
- **Task Controls & Interactive Buttons**: Minimum **`64dp × 64dp`** bounding area.
- **Microphone Record Button**: **`128dp × 128dp`** circular button centered on screen.
- **Spacing Between Targets**: Minimum **`12dp`** gap to prevent finger edge mis-taps.
- **Gesture Simplicity**: All actions rely solely on single discrete taps. No swiping, pinching, or long-pressing is required to complete tutorials.

---

## 5. Visual Guidance & Focus Ring System

### 5.1 Single-Target Highlight
At any moment during a tutorial, exactly **one** interactive target is active:
- Highlight styling: `4px solid #F59E0B` (Amber) border with `rounded-2xl` and a smooth pulsating glow (`shadow-[0_0_24px_rgba(245,158,11,0.6)]`).
- Inactive elements are softly dim (`opacity-90`) and ignore accidental taps without causing errors.

### 5.2 Accessibility Focus Outline
For users navigating via hardware keyboards, Android Accessibility Switch, or Android TV remotes:
```css
:focus-visible {
  outline: 4px solid #F59E0B;
  outline-offset: 4px;
}
```

---

## 6. Acoustic Feedback & Web Audio Frequencies

Sound effects are synthesized directly on the device using the Web Audio API without latency or file loading:
1. **Success Chime (Correct Tap)**:
   - Waveform: Sine wave
   - Frequencies: `587.33 Hz` (D5) ramping up to `880 Hz` (A5) over 180ms
   - Volume: 0.20 gain exponential decay over 250ms
   - Emotional effect: Upbeat, affirmative, rewarding.
2. **Gentle Nudge (Inactive Area Tap)**:
   - Waveform: Triangle wave
   - Frequencies: `330 Hz` (E4) dropping to `260 Hz` (C4) over 100ms
   - Volume: 0.18 gain decaying over 220ms
   - Emotional effect: Soft, non-punitive, warm reminder.
3. **Celebration Arpeggio (Task Completed)**:
   - Frequencies: C5 (`523.25 Hz`), E5 (`659.25 Hz`), G5 (`783.99 Hz`), C6 (`1046.50 Hz`)
   - Stagger: 120ms between notes
   - Visual accompaniment: Confetti shower across the viewport.

---

## 7. Vestibular Comfort & Reduced Motion

For older adults prone to motion sickness, dizziness, or disorientation, OLearn fully respects system reduced-motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
All pulsating rings and bouncy animations immediately settle into high-contrast static indicators when reduced motion is requested.

---

## 8. Mobile Layout & Viewport Architecture

To guarantee flawless display across compact (320x640), standard (360x800), and large (412x915) mobile screens, OLearn structures tutorial screens into 6 distinct document-flow regions:

```
┌───────────────────────────────────────────────┐
│ Region A: System Status Area (OS / Native)    │
├───────────────────────────────────────────────┤
│ Region B: OLearn Tutorial Toolbar (50px)      │
│  [← Exit]   Task Title & Step Counter   [🔊][⚡]│
├───────────────────────────────────────────────┤
│ Region C: Simulated App Header (56px)         │
│  [←] (Avatar) Contact Name & Status   [📹][📞]│
├───────────────────────────────────────────────┤
│ Region D: Simulated Conversation Area         │
│  • Scrollable message bubbles (min-h-0)       │
│  • Custom discreet scrollbar (thin, non-squish)│
├───────────────────────────────────────────────┤
│ Region E: Message Composer                    │
│  [😊] [ Input Pill with min-w-0 flex ] [📎] [📤]│
├───────────────────────────────────────────────┤
│ Region F: Tutorial Instruction Area (Max 35vh)│
│  (1) [Step #] [Play] [Replay] [Restart]       │
│  Legible Indic instruction text               │
└───────────────────────────────────────────────┘
```

- **Viewport Fill**: Uses `min-h-[100dvh]` and `w-full` on mobile viewports (< 640px) without fake phone bezels or double status bars.
- **Scroll Container**: Region D is the designated vertical scroll container (`min-h-0 overflow-y-auto custom-scrollbar`). Regions B, C, E, and F are flex `shrink-0` anchors.

---

## 9. Multilingual Indic Typography & Glyph Protection

Indic scripts (Malayalam and Devanagari) have taller vertical ascenders, descenders, and vowel signs (*maathras*) than Latin fonts:

1. **Font Stacks**:
   - Malayalam (`[lang="ml"]`): `'Noto Sans Malayalam', 'Nirmala UI', 'Malayalam Sangam MN', 'Kartika', 'AnjaliOldLipi', sans-serif`
   - Hindi (`[lang="hi"]`): `'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', 'Devanagari Sangam MN', sans-serif`
2. **Line Heights**:
   - Fixed at `line-height: 1.5` for Malayalam and `1.45` for Devanagari to prevent clipping of vowel marks and conjuncts (*koottaksharangal*).
3. **Word Break & Kerning**:
   - `letter-spacing: normal` (preventing disconnection of base consonants from vowel marks).
   - `word-break: keep-all; overflow-wrap: break-word;` (preventing unnatural syllabic breaks).

---

## 10. Message Composer Containment Rules

1. **Flex Containment**: Input box container uses `flex-1 min-w-0` so text expansion never displaces attachment or send controls.
2. **Ellipsis & Truncation**: Text preview has `truncate` and `overflow-hidden` preventing horizontal push.
3. **Control Sizing**: Emoji, attachment, and send/mic controls maintain fixed bounding sizes (`w-11 h-11` to `w-12 h-12`) with `shrink-0`.
4. **Pointer Badge Clamping**: `HighlightTarget` uses viewport-safe badge placement (`top-left` on right-edge buttons and `top-left` on input boxes) so badges never cover adjacent buttons or overflow the viewport width.
