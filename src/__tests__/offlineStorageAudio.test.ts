import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(globalThis as any).localStorage = new LocalStorageMock();

describe('Phase 4 Offline-First & Local Data Resilience', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    AudioService.stopAudio();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('operates 100% offline with navigator.onLine set to false without blocking', async () => {
    // Simulate device in airplane mode
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true
    });

    expect(navigator.onLine).toBe(false);

    let endedCalled = false;
    // Calling playDynamicTTS in Malayalam when offline must NOT attempt network fetch
    AudioService.playDynamicTTS('ടെക്സ്റ്റ് സന്ദേശം അയക്കുക', 'ml', () => {
      endedCalled = true;
    });

    // In offline mode with speech synthesis mocked or inert, callback completes safely
    expect(endedCalled).toBe(true);
  });

  it('handles missing or failed audio file with graceful fallback without hanging', async () => {
    // Mock Audio to simulate onerror trigger (e.g. missing or corrupt asset)
    const mockAudio: any = {
      play: vi.fn().mockRejectedValue(new Error('File not found')),
      pause: vi.fn(),
      playbackRate: 1.0,
      currentTime: 0,
      onended: null,
      onerror: null
    };

    vi.spyOn(globalThis, 'Audio').mockImplementation(() => mockAudio as any);

    let finishCalled = false;
    const playPromise = AudioService.playNarration(
      'assets/audio/en/non_existent.mp3',
      'en',
      'Fallback instruction text',
      () => {
        finishCalled = true;
      }
    );

    await playPromise;

    // Simulate audio element triggering onerror
    if (mockAudio.onerror) {
      mockAudio.onerror(new Event('error'));
    }

    expect(finishCalled).toBe(true);
  });

  it('provides pause, resume, and playing status controls for narration', () => {
    const mockAudio: any = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      playbackRate: 0.9,
      currentTime: 0,
      paused: false,
      onended: null,
      onerror: null
    };

    vi.spyOn(globalThis, 'Audio').mockImplementation(() => mockAudio as any);

    AudioService.playNarration('assets/audio/en/wa_text_step1.mp3', 'en', 'Hint text', () => {});

    expect(AudioService.isAudioPlaying()).toBe(true);
    expect(AudioService.isAudioPaused()).toBe(false);

    // Pause narration
    AudioService.pauseNarration();
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(AudioService.isAudioPaused()).toBe(true);

    // Resume narration
    mockAudio.paused = true;
    AudioService.resumeNarration();
    expect(mockAudio.play).toHaveBeenCalled();
    expect(AudioService.isAudioPaused()).toBe(false);

    // Stop audio
    AudioService.stopAudio();
    expect(AudioService.isAudioPlaying()).toBe(false);
    expect(AudioService.isAudioPaused()).toBe(false);
  });

  it('triggers safety timeout so learner is never stuck if audio playback hangs', () => {
    // Create an audio element that never fires onended or onerror
    const hangingAudio: any = {
      play: vi.fn().mockReturnValue(new Promise(() => {})), // Hangs forever
      pause: vi.fn(),
      playbackRate: 1.0,
      currentTime: 0,
      onended: null,
      onerror: null
    };

    vi.spyOn(globalThis, 'Audio').mockImplementation(() => hangingAudio as any);

    let onEndedFired = false;
    AudioService.playNarration('assets/audio/en/wa_text_step1.mp3', 'en', 'Hint text', () => {
      onEndedFired = true;
    });

    expect(onEndedFired).toBe(false);

    // Fast-forward safety timer by 10 seconds
    vi.advanceTimersByTime(10050);

    // Safety timeout must have invoked the callback
    expect(onEndedFired).toBe(true);
    expect(AudioService.isAudioPlaying()).toBe(false);
  });

  it('survives cold launch, language changes, and simulated restarts without data loss', () => {
    // Initial launch: select Hindi
    StorageService.setLanguage('hi');
    StorageService.markTaskCompleted('whatsapp_send_text');
    StorageService.markTaskCompleted('gpay_check_balance');
    StorageService.setSpeechRate(0.8);

    // Simulate App Termination & Cold Restart (fresh read from storage)
    const restartProfile = StorageService.getProfile();
    expect(restartProfile.language).toBe('hi');
    expect(restartProfile.firstLaunchCompleted).toBe(true);
    expect(restartProfile.completedTasks).toContain('whatsapp_send_text');
    expect(restartProfile.completedTasks).toContain('gpay_check_balance');
    expect(restartProfile.speechRate).toBe(0.8);

    // Change language to Malayalam: task completion history MUST NOT be lost
    StorageService.setLanguage('ml');
    const mlProfile = StorageService.getProfile();
    expect(mlProfile.language).toBe('ml');
    expect(mlProfile.completedTasks.length).toBe(2);

    // Reset progress action: clears completedTasks but preserves language & settings
    StorageService.resetProgress();
    const resetProfile = StorageService.getProfile();
    expect(resetProfile.completedTasks).toEqual([]);
    expect(resetProfile.language).toBe('ml');
    expect(resetProfile.firstLaunchCompleted).toBe(true);
    expect(resetProfile.speechRate).toBe(0.8);
  });
});
