// ============================================================
// AgroConnect — Payment Status Page
// src/pages/finance/PaymentStatus.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../utils/constants';

const CONFIG = {
  success: {
    icon:    '✅',
    color:   '#16A34A',
    bg:      '#F0FDF4',
    border:  '#86EFAC',
    title:   'Payment Successful',
  },
  failed: {
    icon:    '❌',
    color:   '#DC2626',
    bg:      '#FEF2F2',
    border:  '#FECACA',
    title:   'Payment Failed',
  },
  pending: {
    icon:    '⏳',
    color:   '#D97706',
    bg:      '#FFFBEB',
    border:  '#FCD34D',
    title:   'Payment Pending',
  },
};

const MESSAGES = {
  success: {
    deposit:    (amt) => `${formatPrice(amt)} has been added to your wallet.`,
    withdrawal: (amt) => `${formatPrice(amt)} is being sent to your mobile money.`,
    purchase:   (amt) => `${formatPrice(amt)} secured in escrow. Funds release after delivery.`,
  },
  failed: {
    default: 'Something went wrong. Please try again or use a different method.',
  },
  pending: {
    default: 'Your payment is being processed. This may take a few minutes.',
  },
};

const PaymentStatus = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [counter, setCounter] = useState(5);

  const {
    status = 'pending',
    type   = 'purchase',
    amount = 0,
    orderId,
  } = location.state || {};

  const cfg = CONFIG[status] || CONFIG.pending;

  const getMessage = () => {
    if (status === 'success' && MESSAGES.success[type]) {
      return MESSAGES.success[type](amount);
    }
    if (status === 'failed') return MESSAGES.failed.default;
    return MESSAGES.pending.default;
  };

  // Auto-redirect for success
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setInterval(() => {
      setCounter(c => {
        if (c <= 1) {
          clearInterval(timer);
          handlePrimary();
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const handlePrimary = () => {
    if (type === 'purchase' && orderId) {
      navigate(`/buyer/orders/${orderId}/tracking`);
    } else if (type === 'deposit' || type === 'withdrawal') {
      navigate(ROUTES.WALLET);
    } else {
      navigate(ROUTES.BUYER_DASHBOARD);
    }
  };

  const handleSecondary = () => {
    navigate(-1);
  };

  return (
    <div style={styles.wrap}>
      <div style={{ ...styles.card, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>

        {/* Icon */}
        <div style={{ fontSize: '64px', marginBottom: '16px', lineHeight: 1 }}>
          {cfg.icon}
        </div>

        {/* Title */}
        <h4 style={{ ...styles.title, color: cfg.color }}>
          {cfg.title}
        </h4>

        {/* Amount */}
        {amount > 0 && (
          <div style={{ ...styles.amount, color: cfg.color }}>
            {formatPrice(amount)}
          </div>
        )}

        {/* Message */}
        <p style={styles.message}>{getMessage()}</p>

        {/* Escrow notice for purchases */}
        {status === 'success' && type === 'purchase' && (
          <div style={styles.escrowBox}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <div>
              <div style={styles.escrowTitle}>Funds are secured</div>
              <div style={styles.escrowText}>
                The seller receives payment only after you confirm delivery.
                You have 72h to confirm before auto-release.
              </div>
            </div>
          </div>
        )}

        {/* Auto-redirect countdown */}
        {status === 'success' && (
          <div style={styles.countdown}>
            Redirecting in {counter}s...
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={handlePrimary}>
            {type === 'purchase' && orderId ? 'Track Order' : 'Go to Wallet'}
          </button>
          {status === 'failed' && (
            <button style={styles.secondaryBtn} onClick={handleSecondary}>
              Try Again
            </button>
          )}
          <button
            style={styles.ghostBtn}
            onClick={() => navigate(ROUTES.BUYER_DASHBOARD)}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap: {
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '24px 16px',
    background:     '#F9FAFB',
  },
  card: {
    maxWidth:     '440px',
    width:        '100%',
    borderRadius: '20px',
    padding:      '40px 28px',
    textAlign:    'center',
  },
  title: {
    fontSize:     '22px',
    fontWeight:   700,
    marginBottom: '8px',
  },
  amount: {
    fontSize:     '32px',
    fontWeight:   700,
    marginBottom: '12px',
  },
  message: {
    fontSize:     '14px',
    color:        '#374151',
    lineHeight:   1.6,
    marginBottom: '20px',
  },
  escrowBox: {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          '12px',
    background:   '#FEF3C7',
    borderRadius: '12px',
    padding:      '14px',
    textAlign:    'left',
    marginBottom: '20px',
  },
  escrowTitle: {
    fontWeight:   600,
    fontSize:     '14px',
    color:        '#92400E',
    marginBottom: '4px',
  },
  escrowText: {
    fontSize: '12px',
    color:    '#92400E',
    opacity:  0.85,
  },
  countdown: {
    fontSize:     '13px',
    color:        '#6B7280',
    marginBottom: '16px',
  },
  actions: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '10px',
  },
  primaryBtn: {
    padding:      '13px',
    background:   '#16A34A',
    color:        '#fff',
    border:       'none',
    borderRadius: '12px',
    fontWeight:   700,
    fontSize:     '15px',
    cursor:       'pointer',
  },
  secondaryBtn: {
    padding:      '13px',
    background:   '#fff',
    color:        '#DC2626',
    border:       '1.5px solid #DC2626',
    borderRadius: '12px',
    fontWeight:   600,
    fontSize:     '15px',
    cursor:       'pointer',
  },
  ghostBtn: {
    padding:      '10px',
    background:   'transparent',
    color:        '#6B7280',
    border:       'none',
    borderRadius: '12px',
    fontWeight:   500,
    fontSize:     '14px',
    cursor:       'pointer',
  },
};

export default PaymentStatus;