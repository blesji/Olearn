import { AppProfile, SupportedLanguage } from '../types/task';

const STORAGE_KEY = 'olearn_user_profile_v1';
const LEGACY_STORAGE_KEYS = ['olearn_user_profile', 'olearn_profile'];

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`localStorage.getItem failed for key "${key}", using memory store fallback:`, e);
    return memoryStore[key] ?? null;
  }
  return memoryStore[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      delete memoryStore[key];
      return;
    }
  } catch (e) {
    console.warn(`localStorage.setItem failed for key "${key}", writing to memory store fallback:`, e);
  }
  memoryStore[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`localStorage.removeItem failed for key "${key}":`, e);
  }
  delete memoryStore[key];
}

export const DEFAULT_FONT_SIZE = 20;
export const MIN_FONT_SIZE = 16;
export const MAX_FONT_SIZE = 30;

export function clampFontSize(val: unknown): number {
  const num = Number(val);
  if (isNaN(num)) return DEFAULT_FONT_SIZE;
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(num)));
}

export function applyTypographyScale(fontSize: number): void {
  const clamped = clampFontSize(fontSize);
  const scale = clamped / DEFAULT_FONT_SIZE;
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--olearn-font-scale', scale.toString());
    document.documentElement.style.setProperty('--olearn-base-font-size', `${clamped}px`);
    document.documentElement.style.fontSize = `${16 * scale}px`;
  }
}

const getDefaultProfile = (): AppProfile => ({
  name: 'User',
  language: 'en',
  completedTasks: [],
  firstLaunchCompleted: false,
  speechRate: 0.9,
  isMuted: false,
  fontSize: DEFAULT_FONT_SIZE
});

export const StorageService = {
  getProfile(): AppProfile {
    try {
      let data = safeGetItem(STORAGE_KEY);

      // Check legacy migration if current versioned key doesn't exist
      if (!data) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const legacyData = safeGetItem(legacyKey);
          if (legacyData) {
            data = legacyData;
            // Migrate to new key and cleanup legacy
            safeSetItem(STORAGE_KEY, legacyData);
            safeRemoveItem(legacyKey);
            break;
          }
        }
      }

      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...getDefaultProfile(),
          ...parsed,
          completedTasks: Array.isArray(parsed.completedTasks) ? [...parsed.completedTasks] : [],
          speechRate: typeof parsed.speechRate === 'number' && parsed.speechRate > 0 ? parsed.speechRate : 0.9,
          isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : false,
          fontSize: clampFontSize(parsed.fontSize)
        };
      }
    } catch (e) {
      console.warn('Failed to parse profile from storage, recovering with default:', e);
    }
    return getDefaultProfile();
  },

  saveProfile(profile: AppProfile): void {
    try {
      safeSetItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to storage:', e);
    }
  },

  setLanguage(lang: SupportedLanguage): void {
    const profile = this.getProfile();
    profile.language = lang;
    profile.firstLaunchCompleted = true;
    this.saveProfile(profile);
    this.applyTypographyScale(profile.fontSize ?? DEFAULT_FONT_SIZE);
  },

  getFontSize(): number {
    const profile = this.getProfile();
    return clampFontSize(profile.fontSize);
  },

  setFontSize(size: number): void {
    const clamped = clampFontSize(size);
    const profile = this.getProfile();
    profile.fontSize = clamped;
    this.saveProfile(profile);
    this.applyTypographyScale(clamped);
  },

  applyTypographyScale(fontSize: number): void {
    applyTypographyScale(fontSize);
  },

  getSpeechRate(): number {
    const profile = this.getProfile();
    return profile.speechRate ?? 0.9;
  },

  setSpeechRate(rate: number): void {
    const profile = this.getProfile();
    profile.speechRate = rate;
    this.saveProfile(profile);
  },

  getIsMuted(): boolean {
    const profile = this.getProfile();
    return profile.isMuted ?? false;
  },

  setIsMuted(muted: boolean): void {
    const profile = this.getProfile();
    profile.isMuted = muted;
    this.saveProfile(profile);
  },

  markTaskCompleted(taskId: string): void {
    const profile = this.getProfile();
    if (!profile.completedTasks.includes(taskId)) {
      profile.completedTasks.push(taskId);
      this.saveProfile(profile);
    }
  },

  resetProgress(): void {
    const profile = this.getProfile();
    profile.completedTasks = [];
    this.saveProfile(profile);
  },

  setApiKey(key: string): void {
    const profile = this.getProfile();
    profile.apiKey = key.trim();
    this.saveProfile(profile);
  }
};
