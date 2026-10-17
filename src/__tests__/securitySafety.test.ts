import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MOCK_CONTACTS, MOCK_TRANSACTIONS, MOCK_BANK_BALANCE } from '../config/mockData';
import tasksData from '../config/tasks.json';
import { StorageService } from '../services/StorageService';

describe('Phase 7 — Security, Privacy, and Financial Safety Audits', () => {
  // =========================================================================
  // 1. FINANCIAL SIMULATION SAFETY INVARIANTS
  // =========================================================================
  describe('Financial Simulation Safety Invariants', () => {
    it('verifies all financial and banking mock data is strictly fictional and sandboxed', () => {
      // Mock Bank Balance
      expect(MOCK_BANK_BALANCE.accountNumberMasked).toContain('••••');
      expect(MOCK_BANK_BALANCE.balanceAmount).toBe('₹14,250.00');
      expect(typeof MOCK_BANK_BALANCE.balanceAmount).toBe('string');

      // Mock Contacts
      expect(MOCK_CONTACTS.length).toBeGreaterThanOrEqual(2);
      expect(MOCK_CONTACTS.some(c => c.phone.includes('98765 43210'))).toBe(true);

      // Mock Transactions
      expect(MOCK_TRANSACTIONS.length).toBeGreaterThanOrEqual(2);
      MOCK_TRANSACTIONS.forEach(tx => {
        expect(tx.id).toBeDefined();
        expect(tx.amount).toMatch(/^₹[\d,]+(\.\d{2})?$/);
        expect(tx.merchant.en).toBeDefined();
        expect(tx.merchant.hi).toBeDefined();
        expect(tx.merchant.ml).toBeDefined();
      });
    });

    it('verifies Google Pay tasks do not require personal UPI PINs or live credentials', () => {
      const gpayTasks = tasksData.filter(t => t.app === 'gpay');
      expect(gpayTasks.length).toBe(4); // check_balance, scan_qr, send_contact, transaction_history

      gpayTasks.forEach(task => {
        task.steps.forEach(step => {
          // Verify instruction text never asks for user's real banking credentials
          const enInst = (step.hint_text?.en || '').toLowerCase();
          expect(enInst).not.toContain('your real pin');
          expect(enInst).not.toContain('your bank password');
          expect(enInst).not.toContain('credit card');
          expect(enInst).not.toContain('cvv');
        });
      });
    });
  });

  // =========================================================================
  // 2. NETWORK & PRIVACY AUDIT (ZERO TELEMETRY, ZERO EXTERNAL BANKING ENDPOINTS)
  // =========================================================================
  describe('Network & Privacy Codebase Audit', () => {
    const srcDir = path.resolve(__dirname, '..');

    function getProductionTsFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('__tests__')) {
            results = results.concat(getProductionTsFiles(fullPath));
          }
        } else if (
          (file.endsWith('.ts') || file.endsWith('.tsx')) &&
          !file.includes('.test.') &&
          !file.includes('.spec.')
        ) {
          results.push(fullPath);
        }
      });
      return results;
    }

    const prodCodeFiles = getProductionTsFiles(srcDir);

    it('ensures no live banking, payment gateways, or UPI endpoints exist in production source files', () => {
      const forbiddenPaymentKeywords = [
        'upi://pay',
        'api.razorpay.com',
        'api.stripe.com',
        'securegw.paytm.in',
        'api.phonepe.com',
        'npci.org.in',
        'netbanking',
        'gateway.hdfcbank.com',
        'retail.sbi.co.in'
      ];

      expect(prodCodeFiles.length).toBeGreaterThanOrEqual(10);

      prodCodeFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        forbiddenPaymentKeywords.forEach(keyword => {
          expect(
            content.includes(keyword),
            `Security Violation: Forbidden payment endpoint "${keyword}" found in ${filePath}`
          ).toBe(false);
        });
      });
    });

    it('ensures zero third-party telemetry, tracking, or analytics libraries are embedded', () => {
      const forbiddenTrackingKeywords = [
        'google-analytics.com',
        'googletagmanager.com',
        'segment.io',
        'mixpanel.com',
        'sentry.io',
        'datadoghq.com',
        'amplitude.com',
        'hotjar.com'
      ];

      prodCodeFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        forbiddenTrackingKeywords.forEach(keyword => {
          expect(
            content.includes(keyword),
            `Privacy Violation: Tracking service "${keyword}" found in ${filePath}`
          ).toBe(false);
        });
      });
    });

    it('verifies AndroidManifest.xml requests strictly minimal, non-financial permissions', () => {
      const manifestPath = path.resolve(__dirname, '../../android/app/src/main/AndroidManifest.xml');
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8');

      // Allowed permissions: INTERNET (Capacitor webview), RECORD_AUDIO (Ask Me), MODIFY_AUDIO_SETTINGS
      expect(manifestContent).not.toContain('android.permission.READ_SMS');
      expect(manifestContent).not.toContain('android.permission.RECEIVE_SMS');
      expect(manifestContent).not.toContain('android.permission.SEND_SMS');
      expect(manifestContent).not.toContain('android.permission.READ_CONTACTS');
      expect(manifestContent).not.toContain('android.permission.ACCESS_FINE_LOCATION');
      expect(manifestContent).not.toContain('android.permission.BIND_ACCESSIBILITY_SERVICE');
    });
  });

  // =========================================================================
  // 3. STORAGE & RESILIENCE AUDIT
  // =========================================================================
  describe('Storage Resilience & Local Sandbox Isolation', () => {
    it('stores strictly non-sensitive user profile data (language, completed tasks, audio rate, mute)', () => {
      const profile = StorageService.getProfile();
      expect(profile).toHaveProperty('language');
      expect(profile).toHaveProperty('completedTasks');
      expect(profile).not.toHaveProperty('pin');
      expect(profile).not.toHaveProperty('bank');
      expect(profile).not.toHaveProperty('account');
      expect(profile).not.toHaveProperty('token');
      expect(profile).not.toHaveProperty('password');
    });

    it('handles corrupted localStorage without throwing fatal unhandled exceptions', () => {
      const originalGetItem = localStorage.getItem;
      try {
        localStorage.getItem = () => '{ corrupted_json_malformed: [[ }';
        const profile = StorageService.getProfile();
        expect(profile).toBeDefined();
        expect(['en', 'hi', 'ml']).toContain(profile.language);
      } finally {
        localStorage.getItem = originalGetItem;
      }
    });
  });
});
