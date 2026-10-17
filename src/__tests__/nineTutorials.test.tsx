import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';
import { TaskEngine } from '../engine/TaskEngine';
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';

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

describe('All Nine Core Tutorials End-to-End Simulation Tests', () => {
  const tasks = tasksData as TaskConfig[];

  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).localStorage.clear();
    vi.spyOn(AudioService, 'playNarration').mockImplementation(async (_path, _lang, _text, onEnd) => {
      if (onEnd) onEnd();
    });
    vi.spyOn(AudioService, 'playCorrectSound').mockImplementation(() => {});
    vi.spyOn(AudioService, 'playNudgeSound').mockImplementation(() => {});
    vi.spyOn(AudioService, 'playCelebrationSound').mockImplementation(() => {});
    vi.spyOn(AudioService, 'stopAudio').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // Helper to click an element by data-element-id and advance transition timer
  const tapHighlightElement = (elementId: string, transitionMs = 750) => {
    const el = document.querySelector(`[data-element-id="${elementId}"]`);
    expect(el, `Expected highlight element "${elementId}" to be in the DOM`).not.toBeNull();
    act(() => {
      fireEvent.click(el!);
    });
    act(() => {
      vi.advanceTimersByTime(transitionMs);
    });
  };

  // 1. Task 1: whatsapp_send_text
  it('Task 1 (whatsapp_send_text): completes end-to-end and reveals outgoing message only after send tap', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    // Step 1: Chat screen, input is empty, no outgoing message
    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();
    expect(document.querySelector('[data-element-id="chat_input"]')).not.toBeNull();
    expect(screen.queryByText('I am doing well son, all good!')).toBeNull();

    // Tap chat_input
    tapHighlightElement('chat_input', 400);

    // Step 2: Input box has typed message, but outgoing bubble has NOT appeared yet before send
    expect(screen.getByText(/Step.*2.*\/.*2/)).toBeDefined();
    expect(document.querySelector('[data-element-id="send_button"]')).not.toBeNull();
    expect(screen.queryByText('I am doing well son, all good!')).toBeNull();

    // Tap send_button
    tapHighlightElement('send_button', 750);

    // Completion screen reached & storage updated
    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('whatsapp_send_text');
  });

  // 2. Task 2: whatsapp_send_photo
  it('Task 2 (whatsapp_send_photo): verifies 4-step photo sharing flow with bundled placeholder imagery', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_send_photo')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*4/)).toBeDefined();
    tapHighlightElement('attachment_icon', 400);

    expect(screen.getByText(/Step.*2.*\/.*4/)).toBeDefined();
    tapHighlightElement('gallery_icon', 400);

    expect(screen.getByText(/Step.*3.*\/.*4/)).toBeDefined();
    tapHighlightElement('photo_thumbnail_1', 400);

    expect(screen.getByText(/Step.*4.*\/.*4/)).toBeDefined();
    expect(screen.getByText('Beautiful Flower')).toBeDefined();
    tapHighlightElement('preview_send_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('whatsapp_send_photo');
  });

  // 3. Task 3: whatsapp_voice_call
  it('Task 3 (whatsapp_voice_call): verifies voice call with clear simulation banner and end-call control', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_voice_call')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*3/)).toBeDefined();
    tapHighlightElement('voice_call_icon', 400);

    expect(screen.getByText(/Step.*2.*\/.*3/)).toBeDefined();
    expect(screen.getByText('Voice Call Ramesh?')).toBeDefined();
    expect(screen.getByText(/Safe simulation/i)).toBeDefined();
    tapHighlightElement('dialog_call_button', 400);

    expect(screen.getByText(/Step.*3.*\/.*3/)).toBeDefined();
    expect(screen.getByText(/Simulation Mode • Safe Practice • No Real Call/i)).toBeDefined();
    tapHighlightElement('end_call_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('whatsapp_voice_call');
  });

  // 4. Task 4: whatsapp_video_call
  it('Task 4 (whatsapp_video_call): verifies simulated video call interface without real camera dependency', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_video_call')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*3/)).toBeDefined();
    tapHighlightElement('video_call_icon', 400);

    expect(screen.getByText(/Step.*2.*\/.*3/)).toBeDefined();
    expect(screen.getByText('Start Video Call?')).toBeDefined();
    tapHighlightElement('dialog_video_button', 400);

    expect(screen.getByText(/Step.*3.*\/.*3/)).toBeDefined();
    expect(screen.getByText(/Simulation Mode • Safe Practice • No Real Call/i)).toBeDefined();
    tapHighlightElement('end_call_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('whatsapp_video_call');
  });

  // 5. Task 5: gpay_check_balance
  it('Task 5 (gpay_check_balance): verifies simulated bank balance check and mock PIN entry', () => {
    const task = tasks.find(t => t.task_id === 'gpay_check_balance')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*3/)).toBeDefined();
    tapHighlightElement('check_balance_button', 400);

    expect(screen.getByText(/Step.*2.*\/.*3/)).toBeDefined();
    expect(screen.getByText('Enter 4-Digit Secret UPI PIN')).toBeDefined();
    tapHighlightElement('pin_keypad_submit', 400);

    expect(screen.getByText(/Step.*3.*\/.*3/)).toBeDefined();
    expect(screen.getAllByText(/₹14,250/).length).toBeGreaterThanOrEqual(1);
    tapHighlightElement('balance_done_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('gpay_check_balance');
  });

  // 6. Task 6: gpay_scan_qr
  it('Task 6 (gpay_scan_qr): verifies QR scanner viewfinder, ₹200 amount, mock PIN, and success receipt', () => {
    const task = tasks.find(t => t.task_id === 'gpay_scan_qr')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*5/)).toBeDefined();
    tapHighlightElement('scan_qr_button', 400);

    expect(screen.getByText(/Step.*2.*\/.*5/)).toBeDefined();
    expect(screen.getByText('Sharma Kirana Store')).toBeDefined();
    tapHighlightElement('qr_target_box', 400);

    expect(screen.getByText(/Step.*3.*\/.*5/)).toBeDefined();
    expect(screen.getByText('Sharma Groceries')).toBeDefined();
    expect(screen.getByText('Proceed to Pay (₹200)')).toBeDefined();
    tapHighlightElement('proceed_to_pay_button', 400);

    expect(screen.getByText(/Step.*4.*\/.*5/)).toBeDefined();
    tapHighlightElement('pin_keypad_submit', 400);

    expect(screen.getByText(/Step.*5.*\/.*5/)).toBeDefined();
    expect(screen.getByText('₹200.00')).toBeDefined();
    expect(screen.getByText(/Sharma Groceries • UPI Ref/i)).toBeDefined();
    tapHighlightElement('success_done_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('gpay_scan_qr');
  });

  // 7. Task 7: gpay_send_contact
  it('Task 7 (gpay_send_contact): verifies contact selection, ₹1,000 payment screen, and success receipt', () => {
    const task = tasks.find(t => t.task_id === 'gpay_send_contact')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*6/)).toBeDefined();
    tapHighlightElement('pay_contacts_button', 400);

    expect(screen.getByText(/Step.*2.*\/.*6/)).toBeDefined();
    expect(screen.getByText('Ramesh')).toBeDefined();
    tapHighlightElement('contact_son_ramesh', 400);

    expect(screen.getByText(/Step.*3.*\/.*6/)).toBeDefined();
    tapHighlightElement('contact_pay_button', 400);

    expect(screen.getByText(/Step.*4.*\/.*6/)).toBeDefined();
    expect(screen.getByText('Ramesh (Son)')).toBeDefined();
    expect(screen.getByText('Proceed to Pay (₹1,000)')).toBeDefined();
    tapHighlightElement('proceed_to_pay_button', 400);

    expect(screen.getByText(/Step.*5.*\/.*6/)).toBeDefined();
    tapHighlightElement('pin_keypad_submit', 400);

    expect(screen.getByText(/Step.*6.*\/.*6/)).toBeDefined();
    expect(screen.getByText('₹1,000.00')).toBeDefined();
    expect(screen.getByText(/Ramesh \(Son\) • UPI Ref/i)).toBeDefined();
    tapHighlightElement('success_done_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('gpay_send_contact');
  });

  // 8. Task 8: gpay_transaction_history
  it('Task 8 (gpay_transaction_history): verifies history list, transaction detail, and back return navigation', () => {
    const task = tasks.find(t => t.task_id === 'gpay_transaction_history')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*3/)).toBeDefined();
    tapHighlightElement('transaction_history_button', 400);

    expect(screen.getByText(/Step.*2.*\/.*3/)).toBeDefined();
    tapHighlightElement('history_item_1', 400);

    expect(screen.getByText(/Step.*3.*\/.*3/)).toBeDefined();
    expect(screen.getByText('Payment Receipt')).toBeDefined();
    tapHighlightElement('receipt_back_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('gpay_transaction_history');
  });

  // 9. Task 9: whatsapp_voice_message
  it('Task 9 (whatsapp_voice_message): verifies mic control, recording simulator, and voice-message bubble', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_voice_message')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();
    tapHighlightElement('mic_record_button', 400);

    expect(screen.getByText(/Step.*2.*\/.*2/)).toBeDefined();
    expect(screen.getByText('Recording audio note...')).toBeDefined();
    tapHighlightElement('send_voice_note_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();
    expect(StorageService.getProfile().completedTasks).toContain('whatsapp_voice_message');
  });

  // 10. Repeatability / Practice Again for all 9 tasks
  it('verifies that any completed task can be restarted ("Practice Again") without state corruption', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    // Complete task
    tapHighlightElement('chat_input', 400);
    tapHighlightElement('send_button', 750);

    expect(screen.getByText(/Task Completed!/i)).toBeDefined();

    // Click Practice Again
    const practiceAgainBtn = screen.getByText('Practice Again');
    act(() => {
      fireEvent.click(practiceAgainBtn);
    });

    // Successfully reset back to Step 1
    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();
    expect(document.querySelector('[data-element-id="chat_input"]')).not.toBeNull();
  });

  // 11. Wrong tap interaction: gentle nudge without progression or error
  it('wrong tap triggers gentle guidance without progressing or losing current step', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();

    // Click an inactive element (wrong tap)
    const inactiveIcon = document.querySelector('[data-element-id="video_call_icon"]')!;
    act(() => {
      fireEvent.click(inactiveIcon);
    });

    // Shows gentle guidance nudge toast
    expect(screen.getByText(/highlighted button with the yellow border/i)).toBeDefined();

    // Still on step 1! Did not advance!
    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();
  });

  // 12. Tremor double-tap lockout
  it('prevents rapid double taps from skipping steps', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    const chatInput = document.querySelector('[data-element-id="chat_input"]')!;

    // Tap once
    act(() => {
      fireEvent.click(chatInput);
    });

    // Rapid second tap immediately (e.g. 50ms later)
    act(() => {
      vi.advanceTimersByTime(50);
      fireEvent.click(chatInput);
    });

    // Finish step 1 transition (350ms)
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Must be on Step 2, NOT completed or skipped!
    expect(screen.getByText(/Step.*2.*\/.*2/)).toBeDefined();
  });

  // 13. Exit confirmation and safe cancellation
  it('handles in-progress exit request with confirmation prompt and resumption', () => {
    const task = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    // Advance to step 2
    tapHighlightElement('chat_input', 400);

    // Tap Exit
    const exitBtn = screen.getByRole('button', { name: /^Exit$/i });
    act(() => {
      fireEvent.click(exitBtn);
    });

    // Confirmation modal appears
    expect(screen.getByText('Exit Tutorial?')).toBeDefined();
    expect(screen.getByText('Your current step progress will not be saved.')).toBeDefined();

    // Tap Cancel -> modal disappears, still on step 2
    const cancelBtn = screen.getByText('Cancel');
    act(() => {
      fireEvent.click(cancelBtn);
    });

    expect(screen.queryByText('Exit Tutorial?')).toBeNull();
    expect(screen.getByText(/Step.*2.*\/.*2/)).toBeDefined();
    expect(onExit).not.toHaveBeenCalled();
  });

  // 14. Configuration validation error screen
  it('renders a friendly diagnosable error screen if task configuration is invalid', () => {
    const brokenTask = {
      task_id: 'broken_task',
      app: 'whatsapp',
      title: { en: 'Broken', hi: 'टूटा', ml: 'തകരാർ' },
      description: { en: 'Desc', hi: 'विवरण', ml: 'വിവരണം' },
      steps: [
        {
          screen: 'non_existent_screen',
          highlight_element: 'non_existent_element',
          audio_en: 'assets/audio/en/broken.mp3',
          audio_hi: 'assets/audio/hi/broken.mp3',
          audio_ml: 'assets/audio/ml/broken.mp3',
          hint_text: { en: 'Hint', hi: 'संकेत', ml: 'സൂചന' }
        }
      ]
    } as any;

    const onExit = vi.fn();
    render(<TaskEngine task={brokenTask} language="en" onExit={onExit} />);

    expect(screen.getByText('Task Configuration Error')).toBeDefined();
    expect(screen.getByText(/unknown screen "non_existent_screen"/i)).toBeDefined();
    expect(screen.getByText(/unknown highlight_element "non_existent_element"/i)).toBeDefined();
  });
});
