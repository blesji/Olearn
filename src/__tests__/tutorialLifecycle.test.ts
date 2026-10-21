import { describe, it, expect, beforeEach } from 'vitest';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';
import { StorageService } from '../services/StorageService';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
(globalThis as any).localStorage = new LocalStorageMock();

describe('Tutorial Engine Workflow & Progression Logic', () => {
  const tasks = tasksData as TaskConfig[];

  beforeEach(() => {
    (globalThis as any).localStorage.clear();
  });

  it('verifies exact inventory of 9 core tutorials and 31 total steps', () => {
    expect(tasks.length).toBe(9);

    const expectedTasks = [
      { id: 'whatsapp_send_text', app: 'whatsapp', steps: 2 },
      { id: 'whatsapp_send_photo', app: 'whatsapp', steps: 4 },
      { id: 'whatsapp_voice_call', app: 'whatsapp', steps: 3 },
      { id: 'whatsapp_video_call', app: 'whatsapp', steps: 3 },
      { id: 'gpay_check_balance', app: 'gpay', steps: 3 },
      { id: 'gpay_scan_qr', app: 'gpay', steps: 5 },
      { id: 'gpay_send_contact', app: 'gpay', steps: 6 },
      { id: 'gpay_transaction_history', app: 'gpay', steps: 3 },
      { id: 'whatsapp_voice_message', app: 'whatsapp', steps: 2 },
    ];

    let totalSteps = 0;
    expectedTasks.forEach(expected => {
      const task = tasks.find(t => t.task_id === expected.id);
      expect(task, `Task "${expected.id}" must exist`).toBeDefined();
      expect(task!.app).toBe(expected.app);
      expect(task!.steps.length).toBe(expected.steps);
      totalSteps += task!.steps.length;
    });

    expect(totalSteps).toBe(31);
  });

  it('verifies representative WhatsApp tutorial workflow (whatsapp_send_text)', () => {
    const waTask = tasks.find(t => t.task_id === 'whatsapp_send_text')!;
    expect(waTask).toBeDefined();
    expect(waTask.steps.length).toBe(2);

    // Step 1: chat_input
    const step1 = waTask.steps[0];
    expect(step1.screen).toBe('whatsapp_chat_screen');
    expect(step1.highlight_element).toBe('chat_input');

    // Step 2: send_button
    const step2 = waTask.steps[1];
    expect(step2.screen).toBe('whatsapp_chat_screen_typed');
    expect(step2.highlight_element).toBe('send_button');

    // Simulate completion
    StorageService.markTaskCompleted(waTask.task_id);
    expect(StorageService.getProfile().completedTasks).toContain('whatsapp_send_text');
  });

  it('verifies representative Google Pay tutorial workflow (gpay_check_balance)', () => {
    const gpayTask = tasks.find(t => t.task_id === 'gpay_check_balance')!;
    expect(gpayTask).toBeDefined();
    expect(gpayTask.steps.length).toBe(3);

    // Step 1: check_balance_button
    expect(gpayTask.steps[0].screen).toBe('gpay_home_screen');
    expect(gpayTask.steps[0].highlight_element).toBe('check_balance_button');

    // Step 2: pin_keypad_submit
    expect(gpayTask.steps[1].screen).toBe('gpay_upi_pin_screen');
    expect(gpayTask.steps[1].highlight_element).toBe('pin_keypad_submit');

    // Step 3: balance_done_button
    expect(gpayTask.steps[2].screen).toBe('gpay_balance_display_screen');
    expect(gpayTask.steps[2].highlight_element).toBe('balance_done_button');

    // Simulate completion
    StorageService.markTaskCompleted(gpayTask.task_id);
    expect(StorageService.getProfile().completedTasks).toContain('gpay_check_balance');
  });

  it('verifies zero progress penalty and repeatable practice loop without data loss for all 9 tasks', () => {
    // Complete all 9 tasks sequentially
    tasks.forEach(task => {
      StorageService.markTaskCompleted(task.task_id);
    });

    const completed = StorageService.getProfile().completedTasks;
    expect(completed.length).toBe(9);

    // Repeat/practice any task again does not create duplicate entries or wipe previous achievements
    tasks.forEach(task => {
      StorageService.markTaskCompleted(task.task_id);
    });

    expect(StorageService.getProfile().completedTasks.length).toBe(9);
  });
});
