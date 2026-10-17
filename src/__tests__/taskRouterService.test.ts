import { describe, it, expect } from 'vitest';
import { TaskRouterService, normalizeQuery } from '../services/TaskRouterService';
import tasksData from '../config/tasks.json';

const VALID_TASK_IDS = new Set(tasksData.map(t => t.task_id));

describe('TaskRouterService — Phase 6 Offline Multilingual Semantic Intent Router', () => {
  // =========================================================================
  // 1. ALL 9 CANONICAL TASKS ACROSS EN, HI, ML
  // =========================================================================
  describe('Canonical 9 Tasks Resolution (Trilingual)', () => {
    it('1. routes whatsapp_send_text in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('I want to type a text message to my friend', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('whatsapp_send_text');

      const hi = await TaskRouterService.routeQuery('मुझे एक संदेश मैसेज लिखकर भेजना है', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('whatsapp_send_text');

      const ml = await TaskRouterService.routeQuery('സുഹൃത്തിന് ഒരു ടെക്സ്റ്റ് മെസ്സേജ് അയക്കണം', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('whatsapp_send_text');
    });

    it('2. routes whatsapp_send_photo in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('How do I send a picture from my phone?', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('whatsapp_send_photo');

      const hi = await TaskRouterService.routeQuery('फ़ोटो या तस्वीर कैसे भेजते हैं?', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('whatsapp_send_photo');

      const ml = await TaskRouterService.routeQuery('മകൾക്ക് ഒരു ഫോട്ടോ അല്ലെങ്കിൽ ചിത്രം അയക്കണം', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('whatsapp_send_photo');
    });

    it('3. routes whatsapp_voice_call in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('Make a regular voice call to my son', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('whatsapp_voice_call');

      const hi = await TaskRouterService.routeQuery('फ़ोन पर वॉइस कॉल करके बात करनी है', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('whatsapp_voice_call');

      const ml = await TaskRouterService.routeQuery('സാധാരണ വോയ്സ് കോൾ വിളിക്കാൻ പഠിക്കണം', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('whatsapp_voice_call');
    });

    it('4. routes whatsapp_video_call in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('I want to see face in video call', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('whatsapp_video_call');

      const hi = await TaskRouterService.routeQuery('चेहरा देखकर वीडियो कॉल करना सीखना है', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('whatsapp_video_call');

      const ml = await TaskRouterService.routeQuery('വീഡിയോ കോൾ ചെയ്യണം', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('whatsapp_video_call');
    });

    it('5. routes whatsapp_voice_message in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('Record and send an audio voice note message', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('whatsapp_voice_message');

      const hi = await TaskRouterService.routeQuery('बोलकर संदेश या वॉइस नोट कैसे भेजते हैं?', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('whatsapp_voice_message');

      const ml = await TaskRouterService.routeQuery('ശബ്ദ സന്ദേശം വോയ്സ് നോട്ട് സംസാരിച്ച് അയക്കുക', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('whatsapp_voice_message');
    });

    it('6. routes gpay_check_balance in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('Check my bank account balance in Google Pay', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('gpay_check_balance');

      const hi = await TaskRouterService.routeQuery('मेरे बैंक खाते में कितने रुपये हैं बैलेंस चेक करें', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('gpay_check_balance');

      const ml = await TaskRouterService.routeQuery('എന്റെ ബാങ്ക് അക്കൗണ്ടിൽ എത്ര രൂപയുണ്ട് എന്ന് അറിയണം', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('gpay_check_balance');
    });

    it('7. routes gpay_scan_qr in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('Scan shop QR code to pay', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('gpay_scan_qr');

      const hi = await TaskRouterService.routeQuery('दुकान पर क्यूआर कोड स्कैनर से पैसे चुकाने हैं', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('gpay_scan_qr');

      const ml = await TaskRouterService.routeQuery('കടയിൽ ക്യുആർ കോഡ് സ്കാൻ ചെയ്ത് നൽകുക', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('gpay_scan_qr');
    });

    it('8. routes gpay_send_contact in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('Send money to contact Ramesh', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('gpay_send_contact');

      const hi = await TaskRouterService.routeQuery('अपने बेटे रमेश के संपर्क पर पैसे भेजें', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('gpay_send_contact');

      const ml = await TaskRouterService.routeQuery('കോൺടാക്റ്റിലുള്ള മകൻ രമേഷിന് പണം അയക്കുക', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('gpay_send_contact');
    });

    it('9. routes gpay_transaction_history in English, Hindi, and Malayalam', async () => {
      const en = await TaskRouterService.routeQuery('Show my past transaction history and passbook receipt', 'en');
      expect(en.matched).toBe(true);
      expect(en.taskId).toBe('gpay_transaction_history');

      const hi = await TaskRouterService.routeQuery('पुराने लेन-देन का इतिहास और रसीद पासबुक देखना है', 'hi');
      expect(hi.matched).toBe(true);
      expect(hi.taskId).toBe('gpay_transaction_history');

      const ml = await TaskRouterService.routeQuery('പഴയ പേയ്മെന്റ് ഇടപാട് വിവരങ്ങൾ രസീത് പരിശോധിക്കണം', 'ml');
      expect(ml.matched).toBe(true);
      expect(ml.taskId).toBe('gpay_transaction_history');
    });
  });

  // =========================================================================
  // 2. SHORT QUERIES, PHONETIC VARIATIONS, AND PUNCTUATION RESILIENCE
  // =========================================================================
  describe('Short Queries, Accents, and Phonetic Variations', () => {
    it('resolves single-word and short queries correctly', async () => {
      expect((await TaskRouterService.routeQuery('photo', 'en')).taskId).toBe('whatsapp_send_photo');
      expect((await TaskRouterService.routeQuery('balance', 'en')).taskId).toBe('gpay_check_balance');
      expect((await TaskRouterService.routeQuery('qr', 'en')).taskId).toBe('gpay_scan_qr');
      expect((await TaskRouterService.routeQuery('video', 'en')).taskId).toBe('whatsapp_video_call');
      expect((await TaskRouterService.routeQuery('history', 'en')).taskId).toBe('gpay_transaction_history');
      expect((await TaskRouterService.routeQuery('तस्वीर', 'hi')).taskId).toBe('whatsapp_send_photo');
      expect((await TaskRouterService.routeQuery('ചിത്രം', 'ml')).taskId).toBe('whatsapp_send_photo');
    });

    it('handles phonetic transliterations and common spelling variants', async () => {
      expect((await TaskRouterService.routeQuery('send foto', 'en')).taskId).toBe('whatsapp_send_photo');
      expect((await TaskRouterService.routeQuery('check balence', 'en')).taskId).toBe('gpay_check_balance');
      expect((await TaskRouterService.routeQuery('vedio call', 'en')).taskId).toBe('whatsapp_video_call');
      expect((await TaskRouterService.routeQuery('send pic', 'en')).taskId).toBe('whatsapp_send_photo');
    });

    it('strips heavy punctuation, mixed cases, and quotes safely', async () => {
      const res = await TaskRouterService.routeQuery('   "HOW TO SEND A PHOTO?!"   ', 'en');
      expect(res.matched).toBe(true);
      expect(res.taskId).toBe('whatsapp_send_photo');

      const res2 = await TaskRouterService.routeQuery('...बैंक बैलेंस कितना है???', 'hi');
      expect(res2.matched).toBe(true);
      expect(res2.taskId).toBe('gpay_check_balance');
    });
  });

  // =========================================================================
  // 3. AMBIGUOUS QUERIES
  // =========================================================================
  describe('Ambiguous Query Disambiguation', () => {
    it('disambiguates general "call" into Voice Call vs Video Call options', async () => {
      const res = await TaskRouterService.routeQuery('I want to call someone', 'en');
      expect(res.matched).toBe(false);
      expect(res.clarifyQuestion).toBeDefined();
      const optionIds = res.clarifyQuestion!.options.map(o => o.taskId);
      expect(optionIds).toContain('whatsapp_voice_call');
      expect(optionIds).toContain('whatsapp_video_call');
    });

    it('disambiguates general "pay" into QR Code vs Contact Payment options', async () => {
      const res = await TaskRouterService.routeQuery('पैसे देने हैं', 'hi');
      expect(res.matched).toBe(false);
      expect(res.clarifyQuestion).toBeDefined();
      const optionIds = res.clarifyQuestion!.options.map(o => o.taskId);
      expect(optionIds).toContain('gpay_scan_qr');
      expect(optionIds).toContain('gpay_send_contact');
    });

    it('disambiguates general "send" into Text vs Photo vs Send Money options', async () => {
      const res = await TaskRouterService.routeQuery('I want to send something', 'en');
      expect(res.matched).toBe(false);
      expect(res.clarifyQuestion).toBeDefined();
      const optionIds = res.clarifyQuestion!.options.map(o => o.taskId);
      expect(optionIds).toContain('whatsapp_send_text');
      expect(optionIds).toContain('whatsapp_send_photo');
      expect(optionIds).toContain('gpay_send_contact');
    });

    it('disambiguates general "whatsapp" mention without explicit action', async () => {
      const res = await TaskRouterService.routeQuery('WhatsApp', 'en');
      expect(res.matched).toBe(false);
      expect(res.clarifyQuestion).toBeDefined();
      expect(res.clarifyQuestion!.options.length).toBeGreaterThanOrEqual(2);
      expect(res.clarifyQuestion!.options.every(o => o.taskId.startsWith('whatsapp_'))).toBe(true);
    });

    it('disambiguates general "gpay" mention without explicit action', async () => {
      const res = await TaskRouterService.routeQuery('गूगल पे', 'hi');
      expect(res.matched).toBe(false);
      expect(res.clarifyQuestion).toBeDefined();
      expect(res.clarifyQuestion!.options.length).toBeGreaterThanOrEqual(2);
      expect(res.clarifyQuestion!.options.every(o => o.taskId.startsWith('gpay_'))).toBe(true);
    });
  });

  // =========================================================================
  // 4. UNSUPPORTED AND OUT-OF-SCOPE QUERIES
  // =========================================================================
  describe('Unsupported & Out-of-Scope Intent Handling', () => {
    it('detects out-of-scope food delivery (Swiggy/Zomato) gracefully', async () => {
      const res = await TaskRouterService.routeQuery('Order food from Swiggy', 'en');
      expect(res.matched).toBe(false);
      expect(res.isUnsupported).toBe(true);
      expect(res.unsupportedMessage).toContain('support this task yet');
      expect(res.clarifyQuestion?.options.length).toBeGreaterThanOrEqual(2);
    });

    it('detects out-of-scope train ticket booking (IRCTC)', async () => {
      const res = await TaskRouterService.routeQuery('ट्रेन का टिकट बुक करना है', 'hi');
      expect(res.matched).toBe(false);
      expect(res.isUnsupported).toBe(true);
      expect(res.unsupportedMessage).toContain('उपलब्ध नहीं है');
      expect(res.clarifyQuestion?.options.length).toBeGreaterThanOrEqual(2);
    });

    it('detects out-of-scope taxi/cab booking in Malayalam', async () => {
      const res = await TaskRouterService.routeQuery('ടാക്സി ബുക്ക് ചെയ്യണം', 'ml');
      expect(res.matched).toBe(false);
      expect(res.isUnsupported).toBe(true);
      expect(res.unsupportedMessage).toContain('ലഭ്യമല്ല');
      expect(res.clarifyQuestion?.options.length).toBeGreaterThanOrEqual(2);
    });

    it('falls back to helpful tutorial options on completely unrecognized input', async () => {
      const res = await TaskRouterService.routeQuery('xyzzy quantum teleportation 12345', 'en');
      expect(res.matched).toBe(false);
      expect(res.isUnsupported).toBe(true);
      expect(res.clarifyQuestion).toBeDefined();
      expect(res.clarifyQuestion!.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  // =========================================================================
  // 5. SCHEMA AND DESTINATION VALIDITY
  // =========================================================================
  describe('Destination Catalogue Integrity', () => {
    it('guarantees every resolved taskId exists in the official task inventory', async () => {
      const testQueries = [
        'send photo',
        'type message',
        'call daughter',
        'see face video call',
        'send voice note',
        'check balance',
        'scan qr',
        'pay contact ramesh',
        'transaction history'
      ];

      for (const q of testQueries) {
        const res = await TaskRouterService.routeQuery(q, 'en');
        if (res.matched && res.taskId) {
          expect(VALID_TASK_IDS.has(res.taskId)).toBe(true);
        }
      }
    });

    it('guarantees all clarify options map strictly to valid task IDs', async () => {
      const ambiguousQueries = [
        'call',
        'pay',
        'send',
        'whatsapp',
        'gpay',
        'order food',
        'unknown query'
      ];

      for (const q of ambiguousQueries) {
        const res = await TaskRouterService.routeQuery(q, 'en');
        if (res.clarifyQuestion) {
          for (const opt of res.clarifyQuestion.options) {
            expect(VALID_TASK_IDS.has(opt.taskId)).toBe(true);
          }
        }
      }
    });
  });
});
