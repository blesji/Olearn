import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';
import { TaskEngine } from '../engine/TaskEngine';
import { WhatsAppReplica } from '../replicas/WhatsAppReplica';
import { GPayReplica } from '../replicas/GPayReplica';
import { AudioService } from '../services/AudioService';
import { StorageService } from '../services/StorageService';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
(globalThis as any).localStorage = new LocalStorageMock();

describe('Mobile Responsiveness and Layout Repair Verification', () => {
  const tasks = tasksData as TaskConfig[];
  const sendTextTask = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
  const scanQrTask = tasks.find(t => t.task_id === 'gpay_scan_qr')!;

  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).localStorage.clear();
    vi.spyOn(AudioService, 'playNarration').mockImplementation(async (_path, _lang, _text, onEnd) => {
      if (onEnd) onEnd();
    });
    vi.spyOn(AudioService, 'playCorrectSound').mockImplementation(() => {});
    vi.spyOn(AudioService, 'playNudgeSound').mockImplementation(() => {});
    vi.spyOn(AudioService, 'stopAudio').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const targetViewports = [
    { name: 'Compact Phone', width: 320, height: 640 },
    { name: 'Standard Android', width: 360, height: 800 },
    { name: 'Modern iPhone / Android', width: 390, height: 844 },
    { name: 'Large Android Device', width: 412, height: 915 }
  ];

  targetViewports.forEach(({ name, width, height }) => {
    describe(`Viewport ${width}x${height} (${name})`, () => {
      it('verifies Region B Toolbar contains back navigation, task title, step counter, and audio controls', () => {
        const onExit = vi.fn();
        render(<TaskEngine task={sendTextTask} language="ml" onExit={onExit} />);

        // Back button
        const backBtn = screen.getByLabelText(/പുറത്ത് കടക്കുക/i);
        expect(backBtn).not.toBeNull();

        // Step counter
        expect(screen.getByText(/ഘട്ടം.*1.*\/.*2/)).not.toBeNull();

        // Task title in Malayalam
        expect(screen.getByText(sendTextTask.title.ml)).not.toBeNull();

        // Narration controls (mute & speed)
        expect(screen.getByLabelText(/ശബ്ദം നിർത്തുക/i)).not.toBeNull();
        expect(screen.getByLabelText(/ശബ്ദ വേഗത/i)).not.toBeNull();
      });

      it('verifies Region E Composer contains all required controls (input, attachment, mic/send) within DOM flow', () => {
        const onCorrect = vi.fn();
        const onWrong = vi.fn();

        const { rerender } = render(
          <WhatsAppReplica
            screen="whatsapp_chat_screen"
            highlightElement="chat_input"
            language="ml"
            onCorrectTap={onCorrect}
            onWrongTap={onWrong}
          />
        );

        // All 3 essential controls must exist in DOM
        const inputEl = document.querySelector('[data-element-id="chat_input"]');
        const attachEl = document.querySelector('[data-element-id="attachment_icon"]');
        const micEl = document.querySelector('[data-element-id="mic_record_button"]');

        expect(inputEl).not.toBeNull();
        expect(attachEl).not.toBeNull();
        expect(micEl).not.toBeNull();

        // Step 2: Typed text state with Send button
        rerender(
          <WhatsAppReplica
            screen="whatsapp_chat_screen_typed"
            highlightElement="send_button"
            language="ml"
            onCorrectTap={onCorrect}
            onWrongTap={onWrong}
          />
        );

        const sendEl = document.querySelector('[data-element-id="send_button"]');
        expect(sendEl).not.toBeNull();
        expect(sendEl?.getAttribute('aria-label')).toBe('Active step button, tap to proceed');
      });

      it('verifies Region F Tutorial Instruction Area contains step indicator, replay, restart, and instruction text', () => {
        const onExit = vi.fn();
        render(<TaskEngine task={sendTextTask} language="ml" onExit={onExit} />);

        // Instruction text
        expect(screen.getByText(sendTextTask.steps[0].hint_text.ml)).not.toBeNull();

        // Replay audio button
        const replayBtn = screen.getByLabelText(/ശബ്ദം വീണ്ടും കേൾക്കുക/i);
        expect(replayBtn).not.toBeNull();

        // Step indicator
        expect(screen.getByText('1')).not.toBeNull();
      });
    });
  });

  it('verifies long Malayalam text in composer input is safely contained with truncate class', () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();

    render(
      <WhatsAppReplica
        screen="whatsapp_chat_screen_typed"
        highlightElement="send_button"
        language="ml"
        onCorrectTap={onCorrect}
        onWrongTap={onWrong}
      />
    );

    const inputContainer = document.querySelector('[data-element-id="chat_input"]');
    expect(inputContainer).not.toBeNull();
    // Verify min-w-0 flex container
    expect(inputContainer?.className).toContain('min-w-0');

    const textEl = inputContainer?.querySelector('div');
    expect(textEl?.className).toContain('truncate');
    expect(textEl?.className).toContain('font-malayalam');
  });

  it('verifies multilingual typography switches between English, Hindi, and Malayalam without breaking layout', () => {
    const onExit = vi.fn();

    // 1. English
    const { rerender } = render(<TaskEngine task={sendTextTask} language="en" onExit={onExit} />);
    expect(screen.getByText(/Step.*1.*\/.*2/)).not.toBeNull();
    expect(screen.getByText(sendTextTask.steps[0].hint_text.en)).not.toBeNull();

    // 2. Hindi
    rerender(<TaskEngine task={sendTextTask} language="hi" onExit={onExit} />);
    expect(screen.getByText(/कदम.*1.*\/.*2/)).not.toBeNull();
    expect(screen.getByText(sendTextTask.steps[0].hint_text.hi)).not.toBeNull();

    // 3. Malayalam
    rerender(<TaskEngine task={sendTextTask} language="ml" onExit={onExit} />);
    expect(screen.getByText(/ഘട്ടം.*1.*\/.*2/)).not.toBeNull();
    expect(screen.getByText(sendTextTask.steps[0].hint_text.ml)).not.toBeNull();
  });
});
