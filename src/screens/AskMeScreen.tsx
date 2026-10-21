import React, { useState, useEffect } from 'react';
import { SupportedLanguage, TaskConfig } from '../types/task';
import { I18N } from '../config/i18n';
import { STTService } from '../services/STTService';
import { TaskRouterService, RouteResult } from '../services/TaskRouterService';
import { AudioService } from '../services/AudioService';
import { Mic, X, Send, HelpCircle, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface AskMeScreenProps {
  language: SupportedLanguage;
  apiKey?: string;
  tasks: TaskConfig[];
  onSelectTask: (task: TaskConfig) => void;
  onClose: () => void;
}

export const AskMeScreen: React.FC<AskMeScreenProps> = ({
  language,
  apiKey,
  tasks,
  onSelectTask,
  onClose
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [clarifyData, setClarifyData] = useState<RouteResult['clarifyQuestion'] | null>(null);
  const [unsupportedNotice, setUnsupportedNotice] = useState<string | null>(null);
  const [sttErrorMessage, setSttErrorMessage] = useState<string | null>(null);

  const t = I18N[language] || I18N.en;
  const [stt] = useState(() => new STTService());

  useEffect(() => {
    return () => {
      stt.stopListening();
      AudioService.stopAudio();
    };
  }, [stt]);

  const handleToggleMic = () => {
    setSttErrorMessage(null);
    if (isListening) {
      stt.stopListening();
      setIsListening(false);
      if (transcript.trim()) {
        processQuery(transcript);
      }
    } else {
      setClarifyData(null);
      setUnsupportedNotice(null);
      setTranscript('');
      stt.startListening(
        language,
        {
          onTranscript: (text) => {
            setTranscript(text);
          },
          onError: (err) => {
            console.warn('STT Error:', err);
            setIsListening(false);
            setSttErrorMessage(t.micErrorNotice);
          },
          onListeningChange: (state) => {
            setIsListening(state);
          }
        },
        apiKey
      );
    }
  };

  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsRouting(true);
    setClarifyData(null);
    setUnsupportedNotice(null);
    setSttErrorMessage(null);

    const result = await TaskRouterService.routeQuery(queryText, language, apiKey);
    setIsRouting(false);

    // 1. Confident direct match
    if (result.matched && result.taskId) {
      const found = tasks.find(item => item.task_id === result.taskId);
      if (found) {
        onSelectTask(found);
        return;
      }
    }

    // 2. Unsupported / Out-of-scope intent
    if (result.isUnsupported) {
      const notice = result.unsupportedMessage || t.unsupportedTitle;
      setUnsupportedNotice(notice);
      if (result.clarifyQuestion) {
        setClarifyData(result.clarifyQuestion);
      }
      AudioService.playDynamicTTS(notice, language);
      return;
    }

    // 3. Ambiguous intent with clarification options
    if (result.clarifyQuestion) {
      setClarifyData(result.clarifyQuestion);
      AudioService.playDynamicTTS(result.clarifyQuestion.text, language);
    }
  };

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim()) {
      processQuery(typedInput);
      setTypedInput('');
    }
  };

  const handleChipClick = (exampleQuery: string) => {
    setTypedInput(exampleQuery);
    processQuery(exampleQuery);
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col justify-between p-6 select-none animate-fade-in relative overflow-y-auto">
      {/* Top Bar with Cancel / X */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="text-2xl font-black text-amber-400">{t.askMe}</div>
        <button
          onClick={() => {
            stt.stopListening();
            AudioService.stopAudio();
            onClose();
          }}
          className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center text-white border-2 border-slate-600 active:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-amber-400"
          title={t.cancel}
          aria-label={t.cancel}
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Main Interaction Zone */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-4 space-y-5 text-center">
        <p className="text-2xl font-bold text-slate-200 max-w-sm leading-snug">
          {t.askMeSubtitle}
        </p>

        {/* Large Centered Mic Button */}
        <div className="relative flex items-center justify-center py-2">
          {isListening && (
            <div className="absolute w-44 h-44 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
          )}
          <button
            onClick={handleToggleMic}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-400 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 border-white ring-8 ring-rose-500/40'
                : 'bg-amber-500 hover:bg-amber-400 border-amber-300 ring-8 ring-amber-400/30'
            }`}
            aria-label={isListening ? t.listening : t.tapAndSpeak}
          >
            <Mic className={`w-16 h-16 ${isListening ? 'text-white' : 'text-slate-950'}`} />
          </button>
        </div>

        {/* Persistent Large Text Label Beneath Mic Button */}
        <div className="space-y-2">
          <div className="text-2xl font-extrabold text-amber-300">
            {isListening ? t.listening : t.tapAndSpeak}
          </div>
          {transcript && (
            <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-2xl text-xl text-emerald-300 font-semibold max-w-xs mx-auto">
              "{transcript}"
            </div>
          )}
        </div>

        {/* STT Error Notice */}
        {sttErrorMessage && (
          <div className="w-full max-w-md bg-amber-950/80 border-2 border-amber-500/80 rounded-2xl p-4 text-left flex items-start space-x-3 text-amber-200 shadow-lg">
            <AlertCircle className="w-7 h-7 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-lg font-medium leading-relaxed">{sttErrorMessage}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {isRouting && (
          <div className="flex items-center space-x-2 text-amber-400 text-xl font-bold">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>{t.findingMatch}</span>
          </div>
        )}

        {/* Unsupported Notice Banner */}
        {unsupportedNotice && (
          <div className="w-full max-w-md bg-rose-950/70 border-2 border-rose-500/80 rounded-2xl p-4 text-left flex items-start space-x-3 text-rose-200 shadow-xl animate-fade-in">
            <AlertCircle className="w-7 h-7 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-lg text-rose-300">{t.unsupportedTitle}</div>
              <p className="text-base font-medium leading-relaxed mt-1 text-slate-200">
                {unsupportedNotice}
              </p>
            </div>
          </div>
        )}

        {/* Clarifying Question Modal or Suggested Tutorials */}
        {clarifyData && (
          <div className="w-full max-w-md bg-slate-800 border-2 border-amber-400 rounded-3xl p-5 text-left space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-7 h-7 text-amber-400 flex-shrink-0 mt-1" />
              <div className="text-xl font-bold text-white leading-snug">
                {clarifyData.text}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {clarifyData.options.map((opt) => (
                <button
                  key={opt.taskId}
                  onClick={() => {
                    const found = tasks.find(item => item.task_id === opt.taskId);
                    if (found) onSelectTask(found);
                  }}
                  className="w-full min-h-[58px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xl rounded-2xl px-4 py-3 text-left flex items-center justify-between shadow-md active:scale-98 transition-all focus:outline-none focus:ring-4 focus:ring-amber-300"
                >
                  <span className="flex-1 pr-2">{opt.label}</span>
                  <span className="text-2xl font-black">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Example Suggestion Chips (Empowering Older Learners) */}
        {!clarifyData && !unsupportedNotice && (
          <div className="w-full max-w-md space-y-2 pt-1">
            <div className="flex items-center justify-center space-x-1.5 text-slate-400 text-sm font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.exampleQuestions}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleChipClick(t.examplePhoto)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-base text-slate-200 font-medium active:scale-95 transition-all"
              >
                "{t.examplePhoto}"
              </button>
              <button
                type="button"
                onClick={() => handleChipClick(t.exampleBalance)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-base text-slate-200 font-medium active:scale-95 transition-all"
              >
                "{t.exampleBalance}"
              </button>
              <button
                type="button"
                onClick={() => handleChipClick(t.exampleQR)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full px-4 py-2 text-base text-slate-200 font-medium active:scale-95 transition-all"
              >
                "{t.exampleQR}"
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Typed Input Fallback */}
      <form onSubmit={handleTypedSubmit} className="pt-2">
        <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-2xl border-2 border-slate-700 focus-within:border-amber-400">
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={t.typePlaceholder}
            className="flex-1 bg-transparent text-white px-3 py-2 text-xl font-medium focus:outline-none placeholder-slate-400 min-h-[48px]"
          />
          <button
            type="submit"
            className="w-14 h-14 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-xl flex items-center justify-center text-slate-950 flex-shrink-0 font-bold shadow-md focus:outline-none focus:ring-4 focus:ring-amber-300"
            aria-label={t.send}
          >
            <Send className="w-7 h-7" />
          </button>
        </div>
      </form>
    </div>
  );
};
