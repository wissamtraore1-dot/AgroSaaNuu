// ============================================================
// AgroSaaNuu — Payment Methods Utilities
// src/utils/paymentMethods.js
// ============================================================

import {
    PAYMENT_METHODS,
    PAYMENT_METHODS_LIST,
    calcFees,
    validatePhoneForMethod,
  } from '../config/paymentConfig';
  
  // Re-export for convenience
  export { PAYMENT_METHODS, PAYMENT_METHODS_LIST, calcFees, validatePhoneForMethod };
  
  // ─── Get method by id ────────────────────────────────────────
  /**
   * getMethodById('mtn_momo') → { id, name, color, ... }
   */
  export const getMethodById = (id) =>
    Object.values(PAYMENT_METHODS).find(m => m.id === id) ?? null;
  
  // ─── Check if method requires a phone number ─────────────────
  /**
   * requiresPhone('mtn_momo') → true
   * requiresPhone('wallet')   → false
   */
  export const requiresPhone = (methodId) => {
    const method = getMethodById(methodId);
    return method ? method.prefixes.length > 0 : false;
  };
  
  // ─── Format phone input on the fly ───────────────────────────
  /**
   * Auto-format as user types: "9612" → "96 12"
   */
  export const formatPhoneInput = (raw) =>
    raw
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{2})(?=\d)/g, '$1 ')
      .trim();
  
  // ─── Detect operator from phone prefix ───────────────────────
  /**
   * detectOperator('96123456') → PAYMENT_METHODS.MTN_MOMO
   * detectOperator('94000000') → PAYMENT_METHODS.MOOV_MONEY
   * detectOperator('00000000') → null
   */
  export const detectOperator = (phone) => {
    const cleaned = String(phone).replace(/\s/g, '');
    if (cleaned.length < 2) return null;
    const prefix = cleaned.slice(0, 2);
    return (
      Object.values(PAYMENT_METHODS).find(
        m => m.prefixes.includes(prefix)
      ) ?? null
    );
  };
  
  // ─── Check amount within method limits ───────────────────────
  /**
   * isAmountValid('mtn_momo', 5000) → true
   * isAmountValid('mtn_momo', 50)   → false  (below min)
   */
  export const isAmountValid = (methodId, amount, walletBalance = 0) => {
    const method = getMethodById(methodId);
    if (!method) return false;
    if (amount < method.minAmount) return false;
    if (method.maxAmount !== null && amount > method.maxAmount) return false;
    if (methodId === 'wallet' && amount > walletBalance) return false;
    return true;
  };
  
  // ─── Get amount error message ─────────────────────────────────
  export const getAmountError = (methodId, amount, walletBalance = 0) => {
    const method = getMethodById(methodId);
    if (!method) return 'Invalid payment method';
    if (amount < method.minAmount)
      return `Minimum amount is ${method.minAmount.toLocaleString('fr-BJ')} FCFA`;
    if (method.maxAmount !== null && amount > method.maxAmount)
      return `Maximum amount is ${method.maxAmount.toLocaleString('fr-BJ')} FCFA`;
    if (methodId === 'wallet' && amount > walletBalance)
      return 'Insufficient wallet balance';
    return null;
  };
  
  // ─── Summary for checkout display ────────────────────────────
  /**
   * getPaymentSummary('mtn_momo', 10000)
   * → { method, amount, fee, total, feeLabel }
   */
  export const getPaymentSummary = (methodId, amount) => {
    const method = getMethodById(methodId);
    const { fee, total } = calcFees(methodId, amount);
    return {
      method,
      amount,
      fee,
      total,
      feeLabel: fee === 0 ? 'No fees' : `${fee.toLocaleString('fr-BJ')} FCFA`,
    };
  };