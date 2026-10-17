import { describe, it, expect } from 'vitest';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';
import fs from 'fs';
import path from 'path';

describe('Tasks Configuration & Asset Integrity', () => {
  const tasks = tasksData as TaskConfig[];

  it('contains exactly 9 tasks (8 core + 1 modular extensibility task)', () => {
    expect(tasks.length).toBe(9);
  });

  it('includes all 4 required WhatsApp tasks and 4 required Google Pay tasks', () => {
    const taskIds = tasks.map(t => t.task_id);
    // WhatsApp
    expect(taskIds).toContain('whatsapp_send_text');
    expect(taskIds).toContain('whatsapp_send_photo');
    expect(taskIds).toContain('whatsapp_voice_call');
    expect(taskIds).toContain('whatsapp_video_call');
    // Google Pay
    expect(taskIds).toContain('gpay_check_balance');
    expect(taskIds).toContain('gpay_scan_qr');
    expect(taskIds).toContain('gpay_send_contact');
    expect(taskIds).toContain('gpay_transaction_history');
    // Modular 9th task
    expect(taskIds).toContain('whatsapp_voice_message');
  });

  it('verifies every step has localized hints in en, hi, and ml', () => {
    for (const task of tasks) {
      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i];
        expect(step.screen, `Task ${task.task_id} step ${i + 1} screen`).toBeTruthy();
        expect(step.highlight_element, `Task ${task.task_id} step ${i + 1} highlight`).toBeTruthy();
        expect(step.hint_text.en, `Task ${task.task_id} step ${i + 1} hint en`).toBeTruthy();
        expect(step.hint_text.hi, `Task ${task.task_id} step ${i + 1} hint hi`).toBeTruthy();
        expect(step.hint_text.ml, `Task ${task.task_id} step ${i + 1} hint ml`).toBeTruthy();
      }
    }
  });

  it('verifies all 93 referenced audio files physically exist in public/ directory', () => {
    let totalAudioFiles = 0;
    const publicDir = path.resolve(__dirname, '../../public');

    for (const task of tasks) {
      for (const step of task.steps) {
        for (const lang of ['en', 'hi', 'ml'] as const) {
          const audioKey = `audio_${lang}` as keyof typeof step;
          const audioPath = step[audioKey] as string;
          expect(audioPath, `Audio path for ${task.task_id} ${lang}`).toBeTruthy();

          const fullDiskPath = path.join(publicDir, audioPath);
          const exists = fs.existsSync(fullDiskPath);
          expect(exists, `File exists on disk: ${fullDiskPath}`).toBe(true);

          const stat = fs.statSync(fullDiskPath);
          expect(stat.size, `File not empty: ${fullDiskPath}`).toBeGreaterThan(100);
          totalAudioFiles++;
        }
      }
    }

    expect(totalAudioFiles).toBe(93);
  });
});
