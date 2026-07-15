// ============================================================
// AgroSaaNuu — Formatters
// src/utils/formatPrice.js
// ============================================================

import { CURRENCY } from './constants';

// ─── Price ───────────────────────────────────────────────────
/**
 * Format a number as FCFA currency.
 * formatPrice(12500)          → "12 500 FCFA"
 * formatPrice(12500, false)   → "12 500"
 */
export const formatPrice = (amount, showCurrency = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showCurrency ? `— ${CURRENCY}` : '—';
  }
  const formatted = new Intl.NumberFormat('fr-BJ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return showCurrency ? `${formatted} ${CURRENCY}` : formatted;
};

// ─── Points ──────────────────────────────────────────────────
/**
 * Format points for display.
 * formatPoints(1200) → "1 200 pts"
 */
export const formatPoints = (points) => {
  if (points === null || points === undefined) return '0 pts';
  return `${new Intl.NumberFormat('fr-BJ').format(points)} pts`;
};

// ─── Phone ───────────────────────────────────────────────────
/**
 * Format a Benin phone number for display.
 * formatPhone("96123456") → "96 12 34 56"
 */
export const formatPhone = (phone) => {
  const cleaned = String(phone).replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};

// ─── Date ────────────────────────────────────────────────────
/**
 * Format a date in French locale.
 * formatDate(date)               → "12 juin 2025, 14:30"
 * formatDate(date, false)        → "12 juin 2025"
 */
export const formatDate = (date, showTime = true) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-BJ', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    ...(showTime && { hour: '2-digit', minute: '2-digit' }),
  });
};

/**
 * Format a short date.
 * formatShortDate(date) → "12/06/2025"
 */
export const formatShortDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-BJ');
};

/**
 * Relative time from now.
 * formatRelativeTime(date) → "2h ago" / "Just now" / "12 juin 2025"
 */
export const formatRelativeTime = (date) => {
  const d    = date instanceof Date ? date : new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000; // seconds
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(d, false);
};

// ─── Number ──────────────────────────────────────────────────
/**
 * Format a plain number with locale separators.
 * formatNumber(1234567) → "1 234 567"
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-BJ').format(value);
};

/**
 * Format a percentage.
 * formatPercent(0.325) → "32.5%"
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
};