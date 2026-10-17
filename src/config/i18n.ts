import { SupportedLanguage } from '../types/task';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  chooseLanguage: string;
  selectLanguageTitle: string;
  selectLanguageSubtitle: string;
  continueBtn: string;
  home: string;
  settings: string;
  askMe: string;
  askMeSubtitle: string;
  listening: string;
  tapAndSpeak: string;
  typePlaceholder: string;
  send: string;
  cancel: string;
  clarifyTitle: string;
  practiceAgain: string;
  backToMenu: string;
  taskCompleted: string;
  taskCompletedSubtitle: string;
  gentleNudge: string;
  whatsAppTitle: string;
  gpayTitle: string;
  tasksAvailable: string;
  completedBadge: string;
  startPractice: string;
  stepOf: string;
  back: string;
  exitTutorial: string;
  replayAudio: string;
  playAudio: string;
  pauseAudio: string;
  resumeAudio: string;
  audioPaused: string;
  muteAudio: string;
  unmuteAudio: string;
  exitConfirmTitle: string;
  exitConfirmDesc: string;
  soundPlaying: string;
  deviceFrame: string;
  fullscreen: string;
  offlineNotice: string;
  apiKeyLabel: string;
  save: string;
  resetProgress: string;
  soundSpeed: string;
  normalSpeed: string;
  slowSpeed: string;
  exampleQuestions: string;
  examplePhoto: string;
  exampleBalance: string;
  exampleQR: string;
  micErrorNotice: string;
  unsupportedTitle: string;
  findingMatch: string;
  fontSizeTitle: string;
  fontSizeDescription: string;
  sampleText: string;
  resetDefaultSize: string;
  smallerText: string;
  largerText: string;
  textSizeCurrent: string;
  languages: {
    en: string;
    hi: string;
    ml: string;
  };
}

export const I18N: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'OLearn',
    tagline: 'Step-by-step smartphone trainer for seniors',
    chooseLanguage: 'Select Language',
    selectLanguageTitle: 'Choose Your Language',
    selectLanguageSubtitle: 'All tutorials and voice instructions will play in this language.',
    continueBtn: 'Continue',
    home: 'Home',
    settings: 'Settings',
    askMe: 'Ask Me',
    askMeSubtitle: 'Tell me what you want to learn in WhatsApp or Google Pay',
    listening: 'Listening...',
    tapAndSpeak: 'Tap and speak',
    typePlaceholder: 'Or type what you want to learn...',
    send: 'Ask',
    cancel: 'Cancel',
    clarifyTitle: 'Which of these would you like to do?',
    practiceAgain: 'Practice Again',
    backToMenu: 'Back to Menu',
    taskCompleted: 'Well Done! Task Completed!',
    taskCompletedSubtitle: 'You did it! Repeat to build your confidence or return to menu.',
    gentleNudge: 'Try tapping the highlighted button with the yellow border.',
    whatsAppTitle: 'WhatsApp',
    gpayTitle: 'Google Pay',
    tasksAvailable: 'tutorials available',
    completedBadge: 'Completed',
    startPractice: 'Start Tutorial',
    stepOf: 'Step',
    back: 'Back',
    exitTutorial: 'Exit',
    replayAudio: 'Repeat Voice',
    playAudio: 'Play Voice',
    pauseAudio: 'Pause Voice',
    resumeAudio: 'Resume Voice',
    audioPaused: 'Voice paused',
    muteAudio: 'Mute',
    unmuteAudio: 'Unmute',
    exitConfirmTitle: 'Exit Tutorial?',
    exitConfirmDesc: 'Your current step progress will not be saved.',
    soundPlaying: 'Playing instruction...',
    deviceFrame: 'Mobile View',
    fullscreen: 'Fullscreen',
    offlineNotice: 'Offline Mode: Voice narration & mock apps work without internet',
    apiKeyLabel: 'OpenAI API Key (Optional for Whisper/LLM)',
    save: 'Save',
    resetProgress: 'Reset Progress',
    soundSpeed: 'Narration Speed',
    normalSpeed: 'Normal',
    slowSpeed: 'Slow & Clear',
    exampleQuestions: 'Try asking:',
    examplePhoto: 'Send a photo',
    exampleBalance: 'Check bank balance',
    exampleQR: 'Pay with QR code',
    micErrorNotice: 'Microphone unavailable or permission denied. Please type below.',
    unsupportedTitle: 'Task Not Supported',
    findingMatch: 'Finding matching tutorial...',
    fontSizeTitle: 'Text Size',
    fontSizeDescription: 'Adjust text size across the entire application for easier reading.',
    sampleText: 'This is how instructions and messages will look.',
    resetDefaultSize: 'Reset to Default (20sp)',
    smallerText: 'Smaller',
    largerText: 'Larger',
    textSizeCurrent: 'Current Text Size',
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      ml: 'മലയാളം'
    }
  },
  hi: {
    appName: 'ओ-लर्न',
    tagline: 'बुजुर्गों के लिए आसान स्मार्टफोन ट्रेनर',
    chooseLanguage: 'भाषा चुनें',
    selectLanguageTitle: 'अपनी भाषा चुनें',
    selectLanguageSubtitle: 'सभी ट्यूटोरियल और आवाज़ के निर्देश इस भाषा में सुनाए जाएंगे।',
    continueBtn: 'आगे बढ़ें',
    home: 'होम',
    settings: 'सेटिंग्स',
    askMe: 'मुझसे पूछें',
    askMeSubtitle: 'व्हाट्सएप या गूगल पे पर आप क्या सीखना चाहते हैं, बोलकर बताएं',
    listening: 'सुन रहा हूँ...',
    tapAndSpeak: 'बोलने के लिए दबाएं',
    typePlaceholder: 'या यहाँ टाइप करके पूछें...',
    send: 'पूछें',
    cancel: 'रद्द करें',
    clarifyTitle: 'आप इनमें से क्या करना चाहते हैं?',
    practiceAgain: 'फिर से अभ्यास करें',
    backToMenu: 'मेनू पर वापस जाएं',
    taskCompleted: 'बहुत बढ़िया! अभ्यास पूरा हुआ!',
    taskCompletedSubtitle: 'आपने इसे आसानी से सीख लिया! आत्मविश्वास बढ़ाने के लिए दोबारा करें।',
    gentleNudge: 'कृपया पीले बॉर्डर वाले हाइलाइट किए गए बटन को दबाएं।',
    whatsAppTitle: 'व्हाट्सएप',
    gpayTitle: 'गूगल पे',
    tasksAvailable: 'ट्यूटोरियल उपलब्ध',
    completedBadge: 'सफलतापूर्वक सीखा',
    startPractice: 'अभ्यास शुरू करें',
    stepOf: 'कदम',
    back: 'पीछे',
    exitTutorial: 'बाहर जाएं',
    replayAudio: 'आवाज़ दोबारा सुनें',
    playAudio: 'आवाज़ चलाएं',
    pauseAudio: 'आवाज़ रोकें',
    resumeAudio: 'आवाज़ जारी रखें',
    audioPaused: 'आवाज़ रोकी गई है',
    muteAudio: 'म्यूट',
    unmuteAudio: 'आवाज़ चालू करें',
    exitConfirmTitle: 'ट्यूटोरियल छोड़ें?',
    exitConfirmDesc: 'आपकी वर्तमान प्रगति सुरक्षित नहीं होगी।',
    soundPlaying: 'निर्देश सुनाया जा रहा है...',
    deviceFrame: 'फ़ोन व्यू',
    fullscreen: 'फुल स्क्रीन',
    offlineNotice: 'ऑफ़लाइन मोड: वॉइस और मॉक ऐप बिना इंटरनेट काम करते हैं',
    apiKeyLabel: 'ओपनएआई एपीआई कुंजी (व्हिस्पर के लिए वैकल्पिक)',
    save: 'सहेजें',
    resetProgress: 'प्रगति रीसेट करें',
    soundSpeed: 'बोलने की गति',
    normalSpeed: 'सामान्य',
    slowSpeed: 'धीमी और स्पष्ट',
    exampleQuestions: 'उदाहरण प्रश्न:',
    examplePhoto: 'फ़ोटो भेजें',
    exampleBalance: 'बैंक बैलेंस चेक करें',
    exampleQR: 'क्यूआर कोड से पैसे दें',
    micErrorNotice: 'माइक उपलब्ध नहीं है या अनुमति नहीं मिली। कृपया नीचे टाइप करें।',
    unsupportedTitle: 'सुविधा उपलब्ध नहीं है',
    findingMatch: 'ट्यूटोरियल खोज रहे हैं...',
    fontSizeTitle: 'अक्षरों का आकार',
    fontSizeDescription: 'आसानी से पढ़ने के लिए पूरे ऐप में अक्षरों का आकार बदलें।',
    sampleText: 'निर्देश और संदेश इस आकार में दिखाई देंगे।',
    resetDefaultSize: 'डिफ़ॉल्ट पर रीसेट करें (20sp)',
    smallerText: 'छोटा',
    largerText: 'बड़ा',
    textSizeCurrent: 'वर्तमान आकार',
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      ml: 'മലയാളം'
    }
  },
  ml: {
    appName: 'ഓ-ലേഷൻ',
    tagline: 'മുതിർന്നവർക്കായി സ്മാർട്ട്ഫോൺ പരിശീലനം',
    chooseLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    selectLanguageTitle: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കൂ',
    selectLanguageSubtitle: 'എല്ലാ ട്യൂട്ടോറിയലുകളും ശബ്ദ നിർദ്ദേശങ്ങളും ഈ ഭാഷയിൽ കേൾക്കാം.',
    continueBtn: 'തുടങ്ങുക',
    home: 'ഹോം',
    settings: 'സെറ്റിങ്സ്',
    askMe: 'ചോദിക്കൂ',
    askMeSubtitle: 'വാട്ട്‌സ്ആപ്പിലോ ഗൂഗിൾ പേയിലോ എന്ത് ചെയ്യാനാണ് പഠിക്കേണ്ടത് എന്ന് പറയൂ',
    listening: 'കേൾക്കുന്നു...',
    tapAndSpeak: 'സംസാരിക്കാൻ തൊടുക',
    typePlaceholder: 'അല്ലെങ്കിൽ ഇവിടെ ടൈപ്പ് ചെയ്യുക...',
    send: 'ചോദിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    clarifyTitle: 'ഇതിൽ ഏതാണ് താങ്കൾ ചെയ്യാൻ ആഗ്രഹിക്കുന്നത്?',
    practiceAgain: 'വീണ്ടും പരിശീലിക്കുക',
    backToMenu: 'മെനുവിലേക്ക് മടങ്ങുക',
    taskCompleted: 'വളരെ നന്ന്! പാഠം പൂർത്തിയായി!',
    taskCompletedSubtitle: 'നിങ്ങൾ ഇത് വിജയകരമായി പഠിച്ചു! ഉറപ്പുണ്ടാക്കാൻ വീണ്ടും ചെയ്യാം.',
    gentleNudge: 'മഞ്ഞ വരയുള്ള ഹൈലൈറ്റ് ചെയ്ത ബട്ടണിൽ തൊടുക.',
    whatsAppTitle: 'വാട്ട്സ്ആപ്പ്',
    gpayTitle: 'ഗൂഗിൾ പേ',
    tasksAvailable: 'പാഠങ്ങൾ ലഭ്യമാണ്',
    completedBadge: 'പഠിച്ചു കഴിഞ്ഞു',
    startPractice: 'പരിശീലനം തുടങ്ങുക',
    stepOf: 'ഘട്ടം',
    back: 'മടങ്ങുക',
    exitTutorial: 'പുറത്ത് കടക്കുക',
    replayAudio: 'ശബ്ദം വീണ്ടും കേൾക്കുക',
    playAudio: 'ശബ്ദം കേൾക്കുക',
    pauseAudio: 'ശബ്ദം നിർത്തുക',
    resumeAudio: 'ശബ്ദം തുടരുക',
    audioPaused: 'ശബ്ദം താൽക്കാലികമായി നിർത്തി',
    muteAudio: 'ശബ്ദം നിർത്തുക',
    unmuteAudio: 'ശബ്ദം കേൾക്കുക',
    exitConfirmTitle: 'പരിശീലനം നിർത്തണോ?',
    exitConfirmDesc: 'നിങ്ങൾ ചെയ്ത പുരോഗതി സേവ് ചെയ്യപ്പെടില്ല.',
    soundPlaying: 'നിർദ്ദേശം കേൾപ്പിക്കുന്നു...',
    deviceFrame: 'ഫോൺ കാഴ്ച',
    fullscreen: 'പൂർണ്ണ സ്ക്രീൻ',
    offlineNotice: 'ഓഫ്‌ലൈൻ: ഇന്റർനെറ്റ് ഇല്ലാതെ പ്രവർത്തിക്കുന്നു',
    apiKeyLabel: 'ഓപ്പൺഎഐ എപിഐ കീ (ഓപ്ഷണൽ)',
    save: 'സേവ് ചെയ്യുക',
    resetProgress: 'പുരോഗതി റീസെറ്റ് ചെയ്യുക',
    soundSpeed: 'ശബ്ദ വേഗത',
    normalSpeed: 'സാധാരണ',
    slowSpeed: 'പതുക്കെ & വ്യക്തമായി',
    exampleQuestions: 'ഉദാഹരണങ്ങൾ:',
    examplePhoto: 'ഫോട്ടോ അയക്കുക',
    exampleBalance: 'ബാങ്ക് ബാലൻസ് അറിയുക',
    exampleQR: 'ക്യുആർ കോഡ് സ്കാൻ',
    micErrorNotice: 'മൈക്രോഫോൺ ലഭ്യമല്ല അല്ലെങ്കിൽ അനുമതി നിരസിച്ചു. താഴെ ടൈപ്പ് ചെയ്യുക.',
    unsupportedTitle: 'സേവനം ലഭ്യമല്ല',
    findingMatch: 'പാഠം കണ്ടെത്തുന്നു...',
    fontSizeTitle: 'അക്ഷരങ്ങളുടെ വലിപ്പം',
    fontSizeDescription: 'സുഖമായി വായിക്കുന്നതിനായി ആപ്പിലെ അക്ഷരങ്ങളുടെ വലിപ്പം മാറ്റുക.',
    sampleText: 'നിർദ്ദേശങ്ങളും സന്ദേശങ്ങളും ഇങ്ങനെ കാണാം.',
    resetDefaultSize: 'സാധാരണ വലിപ്പത്തിലേക്ക് മാറ്റുക (20sp)',
    smallerText: 'ചെറുത്',
    largerText: 'വലുത്',
    textSizeCurrent: 'നിലവിലെ വലിപ്പം',
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      ml: 'മലയാളം'
    }
  }
};
