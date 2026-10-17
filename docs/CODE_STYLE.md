# Code Style & Engineering Conventions — OLearn

## 1. Core Engineering Principles

1. **Clarity Over Cleverness**: Code should be readable, well-commented, and obvious. Avoid cryptic abstractions, dense one-liners, or complex meta-programming.
2. **Deterministic & Configuration-Driven**: Curricula, screens, and interaction targets must be declared as static configurations in JSON or type-safe schemas rather than hardcoded conditional branches.
3. **Resilience & Graceful Degradation**: Every asynchronous call, audio element, and storage operation must have explicit error boundaries and fallback handlers. Never let an exception crash the user interface.

---

## 2. TypeScript & Type Safety Guidelines

- **Strict Mode**: `tsconfig.json` enforces `strict: true`. Avoid using `any` wherever possible.
- **Explicit Interfaces**: All component props, domain entities, and service responses must have exported TypeScript interfaces or types.
  ```typescript
  // Preferred
  export interface TaskConfig {
    task_id: string;
    app: 'whatsapp' | 'gpay';
    title: Record<SupportedLanguage, string>;
    steps: TaskStep[];
  }
  ```
- **Union Types for Domain Literals**: Use string union types for closed domain sets (e.g. `SupportedLanguage = 'en' | 'hi' | 'ml'`).

---

## 3. React Component Structure & Practices

- **Functional Components**: All UI components must be functional components utilizing React hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
- **Single-Responsibility Replicas**: Replicas (`WhatsAppReplica`, `GPayReplica`) should focus purely on visual simulation rendering and event dispatch. State transitions belong in `TaskEngine`.
- **Target Encapsulation**: Interactive targets must be wrapped with `<HighlightTarget>`:
  ```tsx
  <HighlightTarget
    elementId="scan_qr_button"
    activeHighlightId={highlightElement}
    onCorrectTap={onCorrectTap}
    onWrongTap={onWrongTap}
  >
    <div className="min-h-[72px] bg-[#1A73E8] ...">
      ...
    </div>
  </HighlightTarget>
  ```
- **Cleanup in Hooks**: Any `useEffect` that creates an audio handle, interval, timer, or event listener must return a cleanup function.

---

## 4. Error Handling & Defensive Programming

1. **Audio Operations**: Always handle audio playback rejections (e.g. browser autoplay restrictions) with graceful fallback:
   ```typescript
   audio.play().catch(err => {
     console.warn('Audio play failed, falling back to TTS:', err);
     this.playDynamicTTS(fallbackText, language, finish);
   });
   ```
2. **Storage Operations**: Always wrap `localStorage` access in safe try-catch wrappers and maintain an in-memory fallback.
3. **Double-Tap Lockout**: Always guard progression events with a minimum 400ms timestamp debounce check.

---

## 5. CSS & Styling Conventions

- **Tailwind CSS Utility First**: Use Tailwind utility classes for consistent spacing, colors, and layout.
- **Ergonomic Dimension Tokens**:
  - Minimum touch button height: `min-h-[58px]` or `min-h-[64px]`.
  - Minimum typography: `text-xl font-bold` (20px+) for instructions.
- **Semantic HTML & ARIA**:
  - Buttons must include `aria-label` and `role="button"`.
  - Non-standard buttons must include `tabIndex={0}` and keyboard `onKeyDown` handlers for Enter and Space.

---

## 6. Testing Conventions

- Test files must reside in `src/__tests__/` and end with `.test.ts` or `.test.tsx`.
- Use Vitest and React Testing Library (`render`, `screen`, `fireEvent`, `waitFor`).
- When asserting element presence, prioritize accessibility queries (`getByRole`, `getByText`, `getByLabelText`).
- Avoid fragile index-based selectors. Use semantic texts or unique `data-element-id` attributes.
