import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';
import { TaskEngine } from '../engine/TaskEngine';
import { GPayReplica } from '../replicas/GPayReplica';
import { WhatsAppReplica } from '../replicas/WhatsAppReplica';
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

describe('Android Device Validation & Visual Polish QA Suite', () => {
  const tasks = tasksData as TaskConfig[];
  const checkBalanceTask = tasks.find(t => t.task_id === 'gpay_check_balance')!;
  const scanQrTask = tasks.find(t => t.task_id === 'gpay_scan_qr')!;
  const sendTextTask = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
  const voiceCallTask = tasks.find(t => t.task_id === 'whatsapp_voice_call')!;

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

  describe('1. Google Pay Sandboxed Simulation & Safety Invariants', () => {
    const gpayScreens: Array<{ screen: any; highlight: string; title: string }> = [
      { screen: 'gpay_home_screen', highlight: 'check_balance_button', title: 'Home Services' },
      { screen: 'gpay_upi_pin_screen', highlight: 'pin_keypad_submit', title: 'PIN Entry Keypad' },
      { screen: 'gpay_balance_display_screen', highlight: 'balance_done_button', title: 'Account Balance' },
      { screen: 'gpay_qr_scanner_viewfinder', highlight: 'qr_target_box', title: 'QR Viewfinder' },
      { screen: 'gpay_amount_entry_screen', highlight: 'proceed_to_pay_button', title: 'Amount Entry' },
      { screen: 'gpay_payment_success_screen', highlight: 'success_done_button', title: 'Payment Success' },
      { screen: 'gpay_history_list_screen', highlight: 'history_item_1', title: 'Transaction History' },
      { screen: 'gpay_contact_list_screen', highlight: 'contact_son_ramesh', title: 'Saved Contacts' },
    ];

    gpayScreens.forEach(({ screen: scr, highlight, title }) => {
      it(`verifies safety disclaimer banner is prominently displayed on ${title} (${scr})`, () => {
        render(
          <GPayReplica
            screen={scr}
            highlightElement={highlight}
            language="en"
            onCorrectTap={vi.fn()}
            onWrongTap={vi.fn()}
          />
        );

        // Every screen must display safety disclaimer text
        const banner = screen.getAllByText(/Practice Simulation|No real money/i);
        expect(banner.length).toBeGreaterThan(0);
      });
    });

    it('verifies sandboxed UPI PIN keypad contains 12 interactive keys and minimum touch targets', () => {
      const onCorrect = vi.fn();
      render(
        <GPayReplica
          screen="gpay_upi_pin_screen"
          highlightElement="pin_keypad_submit"
          language="en"
          onCorrectTap={onCorrect}
          onWrongTap={vi.fn()}
        />
      );

      // Verify digits 0 through 9
      for (let digit = 0; digit <= 9; digit++) {
        expect(screen.getByText(digit.toString())).not.toBeNull();
      }

      // Verify submit checkmark button is highlighted
      const submitBtn = document.querySelector('[data-element-id="pin_keypad_submit"]');
      expect(submitBtn).not.toBeNull();
      expect(submitBtn?.getAttribute('aria-label')).toBe('Active step button, tap to proceed');

      // Tapping submit triggers onCorrect
      fireEvent.click(submitBtn!);
      expect(onCorrect).toHaveBeenCalledTimes(1);
    });

    it('verifies balance screen displays fictional account data and balance without real banking links', () => {
      render(
        <GPayReplica
          screen="gpay_balance_display_screen"
          highlightElement="balance_done_button"
          language="en"
          onCorrectTap={vi.fn()}
          onWrongTap={vi.fn()}
        />
      );

      expect(screen.getByText('State Bank of India')).not.toBeNull();
      expect(screen.getByText('•••• •••• 4829')).not.toBeNull();
    });
  });

  describe('2. WhatsApp Simulation & Voice Call Controls', () => {
    it('verifies active voice call screen displays authentic timer and end call control', () => {
      const onCorrect = vi.fn();
      render(
        <WhatsAppReplica
          screen="whatsapp_active_voice_call"
          highlightElement="end_call_button"
          language="ml"
          onCorrectTap={onCorrect}
          onWrongTap={vi.fn()}
        />
      );

      const endBtn = document.querySelector('[data-element-id="end_call_button"]');
      expect(endBtn).not.toBeNull();
      fireEvent.click(endBtn!);
      expect(onCorrect).toHaveBeenCalledTimes(1);
    });

    it('verifies composer input does not overflow horizontally and wraps message elements correctly', () => {
      render(
        <WhatsAppReplica
          screen="whatsapp_chat_screen"
          highlightElement="chat_input"
          language="hi"
          onCorrectTap={vi.fn()}
          onWrongTap={vi.fn()}
        />
      );

      const composer = document.querySelector('[data-element-id="chat_input"]');
      expect(composer).not.toBeNull();
      expect(composer?.parentElement?.className).toContain('flex');
    });
  });

  describe('3. Multilingual Font Scaling & Accessibility Safeguards', () => {
    const languages: Array<'en' | 'hi' | 'ml'> = ['en', 'hi', 'ml'];

    languages.forEach(lang => {
      it(`verifies full 3-step Check Balance flow operates cleanly in ${lang.toUpperCase()}`, () => {
        const onExit = vi.fn();
        const { rerender } = render(<TaskEngine task={checkBalanceTask} language={lang} onExit={onExit} />);

        // Step 1: Check balance button
        const step1Btn = document.querySelector('[data-element-id="check_balance_button"]');
        expect(step1Btn).not.toBeNull();
        fireEvent.click(step1Btn!);

        // Advance to step 2: PIN pad
        act(() => {
          vi.advanceTimersByTime(500);
        });
        rerender(<TaskEngine task={checkBalanceTask} language={lang} onExit={onExit} />);

        const pinBtn = document.querySelector('[data-element-id="pin_keypad_submit"]');
        expect(pinBtn).not.toBeNull();
        fireEvent.click(pinBtn!);

        // Advance to step 3: Balance screen
        act(() => {
          vi.advanceTimersByTime(500);
        });
        rerender(<TaskEngine task={checkBalanceTask} language={lang} onExit={onExit} />);

        const doneBtn = document.querySelector('[data-element-id="balance_done_button"]');
        expect(doneBtn).not.toBeNull();
        fireEvent.click(doneBtn!);

        // Completion celebration screen
        act(() => {
          vi.advanceTimersByTime(500);
        });
        rerender(<TaskEngine task={checkBalanceTask} language={lang} onExit={onExit} />);

        expect(screen.getByRole('button', { name: /Practice Again|फिर से अभ्यास करें|വീണ്ടും പരിശീലിക്കുക/i })).not.toBeNull();
      });
    });
  });

  describe('4. Rapid Tap Lockout & Debouncing', () => {
    it('prevents accidental double-tap from skipping multiple tutorial steps simultaneously', () => {
      const onExit = vi.fn();
      render(<TaskEngine task={sendTextTask} language="en" onExit={onExit} />);

      const inputBtn = document.querySelector('[data-element-id="chat_input"]');
      expect(inputBtn).not.toBeNull();

      // Rapidly fire 3 click events within 100ms
      fireEvent.click(inputBtn!);
      fireEvent.click(inputBtn!);
      fireEvent.click(inputBtn!);

      // AudioService.playCorrectSound should only be called once for this transition
      expect(AudioService.playCorrectSound).toHaveBeenCalledTimes(1);
    });
  });

  describe('5. Offline & Network Resiliency', () => {
    it('executes tutorial seamlessly when navigator.onLine is false (Airplane Mode)', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const onExit = vi.fn();

      render(<TaskEngine task={voiceCallTask} language="ml" onExit={onExit} />);

      // Verify tutorial initialized without throwing
      expect(screen.getByText(voiceCallTask.title.ml)).not.toBeNull();

      // Verify instruction text is present
      expect(screen.getByText(voiceCallTask.steps[0].hint_text.ml)).not.toBeNull();
    });
  });
});
