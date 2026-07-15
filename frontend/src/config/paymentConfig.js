// ============================================================
// AgroSaaNuu — Payment Configuration
// src/config/paymentConfig.js
// ============================================================

// ─── Mobile Money Operators (Benin) ─────────────────────────
export const PAYMENT_METHODS = {
    MTN_MOMO: {
      id:          'mtn_momo',
      name:        'MTN Mobile Money',
      shortName:   'MTN MoMo',
      logo:        '/assets/logos/mtn.png',
      color:       '#FFC107',
      textColor:   '#1A1A1A',
      prefixes:    ['96', '97', '66', '67' ,'01'],
      placeholder: '96 XX XX XX XX',
      digits:      8,
      available:   true,
      minAmount:   100,
      maxAmount:   500000,
      fees: { flat: 0, percent: 1.5 },
    },
  
    MOOV_MONEY: {
      id:          'moov_money',
      name:        'Moov Money',
      shortName:   'Moov Money',
      logo:        '/assets/logos/moov.png',
      color:       '#0066B3',
      textColor:   '#FFFFFF',
      prefixes:    ['94', '95', '64', '65' ,'01'],
      placeholder: '94 XX XX XX XX',
      digits:      8,
      available:   true,
      minAmount:   100,
      maxAmount:   500000,
      fees: { flat: 0, percent: 1.5 },
    },
  
    CELTIS_CASH: {
      id:          'celtis_cash',
      name:        'Celtis Cash',
      shortName:   'Celtis Cash',
      logo:        '/assets/logos/celtis.png',
      color:       '#E63946',
      textColor:   '#FFFFFF',
      prefixes:    ['98', '99', '90', '91' ,'01'],
      placeholder: '98 XX XX XX XX',
      digits:      8,
      available:   true,
      minAmount:   100,
      maxAmount:   300000,
      fees: { flat: 0, percent: 1.5 },
    },
  
    WALLET: {
      id:          'wallet',
      name:        'AgroSaaNuu Wallet',
      shortName:   'My Wallet',
      logo:        '/assets/logos/wallet.png',
      color:       '#16A34A',
      textColor:   '#FFFFFF',
      prefixes:    [],
      placeholder: '',
      digits:      0,
      available:   true,
      minAmount:   1,
      maxAmount:   null, // limited by balance
      fees: { flat: 0, percent: 0 },
    },
  };
  
  // Ordered list for UI display
  export const PAYMENT_METHODS_LIST = [
    PAYMENT_METHODS.MTN_MOMO,
    PAYMENT_METHODS.MOOV_MONEY,
    PAYMENT_METHODS.CELTIS_CASH,
    PAYMENT_METHODS.WALLET,
  ];
  
  // ─── Fee Calculator ──────────────────────────────────────────
  // Returns { fee, total } for a given method and amount
  export const calcFees = (methodId, amount) => {
    const method = Object.values(PAYMENT_METHODS).find(m => m.id === methodId);
    if (!method) return { fee: 0, total: amount };
    const fee = method.fees.flat + Math.ceil((amount * method.fees.percent) / 100);
    return { fee, total: amount + fee };
  };
  
  // ─── Phone Number Validator ──────────────────────────────────
  // Returns true if phone matches the operator's prefixes
  export const validatePhoneForMethod = (methodId, phone) => {
    const method = Object.values(PAYMENT_METHODS).find(m => m.id === methodId);
    if (!method || method.prefixes.length === 0) return true;
    const cleaned = String(phone).replace(/\s/g, '');
    if (cleaned.length !== method.digits) return false;
    return method.prefixes.some(p => cleaned.startsWith(p));
  };
  
  // ─── Escrow Configuration ────────────────────────────────────
  export const ESCROW_CONFIG = {
    // Hours before funds auto-release if buyer doesn't confirm
    AUTO_RELEASE_HOURS: 72,
  
    BUYER_MESSAGE:
      'Your payment is held securely. Funds are released to the seller only after you confirm delivery.',
  
    SELLER_MESSAGE:
      'Payment is secured. You will receive your funds as soon as the buyer confirms receipt.',
  };
  
  // ─── Wallet Limits ───────────────────────────────────────────
  export const WALLET_LIMITS = {
    MIN_DEPOSIT:    500,
    MAX_DEPOSIT:    10000000,
    MIN_WITHDRAWAL: 1000,
    MAX_WITHDRAWAL: 5000000,
  
    DEPOSIT_QUICK_AMOUNTS:    [1000, 2000, 5000, 10000, 25000, 50000],
    WITHDRAWAL_QUICK_AMOUNTS: [1000, 2000, 5000, 10000, 25000, 50000],
  };
  
  // ─── Points / Loyalty ────────────────────────────────────────
  export const POINTS_CONFIG = {
    EARN_RATE:               1,   // 1 point per 100 FCFA
    REDEEM_RATE:             5,   // 1 point = 5 FCFA
    MIN_REDEEM:            500,   // min points to redeem
    MAX_USAGE_PERCENT:      30,   // max % of order payable with points
  };