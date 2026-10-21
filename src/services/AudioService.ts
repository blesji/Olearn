import { SupportedLanguage } from '../types/task';
import { StorageService } from './StorageService';

class AudioServiceClass {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private speechRate: number = 0.9; // Elderly-friendly slightly slower pace
  private isPlayingState: boolean = false;
  private isPausedState: boolean = false;
  private safetyTimeoutRef: any = null;

  constructor() {
    // Synchronize initial rate and mute settings with persistent storage if available
    try {
      this.speechRate = StorageService.getSpeechRate();
      this.isMuted = StorageService.getIsMuted();
    } catch {
      this.speechRate = 0.9;
      this.isMuted = false;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (typeof AudioCtxClass !== 'function') return null;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.currentAudio) {
      this.currentAudio.muted = muted;
    }
    try {
      StorageService.setIsMuted(muted);
    } catch (e) {
      console.warn('Could not persist mute setting:', e);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setSpeechRate(rate: number): void {
    this.speechRate = rate;
    if (this.currentAudio) {
      try {
        this.currentAudio.playbackRate = rate;
      } catch (e) {
        console.warn('Could not set playbackRate on active audio:', e);
      }
    }
    try {
      StorageService.setSpeechRate(rate);
    } catch (e) {
      console.warn('Could not persist speech rate:', e);
    }
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public isAudioPlaying(): boolean {
    return this.isPlayingState;
  }

  public isAudioPaused(): boolean {
    return this.isPausedState;
  }

  public pauseNarration(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPausedState = true;
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.isPausedState = true;
    }
  }

  public resumeNarration(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(e => console.warn('Audio resume error:', e));
      this.isPausedState = false;
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isPausedState = false;
    }
  }

  public stopAudio(): void {
    if (this.safetyTimeoutRef) {
      clearTimeout(this.safetyTimeoutRef);
      this.safetyTimeoutRef = null;
    }
    if (this.currentAudio) {
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        console.warn('Error stopping audio:', e);
      }
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlayingState = false;
    this.isPausedState = false;
  }

  /**
   * Plays the narration for a task step.
   * Priority:
   * 1. Pre-recorded bundled local MP3 file
   * 2. Malayalam fallback: Google Translate's public TTS endpoint (only if online)
   * 3. Fallback: Browser/Device Web Speech Synthesis
   */
  public async playNarration(
    audioPath: string,
    language: SupportedLanguage,
    fallbackText?: string,
    onEnded?: () => void
  ): Promise<void> {
    this.stopAudio();
    this.isPlayingState = true;
    this.isPausedState = false;

    let callbackInvoked = false;
    const finish = () => {
      if (callbackInvoked) return;
      callbackInvoked = true;
      if (this.safetyTimeoutRef) {
        clearTimeout(this.safetyTimeoutRef);
        this.safetyTimeoutRef = null;
      }
      this.isPlayingState = false;
      this.isPausedState = false;
      this.currentAudio = null;
      if (onEnded) onEnded();
    };

    // Safety timeout: Ensure narration state never hangs indefinitely (max 10s per step)
    this.safetyTimeoutRef = setTimeout(() => {
      if (!callbackInvoked) {
        finish();
      }
    }, 10000);

    // 1. Try playing pre-recorded audio from public path
    const resolvedPath = audioPath.startsWith('/') ? audioPath : '/' + audioPath;
    try {
      const audio = new Audio(resolvedPath);
      audio.playbackRate = this.speechRate;
      audio.muted = this.isMuted;
      this.currentAudio = audio;

      audio.onended = () => {
        finish();
      };

      audio.onerror = (e) => {
        console.warn(`Local audio failed for ${resolvedPath}, falling back to dynamic TTS:`, e);
        this.currentAudio = null;
        if (fallbackText) {
          this.playDynamicTTS(fallbackText, language, finish);
        } else {
          finish();
        }
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn('Audio play threw error, using TTS fallback:', err);
      if (fallbackText) {
        this.playDynamicTTS(fallbackText, language, finish);
      } else {
        finish();
      }
    }
  }

  /**
   * Plays dynamic or fallback text.
   * Offline Safety: Never attempts remote network calls when navigator.onLine === false.
   */
  public playDynamicTTS(text: string, language: SupportedLanguage, onEnded?: () => void): void {
    this.stopAudio();
    this.isPlayingState = true;
    this.isPausedState = false;

    let callbackInvoked = false;
    const finish = () => {
      if (callbackInvoked) return;
      callbackInvoked = true;
      this.isPlayingState = false;
      this.isPausedState = false;
      this.currentAudio = null;
      if (onEnded) onEnded();
    };

    if (this.isMuted) {
      finish();
      return;
    }

    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

    if (language === 'ml' && isOnline) {
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ml&client=tw-ob&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.playbackRate = this.speechRate;
        audio.muted = this.isMuted;
        this.currentAudio = audio;

        // Offline / network hang protection for external endpoint
        const networkTimeout = setTimeout(() => {
          if (this.currentAudio === audio) {
            this.deviceSpeechFallback(text, 'ml', finish);
          }
        }, 3500);

        audio.onended = () => {
          clearTimeout(networkTimeout);
          finish();
        };
        audio.onerror = () => {
          clearTimeout(networkTimeout);
          this.deviceSpeechFallback(text, 'ml', finish);
        };
        audio.play().catch(() => {
          clearTimeout(networkTimeout);
          this.deviceSpeechFallback(text, 'ml', finish);
        });
        return;
      } catch {
        this.deviceSpeechFallback(text, 'ml', finish);
        return;
      }
    }

    this.deviceSpeechFallback(text, language, finish);
  }

  private deviceSpeechFallback(text: string, language: SupportedLanguage, onEnded?: () => void): void {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnded) onEnded();
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.speechRate;
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'ml') utterance.lang = 'ml-IN';
      else utterance.lang = 'en-IN';

      utterance.onend = () => {
        if (onEnded) onEnded();
      };
      utterance.onerror = () => {
        if (onEnded) onEnded();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnded) onEnded();
    }
  }

  // --- Sound Effects using Web Audio API ---
  public playCorrectSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('AudioContext SFX error:', e);
    }
  }

  public playNudgeSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
      osc.frequency.setValueAtTime(260, ctx.currentTime + 0.1); // C4

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {
      console.warn('AudioContext SFX error:', e);
    }
  }

  public playCelebrationSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (e) {
      console.warn('AudioContext celebration error:', e);
    }
  }
}

export const AudioService = new AudioServiceClass();
