import { describe, it, expect } from 'vitest';
import { TaskValidator } from '../engine/TaskValidator';
import tasksData from '../config/tasks.json';
import { TaskConfig } from '../types/task';

describe('TaskValidator Validation Rules', () => {
  const validTasks = tasksData as TaskConfig[];

  it('validates that all production tasks pass validation with zero errors', () => {
    const result = TaskValidator.validateAllTasks(validTasks);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('detects missing task_id', () => {
    const invalidTask = {
      ...validTasks[0],
      task_id: ''
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing a valid task_id'))).toBe(true);
  });

  it('detects invalid app identifier', () => {
    const invalidTask = {
      ...validTasks[0],
      app: 'telegram' as any
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid app'))).toBe(true);
  });

  it('detects missing localized titles', () => {
    const invalidTask = {
      ...validTasks[0],
      title: { en: 'Send text', hi: '', ml: 'സന്ദേശം' } as any
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing localized titles'))).toBe(true);
  });

  it('detects empty steps array', () => {
    const invalidTask = {
      ...validTasks[0],
      steps: []
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('at least one step'))).toBe(true);
  });

  it('detects unknown screen identifier for an app', () => {
    const invalidTask = {
      ...validTasks[0],
      steps: [
        {
          ...validTasks[0].steps[0],
          screen: 'non_existent_chat_screen'
        }
      ]
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('unknown screen'))).toBe(true);
  });

  it('detects unknown highlight_element identifier', () => {
    const invalidTask = {
      ...validTasks[0],
      steps: [
        {
          ...validTasks[0].steps[0],
          highlight_element: 'unsupported_button_id'
        }
      ]
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('unknown highlight_element'))).toBe(true);
  });

  it('detects invalid audio format', () => {
    const invalidTask = {
      ...validTasks[0],
      steps: [
        {
          ...validTasks[0].steps[0],
          audio_en: 'assets/audio/en/invalid_file.wav'
        }
      ]
    };
    const result = TaskValidator.validateTask(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('must be an .mp3 file'))).toBe(true);
  });

  it('detects duplicate task_id across task array', () => {
    const duplicateTasks = [validTasks[0], validTasks[0]];
    const result = TaskValidator.validateAllTasks(duplicateTasks);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate task_id detected'))).toBe(true);
  });
});
