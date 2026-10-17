import React, { useState } from 'react';
import { SupportedLanguage } from '../types/task';
import { I18N } from '../config/i18n';
import { StorageService } from '../services/StorageService';
import { AudioService } from '../services/AudioService';
import { ArrowLeft, Globe, Volume2, VolumeX, Key, RotateCcw, Check, Type, Minus, Plus } from 'lucide-react';

interface SettingsScreenProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onLanguageChange,
  onClose
}) => {
  const profile = StorageService.getProfile();
  const [apiKeyInput, setApiKeyInput] = useState<string>(profile.apiKey || '');
  const [speed, setSpeed] = useState<number>(AudioService.getSpeechRate());
  const [isMuted, setIsMuted] = useState<boolean>(() => AudioService.isAudioMuted());
  const [fontSize, setFontSize] = useState<number>(() => StorageService.getFontSize());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const t = I18N[language] || I18N.en;

  const handleFontSizeChange = (newSize: number) => {
    const clamped = Math.min(30, Math.max(16, Math.round(newSize)));
    setFontSize(clamped);
    StorageService.setFontSize(clamped);
  };

  const handleResetFontSize = () => {
    handleFontSizeChange(20);
  };

  const languages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ml', label: 'മലയാളം' }
  ];

  const handleSaveApiKey = () => {
    StorageService.setApiKey(apiKeyInput);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    AudioService.setSpeechRate(newSpeed);
  };

  const handleToggleMute = () => {
    const nextMuted = AudioService.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleReset = () => {
    const confirmPrompt =
      language === 'hi'
        ? 'क्या आप सभी पूर्ण किए गए ट्यूटोरियल की प्रगति रीसेट करना चाहते हैं?'
        : language === 'ml'
        ? 'പൂർത്തിയാക്കിയ എല്ലാ ട്യൂട്ടോറിയൽ പുരോഗതിയും റീസെറ്റ് ചെയ്യണോ?'
        : 'Reset all completed tutorial progress?';

    if (window.confirm(confirmPrompt)) {
      StorageService.resetProgress();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col justify-between p-5 select-none animate-fade-in overflow-y-auto">
      {/* Header */}
      <div className="pb-4 border-b-2 border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-200 hover:bg-gray-300 rounded-2xl text-gray-900"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <h1 className="text-3xl font-black text-gray-900">
            {t.settings}
          </h1>
        </div>
      </div>

      <div className="space-y-6 my-4">
        {/* Language Selection Tiles */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center space-x-3 text-xl font-bold text-gray-900">
            <Globe className="w-7 h-7 text-[#1A73E8]" />
            <span>{t.chooseLanguage}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`py-3 px-2 rounded-2xl font-bold text-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-amber-400 border-amber-600 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Font Size Accessibility Slider */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xl font-bold text-gray-900">
              <Type className="w-7 h-7 text-indigo-600 flex-shrink-0" />
              <span>{t.fontSizeTitle}</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1 rounded-xl font-black text-lg">
              {fontSize} sp
            </div>
          </div>

          <p className="text-base text-gray-600 font-semibold leading-relaxed">
            {t.fontSizeDescription}
          </p>

          {/* Slider with - and + accessibility buttons */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center space-x-3">
              {/* Decrement button */}
              <button
                type="button"
                onClick={() => handleFontSizeChange(fontSize - 1)}
                disabled={fontSize <= 16}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all border-2 ${
                  fontSize <= 16
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300 active:scale-95'
                }`}
                aria-label={t.smallerText}
                title={t.smallerText}
              >
                <Minus className="w-6 h-6 stroke-[3]" />
              </button>

              {/* Range Slider */}
              <div className="flex-1 px-1">
                <input
                  type="range"
                  min={16}
                  max={30}
                  step={1}
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                  aria-label={t.textSizeCurrent}
                  aria-valuemin={16}
                  aria-valuemax={30}
                  aria-valuenow={fontSize}
                />
                <div className="flex justify-between text-xs font-bold text-gray-500 pt-1 px-1">
                  <span>16 sp ({t.smallerText})</span>
                  <span className="font-extrabold text-indigo-700">20 sp</span>
                  <span>30 sp ({t.largerText})</span>
                </div>
              </div>

              {/* Increment button */}
              <button
                type="button"
                onClick={() => handleFontSizeChange(fontSize + 1)}
                disabled={fontSize >= 30}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all border-2 ${
                  fontSize >= 30
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300 active:scale-95'
                }`}
                aria-label={t.largerText}
                title={t.largerText}
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Live Sample Text Preview Box */}
            <div className="bg-slate-50 border-2 border-indigo-100 rounded-2xl p-4 transition-all">
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'नमूना पूर्वावलोकन' : language === 'ml' ? 'മാതൃകാ കാഴ്ച്ച' : 'Sample Preview'}
              </div>
              <p
                className="font-bold text-gray-900 leading-snug transition-all"
                style={{ fontSize: `${fontSize}px` }}
              >
                {t.sampleText}
              </p>
            </div>

            {/* Reset to Default Button */}
            {fontSize !== 20 && (
              <button
                type="button"
                onClick={handleResetFontSize}
                className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-base rounded-xl border border-gray-300 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-gray-700" />
                <span>{t.resetDefaultSize}</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Narration Speed & Sound */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xl font-bold text-gray-900">
              <Volume2 className="w-7 h-7 text-emerald-600" />
              <span>{t.soundSpeed}</span>
            </div>

            {/* Mute/Unmute Toggle Button */}
            <button
              onClick={handleToggleMute}
              className={`py-2 px-3 rounded-xl font-bold text-base border-2 flex items-center space-x-1.5 transition-colors ${
                isMuted
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
              aria-label={isMuted ? t.unmuteAudio : t.muteAudio}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-700" /> : <Volume2 className="w-5 h-5 text-emerald-700" />}
              <span>{isMuted ? t.unmuteAudio : t.muteAudio}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSpeedChange(0.85)}
              className={`py-3 px-4 rounded-2xl font-bold text-xl border-2 ${
                speed < 0.95
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              {t.slowSpeed}
            </button>
            <button
              onClick={() => handleSpeedChange(1.0)}
              className={`py-3 px-4 rounded-2xl font-bold text-xl border-2 ${
                speed >= 0.95
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              {t.normalSpeed}
            </button>
          </div>
        </div>

        {/* Optional OpenAI API Key */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 space-y-3">
          <div className="flex items-center space-x-3 text-xl font-bold text-gray-900">
            <Key className="w-7 h-7 text-purple-600" />
            <span>OpenAI API Key</span>
          </div>
          <p className="text-base text-gray-600 font-semibold">
            {t.apiKeyLabel}
          </p>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-..."
            className="w-full p-3 text-lg border-2 border-gray-300 rounded-xl font-mono focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl flex items-center justify-center space-x-2"
          >
            {savedNotice ? <Check className="w-5 h-5" /> : null}
            <span>{savedNotice ? 'Saved!' : t.save}</span>
          </button>
        </div>

        {/* Reset Progress */}
        <div className="pt-2">
          <button
            onClick={handleReset}
            className="w-full min-h-[58px] bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 font-bold text-xl rounded-2xl flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-6 h-6" />
            <span>{t.resetProgress}</span>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <div className="pt-4">
        <button
          onClick={onClose}
          className="w-full min-h-[64px] bg-slate-900 hover:bg-slate-800 text-white text-2xl font-bold rounded-2xl shadow-xl flex items-center justify-center"
        >
          {t.continueBtn}
        </button>
      </div>
    </div>
  );
};
