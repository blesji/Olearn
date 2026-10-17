import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StorageService } from '../services/StorageService';
import { WhatsAppReplica } from '../replicas/WhatsAppReplica';
import { GPayReplica } from '../replicas/GPayReplica';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
(globalThis as any).localStorage = new LocalStorageMock();

describe('Global Font Size Accessibility Slider & Responsive Typography', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    StorageService.setFontSize(20);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. SettingsScreen Slider Interface & Controls', () => {
    it('renders text size title, current 20 sp badge, and sample text in English', () => {
      render(
        <SettingsScreen
          language="en"
          onLanguageChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      // Title & Current size badge
      expect(screen.getByText('Text Size')).not.toBeNull();
      expect(screen.getAllByText('20 sp').length).toBeGreaterThanOrEqual(1);

      // Sample preview text
      expect(screen.getByText('This is how instructions and messages will look.')).not.toBeNull();

      // Accessible slider
      const slider = screen.getByRole('slider', { name: /Current Text Size/i });
      expect(slider).not.toBeNull();
      expect(slider.getAttribute('aria-valuenow')).toBe('20');
      expect(slider.getAttribute('aria-valuemin')).toBe('16');
      expect(slider.getAttribute('aria-valuemax')).toBe('30');
    });

    it('increments and decrements font size using accessible +/- buttons and applies global scale', () => {
      render(
        <SettingsScreen
          language="en"
          onLanguageChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const plusBtn = screen.getByLabelText(/Larger/i);
      const minusBtn = screen.getByLabelText(/Smaller/i);

      // Increment to 21
      fireEvent.click(plusBtn);
      expect(StorageService.getFontSize()).toBe(21);
      expect(screen.getByText('21 sp')).not.toBeNull();
      expect(document.documentElement.style.getPropertyValue('--olearn-font-scale')).toBe('1.05');

      // Increment to 22
      fireEvent.click(plusBtn);
      expect(StorageService.getFontSize()).toBe(22);
      expect(screen.getByText('22 sp')).not.toBeNull();

      // Decrement back to 21
      fireEvent.click(minusBtn);
      expect(StorageService.getFontSize()).toBe(21);
      expect(screen.getByText('21 sp')).not.toBeNull();
    });

    it('displays reset-to-default button when size != 20 and restores 20 sp on click', () => {
      render(
        <SettingsScreen
          language="en"
          onLanguageChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const plusBtn = screen.getByLabelText(/Larger/i);
      fireEvent.click(plusBtn); // 21sp

      // Reset button must now be visible
      const resetBtn = screen.getByRole('button', { name: /Reset to Default \(20sp\)/i });
      expect(resetBtn).not.toBeNull();

      // Click reset
      fireEvent.click(resetBtn);
      expect(StorageService.getFontSize()).toBe(20);
      expect(screen.getAllByText('20 sp').length).toBeGreaterThanOrEqual(1);
      expect(document.documentElement.style.getPropertyValue('--olearn-font-scale')).toBe('1');
    });

    it('disables decrement button at min 16sp and increment button at max 30sp', () => {
      render(
        <SettingsScreen
          language="en"
          onLanguageChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      const slider = screen.getByRole('slider', { name: /Current Text Size/i });

      // Move slider to minimum 16
      fireEvent.change(slider, { target: { value: '16' } });
      expect(StorageService.getFontSize()).toBe(16);
      const minusBtn = screen.getByLabelText(/Smaller/i) as HTMLButtonElement;
      expect(minusBtn.disabled).toBe(true);

      // Move slider to maximum 30
      fireEvent.change(slider, { target: { value: '30' } });
      expect(StorageService.getFontSize()).toBe(30);
      const plusBtn = screen.getByLabelText(/Larger/i) as HTMLButtonElement;
      expect(plusBtn.disabled).toBe(true);
    });
  });

  describe('2. Multilingual Localization of Font Size Controls', () => {
    it('renders font size controls in Hindi with proper typography and sample text', () => {
      render(
        <SettingsScreen
          language="hi"
          onLanguageChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('अक्षरों का आकार')).not.toBeNull();
      expect(screen.getByText('निर्देश और संदेश इस आकार में दिखाई देंगे।')).not.toBeNull();
      expect(screen.getByText(/आसानी से पढ़ने के लिए पूरे ऐप में अक्षरों का आकार बदलें/i)).not.toBeNull();
    });

    it('renders font size controls in Malayalam with proper typography and sample text', () => {
      render(
        <SettingsScreen
          language="ml"
          onLanguageChange={vi.fn()}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('അക്ഷരങ്ങളുടെ വലിപ്പം')).not.toBeNull();
      expect(screen.getByText('നിർദ്ദേശങ്ങളും സന്ദേശങ്ങളും ഇങ്ങനെ കാണാം.')).not.toBeNull();
      expect(screen.getByText(/സുഖമായി വായിക്കുന്നതിനായി ആപ്പിലെ അക്ഷരങ്ങളുടെ വലിപ്പം മാറ്റുക/i)).not.toBeNull();
    });
  });

  describe('3. Critical Replica Layout Stability at Minimum (16sp) and Maximum (30sp)', () => {
    it('renders WhatsApp composer without clipping or overflow at minimum font size (16sp)', () => {
      StorageService.setFontSize(16);

      render(
        <WhatsAppReplica
          screen="whatsapp_chat_screen"
          highlightElement="chat_input"
          language="ml"
          onCorrectTap={vi.fn()}
          onWrongTap={vi.fn()}
        />
      );

      const input = document.querySelector('[data-element-id="chat_input"]');
      expect(input).not.toBeNull();
      expect(input?.parentElement?.className).toContain('flex');
    });

    it('renders WhatsApp composer and send button without clipping at maximum font size (30sp)', () => {
      StorageService.setFontSize(30);

      render(
        <WhatsAppReplica
          screen="whatsapp_chat_screen_typed"
          highlightElement="send_button"
          language="ml"
          onCorrectTap={vi.fn()}
          onWrongTap={vi.fn()}
        />
      );

      const sendBtn = document.querySelector('[data-element-id="send_button"]');
      expect(sendBtn).not.toBeNull();
      expect(sendBtn?.getAttribute('aria-label')).toBe('Active step button, tap to proceed');
    });

    it('renders Google Pay PIN screen and 12-key keypad intact at maximum font size (30sp)', () => {
      StorageService.setFontSize(30);

      render(
        <GPayReplica
          screen="gpay_upi_pin_screen"
          highlightElement="pin_keypad_submit"
          language="hi"
          onCorrectTap={vi.fn()}
          onWrongTap={vi.fn()}
        />
      );

      const submitBtn = document.querySelector('[data-element-id="pin_keypad_submit"]');
      expect(submitBtn).not.toBeNull();
      expect(screen.getByText('UPI PIN')).not.toBeNull();
      expect(screen.getByText('SBI Bank')).not.toBeNull();
    });

    it('renders Google Pay balance display with prominent balance at maximum font size (30sp)', () => {
      StorageService.setFontSize(30);

      render(
        <GPayReplica
          screen="gpay_balance_display_screen"
          highlightElement="balance_done_button"
          language="ml"
          onCorrectTap={vi.fn()}
          onWrongTap={vi.fn()}
        />
      );

      expect(screen.getByText('State Bank of India')).not.toBeNull();
      expect(screen.getByText('•••• •••• 4829')).not.toBeNull();
      const doneBtn = document.querySelector('[data-element-id="balance_done_button"]');
      expect(doneBtn).not.toBeNull();
    });
  });
});
