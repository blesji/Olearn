import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HighlightTarget } from '../engine/HighlightTarget';
import { TaskEngine } from '../engine/TaskEngine';
import { HomeScreen } from '../screens/HomeScreen';
import { AudioService } from '../services/AudioService';
import { StorageService } from '../services/StorageService';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
(globalThis as any).localStorage = new LocalStorageMock();

describe('Senior-Centered Accessibility & WCAG Standards', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    AudioService.setMuted(false);
    AudioService.setSpeechRate(0.9);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies HighlightTarget implements WCAG ARIA roles, tabindex, and keyboard event handlers', () => {
    const onCorrect = vi.fn();
    const onWrong = vi.fn();

    const { rerender } = render(
      <HighlightTarget
        elementId="send_button"
        activeHighlightId="send_button"
        onCorrectTap={onCorrect}
        onWrongTap={onWrong}
      >
        <button>Send</button>
      </HighlightTarget>
    );

    const el = document.querySelector('[data-element-id="send_button"]');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('role')).toBe('button');
    expect(el?.getAttribute('tabindex')).toBe('0');
    expect(el?.getAttribute('aria-label')).toBe('Active step button, tap to proceed');
    expect(el?.classList.contains('highlight-active')).toBe(true);

    // Test Keyboard navigation: Enter key
    fireEvent.keyDown(el!, { key: 'Enter', code: 'Enter' });
    expect(onCorrect).toHaveBeenCalledTimes(1);

    // Test Keyboard navigation: Space key
    fireEvent.keyDown(el!, { key: ' ', code: 'Space' });
    expect(onCorrect).toHaveBeenCalledTimes(2);

    // Rerender as inert / inactive
    rerender(
      <HighlightTarget
        elementId="send_button"
        activeHighlightId="different_button"
        onCorrectTap={onCorrect}
        onWrongTap={onWrong}
      >
        <button>Send</button>
      </HighlightTarget>
    );

    expect(el?.getAttribute('aria-label')).toBe('Inactive button');
    expect(el?.classList.contains('highlight-active')).toBe(false);

    // Pressing inactive button calls onWrongTap (gentle guidance) without executing correct action
    fireEvent.keyDown(el!, { key: 'Enter', code: 'Enter' });
    expect(onWrong).toHaveBeenCalledTimes(1);
    expect(onCorrect).toHaveBeenCalledTimes(2); // unchanged
  });

  it('verifies primary HomeScreen app tiles meet senior touch target specifications (>=120dp)', () => {
    const onSelectApp = vi.fn();
    const onOpenAskMe = vi.fn();

    render(
      <HomeScreen
        language="en"
        onSelectApp={onSelectApp}
        onOpenAskMe={onOpenAskMe}
      />
    );

    // Verify WhatsApp and Google Pay are the two primary tiles
    const waButton = screen.getByText('WhatsApp').closest('button');
    const gpayButton = screen.getByText('Google Pay').closest('button');

    expect(waButton).not.toBeNull();
    expect(gpayButton).not.toBeNull();

    // Check min-height class for senior motor accessibility
    expect(waButton?.className).toContain('min-h-[140px]');
    expect(gpayButton?.className).toContain('min-h-[140px]');
  });

  it('verifies non-threatening wrong-tap handling: preserves step state and gives gentle hint', () => {
    const task = (tasksData as TaskConfig[])[0]; // whatsapp_send_text
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    // Step 1: chat_input
    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();

    // Tap outside / wrong element
    const container = document.querySelector('.bg-white.relative.overflow-hidden');
    expect(container).not.toBeNull();

    act(() => {
      fireEvent.click(container!);
    });

    // Step state must NOT be skipped or destroyed
    expect(screen.getByText(/Step.*1.*\/.*2/)).toBeDefined();
    expect(onExit).not.toHaveBeenCalled();

    // Gentle nudge toast must appear
    expect(screen.getByText(/Try tapping the highlighted button with the yellow border/i)).toBeDefined();
  });

  it('verifies narration mute/unmute and speech rate controls operate and persist properly', () => {
    const task = (tasksData as TaskConfig[])[0];
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    // Mute button
    const muteBtn = screen.getByLabelText(/Mute/i);
    expect(muteBtn).toBeDefined();

    // Toggle mute
    act(() => {
      fireEvent.click(muteBtn);
    });

    expect(AudioService.isAudioMuted()).toBe(true);
    expect(StorageService.getIsMuted()).toBe(true);
    expect(screen.getByLabelText(/Unmute/i)).toBeDefined();

    // Toggle unmute
    const unmuteBtn = screen.getByLabelText(/Unmute/i);
    act(() => {
      fireEvent.click(unmuteBtn);
    });

    expect(AudioService.isAudioMuted()).toBe(false);
    expect(StorageService.getIsMuted()).toBe(false);

    // Speed button
    const speedBtn = screen.getByLabelText(/Narration Speed/i);
    expect(speedBtn).toBeDefined();

    act(() => {
      fireEvent.click(speedBtn);
    });

    // Toggled to slow rate 0.8x
    expect(StorageService.getSpeechRate()).toBe(0.8);
    expect(AudioService.getSpeechRate()).toBe(0.8);
  });

  it('verifies text instruction is always readable in DOM as an independent alternative to audio', () => {
    const task = (tasksData as TaskConfig[])[0];
    const onExit = vi.fn();

    render(<TaskEngine task={task} language="en" onExit={onExit} />);

    // Step 1 hint text must exist in the document
    const hintElement = screen.getByText('Tap the message box at the bottom to type your message.');
    expect(hintElement).toBeDefined();

    // Even if sound is muted, text instruction is never hidden
    AudioService.setMuted(true);
    expect(screen.getByText('Tap the message box at the bottom to type your message.')).toBeDefined();
  });
});
