// ============================================================
// AgroSaaNuu — Validators
// src/utils/validators.js
// ============================================================

import { validatePhoneForMethod } from '../config/paymentConfig';
import { WALLET_LIMITS } from '../config/paymentConfig';

// ─── Phone ───────────────────────────────────────────────────
/**
 * Validate a raw Benin phone number (8 digits).
 */
export const isValidPhone = (phone) => {
  const cleaned = String(phone).replace(/\s/g, '');
  return /^\d{8}$/.test(cleaned);
};

/**
 * Validate phone for a specific mobile money operator.
 */
export const isValidPhoneForOperator = (methodId, phone) => {
  if (!isValidPhone(phone)) return false;
  return validatePhoneForMethod(methodId, phone);
};

/**
 * Get phone error message.
 */
export const getPhoneError = (methodId, phone) => {
  if (!phone || phone.replace(/\s/g, '').length === 0)
    return 'Phone number is required';
  if (!isValidPhone(phone))
    return 'Enter a valid 8-digit phone number';
  if (!validatePhoneForMethod(methodId, phone))
    return 'This number does not match the selected operator';
  return null;
};

// ─── Amount ──────────────────────────────────────────────────
/**
 * Validate a numeric amount (positive integer).
 */
export const isValidAmount = (amount) => {
  const n = Number(amount);
  return !isNaN(n) && n > 0 && Number.isFinite(n);
};

/**
 * Validate deposit amount within wallet limits.
 */
export const isValidDepositAmount = (amount) => {
  const n = Number(amount);
  return (
    isValidAmount(n) &&
    n >= WALLET_LIMITS.MIN_DEPOSIT &&
    n <= WALLET_LIMITS.MAX_DEPOSIT
  );
};

/**
 * Validate withdrawal amount within wallet limits.
 */
export const isValidWithdrawalAmount = (amount, balance) => {
  const n = Number(amount);
  return (
    isValidAmount(n) &&
    n >= WALLET_LIMITS.MIN_WITHDRAWAL &&
    n <= WALLET_LIMITS.MAX_WITHDRAWAL &&
    n <= balance
  );
};

/**
 * Get deposit amount error.
 */
export const getDepositAmountError = (amount) => {
  const n = Number(amount);
  if (!amount || amount === '') return 'Amount is required';
  if (!isValidAmount(n))        return 'Enter a valid amount';
  if (n < WALLET_LIMITS.MIN_DEPOSIT)
    return `Minimum deposit is ${WALLET_LIMITS.MIN_DEPOSIT.toLocaleString('fr-BJ')} FCFA`;
  if (n > WALLET_LIMITS.MAX_DEPOSIT)
    return `Maximum deposit is ${WALLET_LIMITS.MAX_DEPOSIT.toLocaleString('fr-BJ')} FCFA`;
  return null;
};

/**
 * Get withdrawal amount error.
 */
export const getWithdrawalAmountError = (amount, balance) => {
  const n = Number(amount);
  if (!amount || amount === '') return 'Amount is required';
  if (!isValidAmount(n))        return 'Enter a valid amount';
  if (n < WALLET_LIMITS.MIN_WITHDRAWAL)
    return `Minimum withdrawal is ${WALLET_LIMITS.MIN_WITHDRAWAL.toLocaleString('fr-BJ')} FCFA`;
  if (n > WALLET_LIMITS.MAX_WITHDRAWAL)
    return `Maximum withdrawal is ${WALLET_LIMITS.MAX_WITHDRAWAL.toLocaleString('fr-BJ')} FCFA`;
  if (n > balance)
    return 'Insufficient wallet balance';
  return null;
};

// ─── Email ───────────────────────────────────────────────────
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const getEmailError = (email) => {
  if (!email || email.trim() === '') return 'Email is required';
  if (!isValidEmail(email))          return 'Enter a valid email address';
  return null;
};

// ─── Password ────────────────────────────────────────────────
export const isValidPassword = (password) =>
  String(password).length >= 8;

export const getPasswordError = (password) => {
  if (!password || password === '') return 'Password is required';
  if (!isValidPassword(password))   return 'Password must be at least 8 characters';
  return null;
};

export const getConfirmPasswordError = (password, confirm) => {
  if (!confirm || confirm === '') return 'Please confirm your password';
  if (password !== confirm)       return 'Passwords do not match';
  return null;
};

// ─── Generic required field ───────────────────────────────────
export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '';

export const getRequiredError = (value, fieldName = 'This field') => {
  if (!isRequired(value)) return `${fieldName} is required`;
  return null;
};

