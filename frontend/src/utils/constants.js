// ============================================================
// AgroConnect — Global Constants
// src/utils/constants.js
// ============================================================

// ─── Order Statuses ──────────────────────────────────────────
export const ORDER_STATUS = {
    PENDING:       'PAIEMENT_EN_ATTENTE',
    PAID:          'PAIEMENT_RECU',
    PREPARING:     'EN_PREPARATION',
    SHIPPED:       'EN_LIVRAISON',
    IN_DELIVERY:   'EN_LIVRAISON',
    DELIVERED:     'LIVREE',
    RECEIVED:      'CONFIRMEE_RECEPTION',
    RELEASED:      'PAIEMENT_LIBERE',
    CANCELLED:     'ANNULEE',
    DISPUTED:      'LITIGE',
    REFUNDED:      'REMBOURSEE',
  };
  
  export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]:     'Paiement en attente',
    [ORDER_STATUS.PAID]:        'Paiement securise',
    [ORDER_STATUS.PREPARING]:   'En preparation',
    [ORDER_STATUS.SHIPPED]:     'En livraison',
    [ORDER_STATUS.IN_DELIVERY]: 'En livraison',
    [ORDER_STATUS.DELIVERED]:   'Livree',
    [ORDER_STATUS.RECEIVED]:    'Reception confirmee',
    [ORDER_STATUS.RELEASED]:    'Vendeur paye',
    [ORDER_STATUS.CANCELLED]:   'Annulee',
    [ORDER_STATUS.DISPUTED]:    'En litige',
    [ORDER_STATUS.REFUNDED]:    'Remboursee',
  };
  
  export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]:     'warning',
    [ORDER_STATUS.PAID]:        'info',
    [ORDER_STATUS.PREPARING]:   'info',
    [ORDER_STATUS.SHIPPED]:     'primary',
    [ORDER_STATUS.IN_DELIVERY]: 'primary',
    [ORDER_STATUS.DELIVERED]:   'success',
    [ORDER_STATUS.CANCELLED]:   'danger',
    [ORDER_STATUS.DISPUTED]:    'danger',
    [ORDER_STATUS.REFUNDED]:    'secondary',
  };

  
  // ─── Escrow Statuses ─────────────────────────────────────────
  export const ESCROW_STATUS = {
    HELD:     'held',
    RELEASED: 'released',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed',
  };
  
  export const ESCROW_STATUS_LABELS = {
    [ESCROW_STATUS.HELD]:     'Funds secured in escrow',
    [ESCROW_STATUS.RELEASED]: 'Funds released to seller',
    [ESCROW_STATUS.REFUNDED]: 'Refunded to buyer',
    [ESCROW_STATUS.DISPUTED]: 'Frozen — dispute in progress',
  };
  
  export const ESCROW_STATUS_COLORS = {
    [ESCROW_STATUS.HELD]:     'warning',
    [ESCROW_STATUS.RELEASED]: 'success',
    [ESCROW_STATUS.REFUNDED]: 'info',
    [ESCROW_STATUS.DISPUTED]: 'danger',
  };
  
  // ─── Payment Statuses ────────────────────────────────────────
  export const PAYMENT_STATUS = {
    PENDING:    'pending',
    PROCESSING: 'processing',
    SUCCESS:    'success',
    FAILED:     'failed',
    CANCELLED:  'cancelled',
    REFUNDED:   'refunded',
  };
  
  export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]:    'Awaiting confirmation',
    [PAYMENT_STATUS.PROCESSING]: 'Processing...',
    [PAYMENT_STATUS.SUCCESS]:    'Payment confirmed',
    [PAYMENT_STATUS.FAILED]:     'Payment failed',
    [PAYMENT_STATUS.CANCELLED]:  'Cancelled',
    [PAYMENT_STATUS.REFUNDED]:   'Refunded',
  };
  
  export const PAYMENT_STATUS_COLORS = {
    [PAYMENT_STATUS.PENDING]:    'warning',
    [PAYMENT_STATUS.PROCESSING]: 'info',
    [PAYMENT_STATUS.SUCCESS]:    'success',
    [PAYMENT_STATUS.FAILED]:     'danger',
    [PAYMENT_STATUS.CANCELLED]:  'secondary',
    [PAYMENT_STATUS.REFUNDED]:   'info',
  };
  
  // ─── Transaction Types ───────────────────────────────────────
  export const TRANSACTION_TYPE = {
    DEPOSIT:        'deposit',
    WITHDRAWAL:     'withdrawal',
    PURCHASE:       'purchase',
    ESCROW_LOCK:    'escrow_lock',
    ESCROW_RELEASE: 'escrow_release',
    REFUND:         'refund',
    POINTS_CREDIT:  'points_credit',
    POINTS_REDEEM:  'points_redeem',
  };
  
  export const TRANSACTION_TYPE_LABELS = {
    [TRANSACTION_TYPE.DEPOSIT]:        'Deposit',
    [TRANSACTION_TYPE.WITHDRAWAL]:     'Withdrawal',
    [TRANSACTION_TYPE.PURCHASE]:       'Purchase',
    [TRANSACTION_TYPE.ESCROW_LOCK]:    'Funds secured',
    [TRANSACTION_TYPE.ESCROW_RELEASE]: 'Funds released',
    [TRANSACTION_TYPE.REFUND]:         'Refund',
    [TRANSACTION_TYPE.POINTS_CREDIT]:  'Points earned',
    [TRANSACTION_TYPE.POINTS_REDEEM]:  'Points converted',
  };
    // ─── Transaction Icons ───────────────────────────────────────
export const TRANSACTION_TYPE_ICONS = {
  [TRANSACTION_TYPE.DEPOSIT]:        '⬇️',
  [TRANSACTION_TYPE.WITHDRAWAL]:     '⬆️',
  [TRANSACTION_TYPE.PURCHASE]:       '🛒',
  [TRANSACTION_TYPE.ESCROW_LOCK]:    '🔒',
  [TRANSACTION_TYPE.ESCROW_RELEASE]: '🔓',
  [TRANSACTION_TYPE.REFUND]:         '💰',
  [TRANSACTION_TYPE.POINTS_CREDIT]:  '⭐',
  [TRANSACTION_TYPE.POINTS_REDEEM]:  '🎁',
};
  
  export const TRANSACTION_TYPE_COLORS = {
    [TRANSACTION_TYPE.DEPOSIT]:        'success',
    [TRANSACTION_TYPE.WITHDRAWAL]:     'warning',
    [TRANSACTION_TYPE.PURCHASE]:       'primary',
    [TRANSACTION_TYPE.ESCROW_LOCK]:    'warning',
    [TRANSACTION_TYPE.ESCROW_RELEASE]: 'success',
    [TRANSACTION_TYPE.REFUND]:         'info',
    [TRANSACTION_TYPE.POINTS_CREDIT]:  'success',
    [TRANSACTION_TYPE.POINTS_REDEEM]:  'info',
  };
  
  // ─── Loyalty / Points System ─────────────────────────────────
  export const LOYALTY = {
    POINTS_PER_1000_FCFA:     1,    // 1 point par 1000 FCFA dépensés (aligné backend)
    MIN_POINTS_TO_REDEEM:   500,    // minimum requis pour convertir en FCFA
    FCFA_PER_POINT:           5,    // 1 point = 5 FCFA lors de l'échange
    MAX_POINTS_USAGE_PERCENT: 30,   // max 30% d'une commande payable en points

    // Clés = valeurs retournées par le backend (PointsFidelite.Niveau)
    TIERS: {
      BRONZE:  { name: 'Bronze',  min: 0,    max: 499,  color: '#CD7F32' },
      ARGENT:  { name: 'Argent',  min: 500,  max: 1999, color: '#A8A9AD' },
      OR:      { name: 'Or',      min: 2000, max: 4999, color: '#FFD700' },
      PLATINE: { name: 'Platine', min: 5000, max: null, color: '#4F46E5' },
    },

    TIER_MULTIPLIERS: {
      BRONZE:  1,
      ARGENT:  1.5,
      OR:      2,
      PLATINE: 3,
    },
  };

  // Helper — points gagnés pour un achat
  export const calcPointsEarned = (amountFcfa, tierKey = 'BRONZE') => {
    const base = Math.floor(amountFcfa / 1000) * LOYALTY.POINTS_PER_1000_FCFA;
    const multiplier = LOYALTY.TIER_MULTIPLIERS[tierKey] ?? 1;
    return Math.floor(base * multiplier);
  };

  // Helper — valeur FCFA d'un nombre de points
  export const calcPointsValue = (points) =>
    points * LOYALTY.FCFA_PER_POINT;

  // Helper — tier à partir du total de points (calcul local)
  export const getTier = (totalPoints) => {
    const entries = Object.entries(LOYALTY.TIERS);
    for (let i = entries.length - 1; i >= 0; i--) {
      const [key, tier] = entries[i];
      if (totalPoints >= tier.min) return { key, ...tier };
    }
    return { key: 'BRONZE', ...LOYALTY.TIERS.BRONZE };
  };

  // Helper — progression vers le prochain tier (%)
  export const getTierProgress = (totalPoints) => {
    const tier = getTier(totalPoints);
    if (!tier.max) return 100;
    const range = tier.max - tier.min;
    const progress = totalPoints - tier.min;
    return Math.min(Math.round((progress / range) * 100), 100);
  };
  
  // ─── User Roles ──────────────────────────────────────────────
  export const ROLES = {
    BUYER:       'buyer',
    SELLER:      'seller',
    TRANSPORTER: 'transporter',
    ADMIN:       'admin',
  };
  
  // ─── Pagination ──────────────────────────────────────────────
  export const PAGE_SIZE = 10;
  
  // ─── Currency ────────────────────────────────────────────────
  export const CURRENCY        = 'FCFA';
  export const CURRENCY_LOCALE = 'fr-BJ';
  
  // ─── App Routes ──────────────────────────────────────────────
  export const ROUTES = {
    HOME:                  '/',
    PRODUCTS:              '/products',
    TRANSPORTERS:          '/transporters',
    NEWS:                  '/news',
    MARKET_PRICES:         '/market-prices',
    HELP:                  '/help',
    CONTACT:               '/contact',
  
    LOGIN:                 '/auth/login',
    REGISTER:              '/auth/register',
    FORGOT_PASSWORD:       '/auth/forgot-password',
    VERIFY_IDENTITY:       '/auth/verify',
  
    BUYER_DASHBOARD:       '/buyer/dashboard',
    BUYER_CATALOG:         '/buyer/catalog',
    BUYER_CART:            '/buyer/cart',
    BUYER_CHECKOUT:        '/buyer/checkout',
    BUYER_ORDERS:          '/buyer/orders',
    BUYER_ORDER_DETAIL:    '/buyer/orders/:id',
    BUYER_TRACKING:        '/buyer/orders/:id/tracking',
    BUYER_POINTS:          '/buyer/points',
    BUYER_PROFILE:         '/buyer/profile',
  
    SELLER_DASHBOARD:      '/seller/dashboard',
    SELLER_PRODUCTS:       '/seller/products',
    SELLER_ADD_PRODUCT:    '/seller/products/add',
    SELLER_EDIT_PRODUCT:   '/seller/products/:id/edit',
    SELLER_ORDERS:         '/seller/orders',
    SELLER_ORDER_DETAIL:   '/seller/orders/:id',
    SELLER_EARNINGS:       '/seller/earnings',
    SELLER_PROFILE:        '/seller/profile',
  
    TRANSPORTER_DASHBOARD:   '/transporter/dashboard',
    TRANSPORTER_VEHICLES:    '/transporter/vehicles',
    TRANSPORTER_ADD_VEHICLE: '/transporter/vehicles/add',
    TRANSPORTER_AVAILABILITY:'/transporter/availability',
    TRANSPORTER_MISSIONS:    '/transporter/missions',
    TRANSPORTER_DELIVERIES:  '/transporter/deliveries',
    TRANSPORTER_PROFILE:     '/transporter/profile',
  
    WALLET:                '/finance/wallet',
    TRANSACTIONS:          '/finance/transactions',
    DEPOSIT:               '/finance/deposit',
    WITHDRAWAL:            '/finance/withdrawal',
    PAYMENT_STATUS:        '/finance/payment-status',
  
    NOT_FOUND:             '/404',
    ACCESS_DENIED:         '/403',
  };
