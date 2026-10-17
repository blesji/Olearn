import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TaskConfig, SupportedLanguage } from '../types/task';
import { TaskValidator, ValidationResult } from './TaskValidator';
import { AudioService } from '../services/AudioService';
import { StorageService } from '../services/StorageService';
import { I18N } from '../config/i18n';
import { WhatsAppReplica } from '../replicas/WhatsAppReplica';
import { GPayReplica } from '../replicas/GPayReplica';
import { Volume2, VolumeX, Play, Pause, Gauge, RotateCcw, ArrowLeft, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';

export type TaskLifecycleState =
  | 'ready'
  | 'presenting'
  | 'waiting_interaction'
  | 'transitioning'
  | 'completed'
  | 'error';

interface TaskEngineProps {
  task: TaskConfig;
  language: SupportedLanguage;
  onExit: () => void;
}

export const TaskEngine: React.FC<TaskEngineProps> = ({
  task,
  language,
  onExit
}) => {
  // Validate configuration before proceeding
  const [validation] = useState<ValidationResult>(() => TaskValidator.validateTask(task));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [lifecycleState, setLifecycleState] = useState<TaskLifecycleState>(() => {
    return validation.valid ? 'ready' : 'error';
  });
  const [showNudge, setShowNudge] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => AudioService.isAudioMuted());
  const [speechRate, setSpeechRate] = useState<number>(() => StorageService.getSpeechRate());
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // References for unmount cleanup and transition lockout
  const isTransitioningRef = useRef<boolean>(false);
  const nudgeTimerRef = useRef<any>(null);
  const transitionTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  const t = I18N[language] || I18N.en;
  const currentStep = task?.steps?.[currentStepIndex];
  const totalSteps = task?.steps?.length || 0;

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      AudioService.stopAudio();
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Step presentation and audio narration lifecycle
  useEffect(() => {
    if (!validation.valid) {
      setLifecycleState('error');
      return;
    }

    if (lifecycleState === 'completed') {
      AudioService.playCelebrationSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      StorageService.markTaskCompleted(task.task_id);
      return;
    }

    if (currentStep) {
      setLifecycleState('presenting');
      setIsAudioPlaying(true);
      setIsAudioPaused(false);

      const audioField = `audio_${language}` as keyof typeof currentStep;
      const audioPath = (currentStep[audioField] as string) || currentStep.audio_en;
      const hintText = currentStep.hint_text[language] || currentStep.hint_text.en;

      AudioService.playNarration(audioPath, language, hintText, () => {
        if (isMountedRef.current) {
          setIsAudioPlaying(false);
          setIsAudioPaused(false);
          setLifecycleState(prev => (prev === 'presenting' ? 'waiting_interaction' : prev));
        }
      });
    }

    return () => {
      AudioService.stopAudio();
    };
  }, [currentStepIndex, lifecycleState === 'completed', lifecycleState === 'ready', language, task, validation.valid]);

  // Handle correct tap on the highlighted element with transition lock to prevent double advancement
  const handleCorrectTap = () => {
    if (isTransitioningRef.current || lifecycleState === 'completed' || lifecycleState === 'error') {
      return; // Ignore rapid repeated taps or clicks while advancing
    }

    isTransitioningRef.current = true;
    setLifecycleState('transitioning');
    setShowNudge(false);
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);

    AudioService.playCorrectSound();

    const isLastStep = currentStepIndex + 1 >= totalSteps;
    const transitionDelay = isLastStep ? 650 : 350;

    transitionTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      if (currentStepIndex + 1 < totalSteps) {
        setCurrentStepIndex(prev => prev + 1);
        isTransitioningRef.current = false;
      } else {
        setLifecycleState('completed');
        isTransitioningRef.current = false;
      }
    }, transitionDelay);
  };

  // Handle tap on any inert / wrong element (Gentle non-penalizing guidance)
  const handleWrongTap = () => {
    if (isTransitioningRef.current || lifecycleState === 'completed' || lifecycleState === 'error') {
      return;
    }

    AudioService.playNudgeSound();
    setShowNudge(true);

    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShowNudge(false);
      }
    }, 3000);
  };

  const handleReplayAudio = () => {
    if (currentStep && !isTransitioningRef.current) {
      const audioField = `audio_${language}` as keyof typeof currentStep;
      const audioPath = (currentStep[audioField] as string) || currentStep.audio_en;
      const hintText = currentStep.hint_text[language] || currentStep.hint_text.en;

      setIsAudioPlaying(true);
      setIsAudioPaused(false);
      AudioService.playNarration(audioPath, language, hintText, () => {
        if (isMountedRef.current) {
          setIsAudioPlaying(false);
          setIsAudioPaused(false);
        }
      });
    }
  };

  const handleTogglePlayPause = () => {
    if (isAudioPaused) {
      AudioService.resumeNarration();
      setIsAudioPaused(false);
      setIsAudioPlaying(true);
    } else if (isAudioPlaying) {
      AudioService.pauseNarration();
      setIsAudioPaused(true);
      setIsAudioPlaying(false);
    } else {
      handleReplayAudio();
    }
  };

  const handleToggleSpeed = () => {
    const nextRate = speechRate <= 0.85 ? 1.0 : 0.8;
    setSpeechRate(nextRate);
    AudioService.setSpeechRate(nextRate);
  };

  const handleToggleMute = () => {
    const nextMuted = AudioService.toggleMute();
    setIsMuted(nextMuted);
  };

  const handlePracticeAgain = () => {
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    isTransitioningRef.current = false;
    setShowNudge(false);
    setCurrentStepIndex(0);
    setLifecycleState('ready');
  };

  const handleAttemptExit = () => {
    if (currentStepIndex > 0 && lifecycleState !== 'completed') {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  // 1. CONFIGURATION ERROR STATE
  if (!validation.valid || lifecycleState === 'error') {
    return (
      <div className="h-full w-full bg-rose-50 flex flex-col justify-between p-6 select-none animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center border-4 border-rose-500 shadow-md">
            <AlertTriangle className="w-12 h-12 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-rose-950">
            Task Configuration Error
          </h2>
          <p className="text-lg text-rose-800 font-semibold max-w-sm">
            This tutorial cannot be loaded due to invalid configuration parameters:
          </p>
          <div className="bg-white border-2 border-rose-300 rounded-2xl p-4 w-full text-left space-y-2 max-h-60 overflow-y-auto text-sm text-rose-900 font-mono">
            {validation.errors.map((err, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="font-bold text-rose-600">•</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onExit}
          className="w-full min-h-[64px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xl rounded-2xl shadow-xl flex items-center justify-center space-x-3"
        >
          <ArrowLeft className="w-7 h-7" />
          <span>{t.backToMenu}</span>
        </button>
      </div>
    );
  }

  // 2. TASK COMPLETED STATE
  if (lifecycleState === 'completed') {
    return (
      <div className="h-full w-full bg-slate-50 flex flex-col justify-between p-6 select-none animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-md">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              {t.taskCompleted}
            </h2>
            <p className="text-xl text-gray-700 font-medium max-w-sm mx-auto">
              {t.taskCompletedSubtitle}
            </p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 w-full text-left flex items-start space-x-3">
            <Sparkles className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-1" />
            <div>
              <div className="text-2xl font-bold text-emerald-900">
                {task.title[language] || task.title.en}
              </div>
              <div className="text-lg text-emerald-800 font-semibold">
                {task.app === 'whatsapp' ? t.whatsAppTitle : t.gpayTitle}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Min 64dp height for elderly touch targets */}
        <div className="space-y-4 pt-4">
          <button
            onClick={handlePracticeAgain}
            className="w-full min-h-[64px] bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xl rounded-2xl shadow-lg border-2 border-amber-600 flex items-center justify-center space-x-3 transition-colors"
          >
            <RotateCcw className="w-7 h-7" />
            <span>{t.practiceAgain}</span>
          </button>

          <button
            onClick={onExit}
            className="w-full min-h-[64px] bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xl rounded-2xl shadow-md flex items-center justify-center space-x-3 transition-colors"
          >
            <ArrowLeft className="w-7 h-7" />
            <span>{t.backToMenu}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE TUTORIAL STEP STATE
  return (
    <div
      className="h-full w-full flex flex-col justify-between bg-white relative overflow-hidden select-none"
      onClick={handleWrongTap}
    >
      {/* Region B: OLearn Tutorial Toolbar */}
      <div className="bg-slate-900 text-white px-2.5 py-2 flex items-center justify-between shadow-md z-30 shrink-0 gap-1.5 border-b border-slate-800 min-h-[50px] w-full">
        {/* Back navigation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAttemptExit();
          }}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm px-2.5 py-1.5 rounded-xl border border-slate-700 active:bg-slate-600 shrink-0 min-h-[40px]"
          aria-label={t.exitTutorial}
          title={t.exitTutorial}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline text-xs sm:text-sm font-bold">{t.exitTutorial}</span>
        </button>

        {/* Current task title and step counter */}
        <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate max-w-[130px] xs:max-w-[170px] sm:max-w-[220px] leading-tight text-center">
            {task.title[language] || task.title.en}
          </div>
          <div className="text-xs sm:text-sm font-black text-amber-300 leading-tight tracking-wide">
            {t.stepOf} {currentStepIndex + 1} / {totalSteps}
          </div>
        </div>

        {/* Audio Accessibility Action Group: Mute & Playback Speed */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMute();
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors shrink-0 ${
              isMuted
                ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border-rose-700'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
            }`}
            title={isMuted ? t.unmuteAudio : t.muteAudio}
            aria-label={isMuted ? t.unmuteAudio : t.muteAudio}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSpeed();
            }}
            className="flex items-center gap-1 h-9 sm:h-10 px-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:bg-slate-600 shrink-0"
            title={`${t.soundSpeed}: ${speechRate <= 0.85 ? t.slowSpeed : t.normalSpeed}`}
            aria-label={t.soundSpeed}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{speechRate <= 0.85 ? '0.8x' : '1.0x'}</span>
          </button>
        </div>
      </div>

      {/* Screen Replica Container: fills remaining height, scrollable when necessary */}
      <div className="flex-1 relative overflow-y-auto min-h-0 bg-gray-100 flex flex-col custom-scrollbar">
        {task.app === 'whatsapp' ? (
          <WhatsAppReplica
            screen={currentStep.screen}
            highlightElement={currentStep.highlight_element}
            language={language}
            onCorrectTap={handleCorrectTap}
            onWrongTap={handleWrongTap}
            taskId={task.task_id}
            stepIndex={currentStepIndex}
          />
        ) : (
          <GPayReplica
            screen={currentStep.screen}
            highlightElement={currentStep.highlight_element}
            language={language}
            onCorrectTap={handleCorrectTap}
            onWrongTap={handleWrongTap}
            taskId={task.task_id}
            stepIndex={currentStepIndex}
          />
        )}
      </div>

      {/* Gentle Nudge Toast (Never penalty or dead-end) */}
      {showNudge && (
        <div className="absolute top-16 left-3 right-3 z-50 bg-amber-100 border-2 border-amber-500 text-amber-950 p-3.5 rounded-2xl shadow-2xl flex items-center space-x-2.5 shake-nudge animate-fade-in">
          <div className="w-8 h-8 bg-amber-500 text-black rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">
            !
          </div>
          <div className="text-base sm:text-lg font-bold leading-snug">
            {t.gentleNudge}
          </div>
        </div>
      )}

      {/* Exit In-Progress Confirmation Modal */}
      {showExitConfirm && (
        <div
          className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-center border-2 border-slate-700">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-800">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t.exitConfirmTitle}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                {t.exitConfirmDesc}
              </p>
            </div>
            <div className="flex space-x-2.5 pt-1">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 text-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-2xl min-h-[48px]"
              >
                {t.cancel}
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-lg min-h-[48px] shadow-md"
              >
                {t.exitTutorial}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Region F: Tutorial Instruction Area (Compact, Non-overlapping, Senior-Readable) */}
      <div className="bg-amber-100 border-t-3 border-amber-400 p-2.5 sm:p-3 shadow-xl z-20 shrink-0 flex flex-col gap-1.5 max-h-[35vh]">
        <div className="flex items-center justify-between gap-1">
          {/* Step indicator & Audio Status */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="bg-amber-400 text-slate-950 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {currentStepIndex + 1}
            </span>
            {isMuted ? (
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide truncate">
                {t.muteAudio}
              </span>
            ) : isAudioPlaying ? (
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                <span className="truncate">{t.soundPlaying}</span>
              </span>
            ) : isAudioPaused ? (
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                <span className="truncate">{t.audioPaused}</span>
              </span>
            ) : null}
          </div>

          {/* Action Controls: Play/Pause, Replay Narration, Repeat/Restart Task */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlayPause();
              }}
              className="px-2 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 border border-amber-300 transition-colors"
              aria-label={isAudioPlaying ? t.pauseAudio : isAudioPaused ? t.resumeAudio : t.playAudio}
              title={isAudioPlaying ? t.pauseAudio : isAudioPaused ? t.resumeAudio : t.playAudio}
            >
              {isAudioPlaying ? <Pause className="w-3.5 h-3.5 text-slate-900" /> : <Play className="w-3.5 h-3.5 text-slate-900" />}
              <span className="hidden xs:inline">{isAudioPlaying ? t.pauseAudio : isAudioPaused ? t.resumeAudio : t.playAudio}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReplayAudio();
              }}
              className="px-2 py-1 rounded-lg bg-amber-300 hover:bg-amber-400 active:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 border border-amber-500 transition-colors"
              aria-label={t.replayAudio}
              title={t.replayAudio}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-900" />
              <span>{t.replayAudio}</span>
            </button>

            {/* Restart task from step 1 control */}
            {currentStepIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePracticeAgain();
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 active:bg-black text-amber-300 font-bold text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                aria-label={t.practiceAgain}
                title={t.practiceAgain}
              >
                <RotateCcw className="w-3 h-3 text-amber-300" />
                <span className="hidden xs:inline">{language === 'ml' ? 'ആദ്യം' : language === 'hi' ? 'शुरू' : 'Restart'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Instruction: Independent, clear, readable without clipping */}
        <div className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed overflow-y-auto max-h-[22vh] custom-scrollbar">
          {currentStep.hint_text[language] || currentStep.hint_text.en}
        </div>
      </div>
    </div>
  );
};
