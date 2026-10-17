import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/StorageService';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(globalThis as any).localStorage = new LocalStorageMock();

describe('StorageService Persistence & Local Profile', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
  });

  it('returns default profile on fresh launch', () => {
    const profile = StorageService.getProfile();
    expect(profile.firstLaunchCompleted).toBe(false);
    expect(profile.language).toBe('en');
    expect(profile.completedTasks).toEqual([]);
  });

  it('sets language and marks firstLaunchCompleted', () => {
    StorageService.setLanguage('hi');
    const profile = StorageService.getProfile();
    expect(profile.language).toBe('hi');
    expect(profile.firstLaunchCompleted).toBe(true);

    StorageService.setLanguage('ml');
    expect(StorageService.getProfile().language).toBe('ml');
  });

  it('records completed tasks without duplicates', () => {
    StorageService.markTaskCompleted('whatsapp_send_text');
    StorageService.markTaskCompleted('whatsapp_send_text');
    StorageService.markTaskCompleted('gpay_check_balance');

    const profile = StorageService.getProfile();
    expect(profile.completedTasks).toEqual(['whatsapp_send_text', 'gpay_check_balance']);
  });

  it('resets progress without resetting language choice', () => {
    StorageService.setLanguage('ml');
    StorageService.markTaskCompleted('whatsapp_send_text');

    StorageService.resetProgress();
    const profile = StorageService.getProfile();
    expect(profile.completedTasks).toEqual([]);
    expect(profile.language).toBe('ml');
    expect(profile.firstLaunchCompleted).toBe(true);
  });

  it('handles malformed or corrupted JSON gracefully', () => {
    (globalThis as any).localStorage.setItem('olearn_user_profile_v1', '{corrupt json invalid!!');
    const profile = StorageService.getProfile();
    expect(profile).toBeDefined();
    expect(profile.language).toBe('en');
    expect(profile.completedTasks).toEqual([]);
    expect(profile.firstLaunchCompleted).toBe(false);
  });

  it('migrates legacy unversioned profile to v1 key and cleans old key', () => {
    const legacyProfile = {
      name: 'ElderlyUser',
      language: 'hi',
      completedTasks: ['whatsapp_send_text', 'whatsapp_send_photo'],
      firstLaunchCompleted: true
    };
    (globalThis as any).localStorage.setItem('olearn_user_profile', JSON.stringify(legacyProfile));

    const migrated = StorageService.getProfile();
    expect(migrated.language).toBe('hi');
    expect(migrated.completedTasks).toEqual(['whatsapp_send_text', 'whatsapp_send_photo']);
    expect(migrated.firstLaunchCompleted).toBe(true);

    // Old key must be removed and v1 key saved
    expect((globalThis as any).localStorage.getItem('olearn_user_profile')).toBeNull();
    expect((globalThis as any).localStorage.getItem('olearn_user_profile_v1')).not.toBeNull();
  });

  it('persists and retrieves narration speech rate', () => {
    expect(StorageService.getSpeechRate()).toBe(0.9);
    StorageService.setSpeechRate(0.8);
    expect(StorageService.getSpeechRate()).toBe(0.8);

    const profile = StorageService.getProfile();
    expect(profile.speechRate).toBe(0.8);
  });

  it('manages font-size with default 20, boundary clamping (16-30), and persistence', () => {
    // 1. Default on fresh launch
    expect(StorageService.getFontSize()).toBe(20);

    // 2. Setting within valid range
    StorageService.setFontSize(24);
    expect(StorageService.getFontSize()).toBe(24);
    expect(StorageService.getProfile().fontSize).toBe(24);

    // 3. Clamping below minimum (16)
    StorageService.setFontSize(10);
    expect(StorageService.getFontSize()).toBe(16);

    // 4. Clamping above maximum (30)
    StorageService.setFontSize(45);
    expect(StorageService.getFontSize()).toBe(30);

    // 5. Recovering from corrupt/invalid value
    (globalThis as any).localStorage.setItem(
      'olearn_user_profile_v1',
      JSON.stringify({ fontSize: 'invalid_string' })
    );
    expect(StorageService.getFontSize()).toBe(20);
  });

  it('preserves font-size setting when switching languages', () => {
    StorageService.setFontSize(26);
    expect(StorageService.getFontSize()).toBe(26);

    StorageService.setLanguage('hi');
    expect(StorageService.getFontSize()).toBe(26);

    StorageService.setLanguage('ml');
    expect(StorageService.getFontSize()).toBe(26);
  });

  it('applies typography scale CSS properties to documentElement', () => {
    StorageService.setFontSize(24);
    expect(document.documentElement.style.getPropertyValue('--olearn-font-scale')).toBe('1.2');
    expect(document.documentElement.style.getPropertyValue('--olearn-base-font-size')).toBe('24px');
    expect(document.documentElement.style.fontSize).toBe('19.2px');

    StorageService.setFontSize(16);
    expect(document.documentElement.style.getPropertyValue('--olearn-font-scale')).toBe('0.8');
    expect(document.documentElement.style.getPropertyValue('--olearn-base-font-size')).toBe('16px');
    expect(document.documentElement.style.fontSize).toBe('12.8px');

    StorageService.setFontSize(20);
    expect(document.documentElement.style.getPropertyValue('--olearn-font-scale')).toBe('1');
    expect(document.documentElement.style.getPropertyValue('--olearn-base-font-size')).toBe('20px');
    expect(document.documentElement.style.fontSize).toBe('16px');
  });

  it('falls back to memory store if localStorage throws exceptions', () => {
    const originalSetItem = (globalThis as any).localStorage.setItem;
    const originalGetItem = (globalThis as any).localStorage.getItem;

    (globalThis as any).localStorage.setItem = () => {
      throw new Error('QuotaExceededError: LocalStorage is full or disabled');
    };
    (globalThis as any).localStorage.getItem = () => {
      throw new Error('SecurityError: Access denied');
    };

    expect(() => {
      StorageService.setLanguage('hi');
      const profile = StorageService.getProfile();
      expect(profile.language).toBe('hi');
    }).not.toThrow();

    (globalThis as any).localStorage.setItem = originalSetItem;
    (globalThis as any).localStorage.getItem = originalGetItem;
  });
});
