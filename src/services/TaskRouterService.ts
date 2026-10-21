import tasksData from '../config/tasks.json';
import { SupportedLanguage, TaskConfig } from '../types/task';

export interface RouteOption {
  taskId: string;
  label: string;
}

export interface RouteResult {
  matched: boolean;
  taskId?: string;
  isUnsupported?: boolean;
  unsupportedMessage?: string;
  clarifyQuestion?: {
    text: string;
    options: RouteOption[];
  };
}

const TASKS = tasksData as TaskConfig[];
const VALID_TASK_IDS = new Set(TASKS.map(t => t.task_id));

/**
 * Normalizes text for offline natural-language matching:
 * - Trims and converts to lowercase
 * - Strips common punctuation and quotation marks
 * - Collapses multiple whitespaces
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=_`~()?"'।॥!?;:\-\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const TaskRouterService = {
  /**
   * Routes user input (spoken or typed) to one of the 9 core tasks.
   * Primary: Deterministic, offline multilingual local semantic matcher (zero network dependency).
   * Optional: Queries OpenAI GPT API if an API key is provided and online.
   */
  async routeQuery(query: string, language: SupportedLanguage, apiKey?: string): Promise<RouteResult> {
    const normalized = normalizeQuery(query);
    if (!normalized) {
      return { matched: false };
    }

    if (apiKey && typeof navigator !== 'undefined' && navigator.onLine !== false) {
      try {
        const llmResult = await this.callLLMClassifier(query, language, apiKey);
        if (llmResult) return llmResult;
      } catch (err) {
        console.warn('LLM Router failed or offline, falling back to local semantic matcher:', err);
      }
    }

    return this.localSemanticMatch(normalized, language);
  },

  /**
   * Deterministic, zero-network offline intent matcher for English, Hindi, and Malayalam.
   * Handles:
   * 1. Explicit unsupported / out-of-scope requests (e.g. food delivery, train booking, weather)
   * 2. Ambiguity resolution (e.g. "call", "pay", "send", "whatsapp", "gpay")
   * 3. Confident matches for all 9 tasks with common phonetic variations and synonyms
   */
  localSemanticMatch(query: string, language: SupportedLanguage): RouteResult {
    const q = ' ' + normalizeQuery(query) + ' ';

    // Helper: checks if any pattern occurs in query with word boundary awareness
    const hasAny = (keywords: string[]): boolean => {
      return keywords.some(kw => {
        const normalizedKw = normalizeQuery(kw);
        return q.includes(' ' + normalizedKw + ' ') || q.includes(normalizedKw);
      });
    };

    // =========================================================================
    // 1. OUT-OF-SCOPE / UNSUPPORTED INTENTS (Food, Trains, Cab, Recharge, etc.)
    // =========================================================================
    const unsupportedKeywords = [
      'food', 'swiggy', 'zomato', 'खाना', 'खाना ऑर्डर', 'ഭക്ഷണം', 'സ്വിഗ്ഗി', 'സൊമാറ്റോ',
      'train', 'railway', 'irctc', 'ticket', 'ट्रेन', 'रेलवे', 'टिकट', 'ട്രെയിൻ', 'ടിക്കറ്റ്',
      'cab', 'taxi', 'uber', 'ola', 'टैक्सी', 'कैब', 'ഓട്ടോ', 'ടാക്സി',
      'flight', 'hotel', 'होटल', 'विमान', 'ഹോട്ടൽ', 'വിമാനം',
      'weather', 'मौसम', 'കാലാവസ്ഥ',
      'recharge', 'mobile recharge', 'रिचार्ज', 'റീചാർജ്',
      'movie', 'cinema', 'फिल्म', 'सिनेमा', 'സിനിമ',
      'youtube', 'facebook', 'instagram', 'यूट्यूब', 'फेसबुक', 'ഇൻസ്റ്റാഗ്രാം'
    ];

    if (hasAny(unsupportedKeywords)) {
      const unsupportedText =
        language === 'hi'
          ? 'ओ-लर्न में यह सुविधा अभी उपलब्ध नहीं है। ओ-लर्न वर्तमान में व्हाट्सएप और गूगल पे सिखाता है।'
          : language === 'ml'
          ? 'ഈ സേവനം നിലവിൽ ഓ-ലേണിൽ ലഭ്യമല്ല. വാട്ട്‌സ്ആപ്പും ഗൂഗിൾ പേയുമാണ് ഇപ്പോൾ പരിശീലിപ്പിക്കുന്നത്.'
          : "OLearn doesn't support this task yet. OLearn currently teaches WhatsApp and Google Pay.";

      const clarifyPrompt =
        language === 'hi'
          ? 'कृपया नीचे दिए गए ट्यूटोरियल में से चुनें:'
          : language === 'ml'
          ? 'താഴെ പറയുന്നവയിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക:'
          : 'Please choose one of the available tutorials below:';

      return {
        matched: false,
        isUnsupported: true,
        unsupportedMessage: `${unsupportedText} ${clarifyPrompt}`,
        clarifyQuestion: {
          text: `${unsupportedText} ${clarifyPrompt}`,
          options: [
            {
              taskId: 'whatsapp_send_text',
              label: language === 'hi' ? 'व्हाट्सएप मैसेज भेजें' : language === 'ml' ? 'വാട്ട്സ്ആപ്പ് മെസ്സേജ്' : 'WhatsApp Message'
            },
            {
              taskId: 'gpay_scan_qr',
              label: language === 'hi' ? 'दुकान पर क्यूआर कोड स्कैन' : language === 'ml' ? 'ക്യുആർ സ്കാൻ ചെയ്ത് നൽകുക' : 'Scan QR Code'
            },
            {
              taskId: 'whatsapp_voice_call',
              label: language === 'hi' ? 'फ़ोन / वॉइस कॉल' : language === 'ml' ? 'വോയ്സ് കോൾ' : 'Voice Call'
            },
            {
              taskId: 'gpay_check_balance',
              label: language === 'hi' ? 'बैंक बैलेंस चेक करें' : language === 'ml' ? 'ബാങ്ക് ബാലൻസ് അറിയുക' : 'Check Balance'
            }
          ]
        }
      };
    }

    // =========================================================================
    // 2. DETECT CORE INTENT SIGNALS
    // =========================================================================
    // Call Signals
    const isCallGeneral = hasAny([
      'call', 'calling', 'phone', 'ring', 'fone', 'phon',
      'कॉल', 'बात करनी', 'फोन', 'फ़ोन',
      'വിളിക്കുക', 'കോൾ', 'ഫോൺ', 'വിളി'
    ]);
    const isVideoSpecific = hasAny([
      'video', 'vedio', 'vdo', 'face', 'camera', 'face to face',
      'वीडियो', 'विडियो', 'चेहरा',
      'വീഡിയോ', 'വീഡിയോ കോൾ', 'ക്യാമറ', 'മുഖം'
    ]);
    const isVoiceSpecific = hasAny([
      'voice', 'audio', 'sound', 'ordinary call', 'regular call',
      'वॉइस', 'ऑडियो', 'साधारण कॉल',
      'വോയ്സ്', 'ഓഡിയോ', 'സാധാരണ കോൾ'
    ]);

    // Media & Voice Note Signals
    const isPhoto = hasAny([
      'photo', 'picture', 'image', 'pic', 'foto', 'pikchar', 'gallery', 'camera photo',
      'फोटो', 'फ़ोटो', 'तस्वीर', 'चित्र', 'इमेज',
      'ഫോട്ടോ', 'ചിത്രം', 'പടം'
    ]);
    const isVoiceNote = hasAny([
      'voice note', 'voice message', 'audio message', 'audio note', 'record', 'mic message', 'speak message',
      'बोलकर', 'वॉइस नोट', 'ऑडियो संदेश', 'आवाज़ रिकॉर्ड', 'बोलकर संदेश', 'वॉइस मैसेज',
      'വോയ്സ് നോട്ട്', 'ശബ്ദ സന്ദേശം', 'വോയ്സ് മെസ്സേജ്', 'സംസാരിച്ച്'
    ]);

    // Payment Signals
    const isPayGeneral = hasAny([
      'pay', 'payment', 'money', 'send money', 'transfer', 'rupees', 'cash', 'amount', 'paise',
      'पैसे', 'रुपये', 'भुगतान', 'भेजने', 'रुपया', 'पैसा',
      'പണം', 'രൂപ', 'പൈസ', 'അയക്കുക', 'നൽകുക', 'പണം അയക്കാൻ'
    ]);
    const isQRSpecific = hasAny([
      'qr', 'scan', 'scanner', 'barcode', 'shop', 'dukkan', 'store', 'board', 'camera pay',
      'क्यूआर', 'स्कैन', 'दुकान', 'बारकोड', 'क्यूआर कोड',
      'ക്യുആർ', 'സ്കാൻ', 'കടയിൽ', 'ബോർഡ്', 'ബാർകോഡ്'
    ]);
    const isContactSpecific = hasAny([
      'contact', 'saved contact', 'son', 'daughter', 'friend', 'ramesh', 'family', 'number', 'mobile number', 'phone number',
      'संपर्क', 'बेटा', 'बेटी', 'दोस्त', 'रमेश', 'मोबाइल नंबर', 'नंबर पर',
      'കോൺടാക്റ്റ്', 'മകൻ', 'മകൾ', 'സുഹൃത്ത്', 'രമേഷ്', 'കുടുംബാംഗം', 'നമ്പറിലേക്ക്'
    ]);
    const isBalance = hasAny([
      'balance', 'check balance', 'balence', 'account balance', 'bank balance', 'how much money', 'account money',
      'बैलेंस', 'खाता', 'खाते में कितने', 'बैंक बैलेंस', 'रुपए कितने', 'कितने रुपये', 'बैलेंस चेक', 'खाते में',
      'ബാലൻസ്', 'ബാങ്ക് ബാലൻസ്', 'അക്കൗണ്ട്', 'അക്കൗണ്ടിൽ', 'എത്ര രൂപ', 'രൂപ എത്ര', 'രൂപയുണ്ട്', 'ബാലൻസ് അറിയുക', 'ബാങ്ക്'
    ]);
    const isHistory = hasAny([
      'history', 'statement', 'receipt', 'passbook', 'transaction history', 'transactions', 'past payments', 'old payments', 'records',
      'इतिहास', 'पासबुक', 'रसीद', 'पुराना', 'लेन देन', 'लेन-देन', 'पेमेंट हिस्ट्री',
      'ചരിത്രം', 'രസീത്', 'പാസ്ബുക്ക്', 'പഴയ പേയ്മെന്റ്', 'ഇടപാട് വിവരങ്ങൾ'
    ]);

    // Text Message Signals
    const isTextMessage = hasAny([
      'text', 'message', 'msg', 'type', 'sms', 'mesage', 'chat', 'typing',
      'मैसेज', 'संदेश', 'मेसेज', 'टेक्स्ट', 'लिखकर', 'चैट', 'टाइप',
      'മെസ്സേജ്', 'സന്ദേശം', 'ചാറ്റ്', 'ടൈപ്പ്', 'എഴുതി'
    ]);

    // General App mentions
    const isWhatsAppMention = hasAny(['whatsapp', 'whats app', 'व्हाट्सएप', 'വാട്ട്സ്ആപ്പ്']);
    const isGPayMention = hasAny(['gpay', 'google pay', 'googlepay', 'गूगल पे', 'ഗൂഗിൾ പേ']);

    // =========================================================================
    // 3. RESOLVE EXPLICIT MULTI-STEP / UNAMBIGUOUS INTENTS
    // =========================================================================
    // Balance check
    if (isBalance) {
      return { matched: true, taskId: 'gpay_check_balance' };
    }

    // Transaction history
    if (isHistory) {
      return { matched: true, taskId: 'gpay_transaction_history' };
    }

    // Voice note
    if (isVoiceNote) {
      return { matched: true, taskId: 'whatsapp_voice_message' };
    }

    // Photo
    if (isPhoto) {
      return { matched: true, taskId: 'whatsapp_send_photo' };
    }

    // Explicit Video Call
    if (isVideoSpecific) {
      return { matched: true, taskId: 'whatsapp_video_call' };
    }

    // Explicit QR scan payment
    if (isQRSpecific) {
      return { matched: true, taskId: 'gpay_scan_qr' };
    }

    // Explicit Contact payment
    if (isContactSpecific && (isPayGeneral || isGPayMention)) {
      return { matched: true, taskId: 'gpay_send_contact' };
    }

    // Explicit Text Message
    if (isTextMessage) {
      return { matched: true, taskId: 'whatsapp_send_text' };
    }

    // Explicit Voice Call (when explicitly voice, or general call without video)
    if (isVoiceSpecific) {
      return { matched: true, taskId: 'whatsapp_voice_call' };
    }

    // =========================================================================
    // 4. RESOLVE AMBIGUOUS QUERIES
    // =========================================================================

    // Ambiguity A: Calling without specifying voice vs video
    if (isCallGeneral) {
      return {
        matched: false,
        clarifyQuestion: {
          text:
            language === 'hi'
              ? 'क्या आप सामान्य वॉइस कॉल करना चाहते हैं या वीडियो कॉल?'
              : language === 'ml'
              ? 'നിങ്ങൾക്ക് സാധാരണ വോയ്സ് കോളാണോ അതോ വീഡിയോ കോളാണോ ചെയ്യേണ്ടത്?'
              : 'Would you like to make a regular Voice Call or a Video Call?',
          options: [
            {
              taskId: 'whatsapp_voice_call',
              label: language === 'hi' ? 'फ़ोन / वॉइस कॉल' : language === 'ml' ? 'വോയ്സ് കോൾ' : 'Voice Call'
            },
            {
              taskId: 'whatsapp_video_call',
              label: language === 'hi' ? 'वीडियो कॉल' : language === 'ml' ? 'വീഡിയോ കോൾ' : 'Video Call'
            }
          ]
        }
      };
    }

    // Ambiguity B: Paying without specifying QR vs Contact
    if (isPayGeneral) {
      return {
        matched: false,
        clarifyQuestion: {
          text:
            language === 'hi'
              ? 'आप दुकान पर क्यूआर कोड से भुगतान करना चाहते हैं या किसी संपर्क को पैसे भेजना चाहते हैं?'
              : language === 'ml'
              ? 'കടയിൽ ക്യുആർ കോഡ് സ്കാൻ ചെയ്തോ അതോ കോൺടാക്റ്റിലുള്ള ആൾക്കോ പണം നൽകേണ്ടത്?'
              : 'Do you want to scan a shop QR code, or send money to a saved contact?',
          options: [
            {
              taskId: 'gpay_scan_qr',
              label: language === 'hi' ? 'दुकान पर क्यूआर कोड स्कैन' : language === 'ml' ? 'ക്യുആർ സ്കാൻ ചെയ്ത് നൽകുക' : 'Scan QR Code'
            },
            {
              taskId: 'gpay_send_contact',
              label: language === 'hi' ? 'संपर्क (बेटे) को पैसे भेजें' : language === 'ml' ? 'കുടുംബാംഗത്തിന് പണം അയക്കുക' : 'Send to Contact'
            }
          ]
        }
      };
    }

    // Ambiguity C: "Send" without specifying text, photo, or money
    if (hasAny(['send', 'भेजना', 'भेजें', 'അയക്കുക', 'അയക്കണം'])) {
      return {
        matched: false,
        clarifyQuestion: {
          text:
            language === 'hi'
              ? 'आप क्या भेजना चाहते हैं?'
              : language === 'ml'
              ? 'നിങ്ങൾക്ക് എന്താണ് അയക്കേണ്ടത്?'
              : 'What would you like to send?',
          options: [
            {
              taskId: 'whatsapp_send_text',
              label: language === 'hi' ? 'टेक्स्ट मैसेज' : language === 'ml' ? 'ടെക്സ്റ്റ് മെസ്സേജ്' : 'Text Message'
            },
            {
              taskId: 'whatsapp_send_photo',
              label: language === 'hi' ? 'फ़ोटो / तस्वीर' : language === 'ml' ? 'ഫോട്ടോ' : 'Photo'
            },
            {
              taskId: 'gpay_send_contact',
              label: language === 'hi' ? 'पैसे भेजें' : language === 'ml' ? 'പണം അയക്കുക' : 'Send Money'
            }
          ]
        }
      };
    }

    // Ambiguity D: General "WhatsApp" mention without action
    if (isWhatsAppMention) {
      return {
        matched: false,
        clarifyQuestion: {
          text:
            language === 'hi'
              ? 'व्हाट्सएप में आप क्या सीखना चाहते हैं?'
              : language === 'ml'
              ? 'വാട്ട്‌സ്ആപ്പിൽ താങ്കൾ എന്താണ് പഠിക്കാൻ ആഗ്രഹിക്കുന്നത്?'
              : 'What would you like to learn in WhatsApp?',
          options: [
            {
              taskId: 'whatsapp_send_text',
              label: language === 'hi' ? 'मैसेज भेजें' : language === 'ml' ? 'മെസ്സേജ് അയക്കുക' : 'Send Text Message'
            },
            {
              taskId: 'whatsapp_voice_call',
              label: language === 'hi' ? 'वॉइस कॉल' : language === 'ml' ? 'വോയ്സ് കോൾ' : 'Voice Call'
            },
            {
              taskId: 'whatsapp_send_photo',
              label: language === 'hi' ? 'फ़ोटो भेजें' : language === 'ml' ? 'ഫോട്ടോ അയക്കുക' : 'Send Photo'
            }
          ]
        }
      };
    }

    // Ambiguity E: General "Google Pay" / "GPay" mention without action
    if (isGPayMention) {
      return {
        matched: false,
        clarifyQuestion: {
          text:
            language === 'hi'
              ? 'गूगल पे में आप क्या सीखना चाहते हैं?'
              : language === 'ml'
              ? 'ഗൂഗിൾ പേയിൽ താങ്കൾ എന്താണ് പഠിക്കാൻ ആഗ്രഹിക്കുന്നത്?'
              : 'What would you like to learn in Google Pay?',
          options: [
            {
              taskId: 'gpay_scan_qr',
              label: language === 'hi' ? 'दुकान पर क्यूआर कोड स्कैन' : language === 'ml' ? 'ക്യുആർ സ്കാൻ ചെയ്യുക' : 'Scan Shop QR'
            },
            {
              taskId: 'gpay_send_contact',
              label: language === 'hi' ? 'संपर्क को पैसे भेजें' : language === 'ml' ? 'കോൺടാക്റ്റിലേക്ക് പണം അയക്കുക' : 'Send to Contact'
            },
            {
              taskId: 'gpay_check_balance',
              label: language === 'hi' ? 'बैंक बैलेंस चेक करें' : language === 'ml' ? 'ബാങ്ക് ബാലൻസ് അറിയുക' : 'Check Balance'
            }
          ]
        }
      };
    }

    // =========================================================================
    // 5. UNRECOGNIZED / UNSUPPORTED QUERY DEFAULT FALLBACK
    // =========================================================================
    const unsupportedText =
      language === 'hi'
        ? 'माफ़ कीजिए, यह सुविधा उपलब्ध नहीं है। ओ-लर्न वर्तमान में व्हाट्सएप और गूगल पे सिखाता है।'
        : language === 'ml'
        ? 'ക്ഷമിക്കണം, ഈ സേവനം ലഭ്യമല്ല. വാട്ട്‌സ്ആപ്പും ഗൂഗിൾ പേയുമാണ് ഇപ്പോൾ പഠിപ്പിക്കുന്നത്.'
        : "Sorry, this request is not supported yet. OLearn currently teaches WhatsApp and Google Pay.";

    const defaultPrompt =
      language === 'hi'
        ? 'कृपया नीचे दिए गए ट्यूटोरियल में से एक चुनें:'
        : language === 'ml'
        ? 'താഴെ പറയുന്നവയിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക:'
        : 'Please choose one of the available tutorials below:';

    return {
      matched: false,
      isUnsupported: true,
      unsupportedMessage: `${unsupportedText} ${defaultPrompt}`,
      clarifyQuestion: {
        text: `${unsupportedText} ${defaultPrompt}`,
        options: [
          {
            taskId: 'whatsapp_send_text',
            label: language === 'hi' ? 'व्हाट्सएप मैसेज भेजें' : language === 'ml' ? 'വാട്ട്സ്ആപ്പ് മെസ്സേജ്' : 'WhatsApp Message'
          },
          {
            taskId: 'gpay_scan_qr',
            label: language === 'hi' ? 'गूगल पे क्यूआर कोड स्कैन' : language === 'ml' ? 'ഗൂഗിൾ പേ ക്യുആർ' : 'Google Pay QR Scan'
          },
          {
            taskId: 'whatsapp_voice_call',
            label: language === 'hi' ? 'फ़ोन / वॉइस कॉल' : language === 'ml' ? 'വോയ്സ് കോൾ' : 'Voice Call'
          },
          {
            taskId: 'gpay_check_balance',
            label: language === 'hi' ? 'बैंक बैलेंस चेक करें' : language === 'ml' ? 'ബാങ്ക് ബാലൻസ് അറിയുക' : 'Check Balance'
          }
        ]
      }
    };
  },

  async callLLMClassifier(query: string, language: SupportedLanguage, apiKey: string): Promise<RouteResult | null> {
    const systemPrompt = `You are the task router for OLearn, an elderly digital literacy assistant in India.
The user is requesting assistance in English, Hindi, or Malayalam.
Match their request to EXACTLY ONE of the following 9 task IDs:
1. whatsapp_send_text: Send text message on WhatsApp
2. whatsapp_send_photo: Send a photo or picture on WhatsApp
3. whatsapp_voice_call: Make a voice phone call on WhatsApp
4. whatsapp_video_call: Make a face-to-face video call on WhatsApp
5. whatsapp_voice_message: Send an audio voice note on WhatsApp
6. gpay_check_balance: Check bank account balance in Google Pay
7. gpay_scan_qr: Scan QR code at a shop to pay money in Google Pay
8. gpay_send_contact: Send money to a saved contact / family member in Google Pay
9. gpay_transaction_history: View previous payment history / passbook receipts in Google Pay

Return a valid JSON object ONLY with one of these structures:
If matched with confidence:
{"task_id": "one_of_the_9_ids"}

If ambiguous or unclear:
{"no_match": true, "clarify_question": "in-language clarifying question for elderly user", "options": [{"task_id": "id1", "label": "label1"}, {"task_id": "id2", "label": "label2"}]}

If completely out of scope or unsupported:
{"is_unsupported": true, "unsupported_message": "in-language explanation that this task is not supported yet and OLearn teaches WhatsApp and Google Pay"}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) throw new Error(`LLM call failed with status ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    if (parsed.task_id && VALID_TASK_IDS.has(parsed.task_id)) {
      return { matched: true, taskId: parsed.task_id };
    }
    if (parsed.is_unsupported) {
      return {
        matched: false,
        isUnsupported: true,
        unsupportedMessage: parsed.unsupported_message
      };
    }
    if (parsed.no_match) {
      return {
        matched: false,
        clarifyQuestion: {
          text: parsed.clarify_question || 'Please select one of the following:',
          options: (parsed.options || []).filter((o: RouteOption) => VALID_TASK_IDS.has(o.taskId))
        }
      };
    }
    return null;
  }
};
