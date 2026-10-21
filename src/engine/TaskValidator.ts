import { TaskConfig, TaskStep } from '../types/task';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const VALID_APPS = ['whatsapp', 'gpay'] as const;

export const VALID_WHATSAPP_SCREENS = new Set([
  'whatsapp_chat_screen',
  'whatsapp_chat_screen_typed',
  'whatsapp_attachment_sheet',
  'whatsapp_gallery_screen',
  'whatsapp_photo_preview',
  'whatsapp_call_confirm_dialog',
  'whatsapp_active_voice_call',
  'whatsapp_video_confirm_dialog',
  'whatsapp_active_video_call',
  'whatsapp_voice_recording_screen'
]);

export const VALID_GPAY_SCREENS = new Set([
  'gpay_home_screen',
  'gpay_qr_scanner_viewfinder',
  'gpay_amount_entry_screen',
  'gpay_upi_pin_screen',
  'gpay_payment_success_screen',
  'gpay_contact_list_screen',
  'gpay_contact_chat_screen',
  'gpay_balance_display_screen',
  'gpay_history_list_screen',
  'gpay_receipt_detail_screen'
]);

export const VALID_WHATSAPP_ELEMENTS = new Set([
  'chat_input',
  'send_button',
  'attachment_icon',
  'gallery_icon',
  'photo_thumbnail_1',
  'preview_send_button',
  'voice_call_icon',
  'dialog_call_button',
  'end_call_button',
  'video_call_icon',
  'dialog_video_button',
  'mic_record_button',
  'send_voice_note_button'
]);

export const VALID_GPAY_ELEMENTS = new Set([
  'scan_qr_button',
  'pay_contacts_button',
  'check_balance_button',
  'transaction_history_button',
  'qr_target_box',
  'proceed_to_pay_button',
  'pin_keypad_submit',
  'success_done_button',
  'contact_son_ramesh',
  'contact_pay_button',
  'balance_done_button',
  'history_item_1',
  'receipt_back_button'
]);

export const TaskValidator = {
  /**
   * Validates an individual task configuration.
   * Ensures non-empty identifiers, supported application, reachable steps,
   * existing screens, existing highlight elements, and valid audio paths.
   */
  validateTask(task: TaskConfig): ValidationResult {
    const errors: string[] = [];

    if (!task) {
      return { valid: false, errors: ['Task object is null or undefined'] };
    }

    if (!task.task_id || typeof task.task_id !== 'string' || task.task_id.trim() === '') {
      errors.push('Task is missing a valid task_id');
    }

    if (!task.app || !VALID_APPS.includes(task.app as any)) {
      errors.push(`Invalid app "${task.app}". Must be one of: ${VALID_APPS.join(', ')}`);
    }

    if (!task.title || !task.title.en || !task.title.hi || !task.title.ml) {
      errors.push(`Task "${task.task_id}" has missing localized titles (must have en, hi, ml)`);
    }

    if (!task.steps || !Array.isArray(task.steps) || task.steps.length === 0) {
      errors.push(`Task "${task.task_id}" must have at least one step in steps array`);
      return { valid: errors.length === 0, errors };
    }

    const validScreens = task.app === 'whatsapp' ? VALID_WHATSAPP_SCREENS : VALID_GPAY_SCREENS;
    const validElements = task.app === 'whatsapp' ? VALID_WHATSAPP_ELEMENTS : VALID_GPAY_ELEMENTS;

    task.steps.forEach((step: TaskStep, index: number) => {
      const stepNum = index + 1;

      if (!step.screen) {
        errors.push(`Task "${task.task_id}" Step ${stepNum} is missing screen identifier`);
      } else if (!validScreens.has(step.screen)) {
        errors.push(`Task "${task.task_id}" Step ${stepNum} has unknown screen "${step.screen}" for app "${task.app}"`);
      }

      if (!step.highlight_element) {
        errors.push(`Task "${task.task_id}" Step ${stepNum} is missing highlight_element`);
      } else if (!validElements.has(step.highlight_element)) {
        errors.push(`Task "${task.task_id}" Step ${stepNum} has unknown highlight_element "${step.highlight_element}" for app "${task.app}"`);
      }

      for (const lang of ['en', 'hi', 'ml'] as const) {
        const audioKey = `audio_${lang}` as keyof TaskStep;
        const audioPath = step[audioKey];
        if (!audioPath || typeof audioPath !== 'string') {
          errors.push(`Task "${task.task_id}" Step ${stepNum} is missing audio_${lang}`);
        } else if (!audioPath.toLowerCase().endsWith('.mp3')) {
          errors.push(`Task "${task.task_id}" Step ${stepNum} audio_${lang} must be an .mp3 file: "${audioPath}"`);
        }
      }

      if (!step.hint_text || !step.hint_text.en || !step.hint_text.hi || !step.hint_text.ml) {
        errors.push(`Task "${task.task_id}" Step ${stepNum} is missing localized hint_text (must have en, hi, ml)`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates a collection of tasks, checking for duplicate task IDs across the configuration.
   */
  validateAllTasks(tasks: TaskConfig[]): ValidationResult {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return { valid: false, errors: ['Tasks configuration is empty or not an array'] };
    }

    for (const task of tasks) {
      if (task?.task_id) {
        if (seenIds.has(task.task_id)) {
          errors.push(`Duplicate task_id detected: "${task.task_id}"`);
        }
        seenIds.add(task.task_id);
      }
      const singleResult = this.validateTask(task);
      if (!singleResult.valid) {
        errors.push(...singleResult.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
