// ============================================================
// AgroConnect — Wallet Card
// src/components/finance/WalletCard.jsx
// ============================================================
import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const WalletCard = ({ balance = {}, loading = false, compact = false }) => {
  const navigate = useNavigate();
  const { available = 0, in_escrow = 0 } = balance;

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.skeleton} />
        <div style={{ ...styles.skeleton, width: '60%', marginTop: '8px' }} />
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ ...styles.label, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CreditCard size={14} /> My Wallet</span>
        <button
          style={styles.historyBtn}
          onClick={() => navigate(ROUTES.TRANSACTIONS)}
        >
          History
        </button>
      </div>

      {/* Available balance */}
      <div style={styles.amount}>{formatPrice(available)}</div>
      <div style={styles.subLabel}>Available balance</div>

      {/* Escrow row */}
      {in_escrow > 0 && (
        <div style={styles.escrowRow}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Lock size={12} /> In escrow</span>
          <span style={{ fontWeight: 600 }}>{formatPrice(in_escrow)}</span>
        </div>
      )}

      {/* Actions */}
      {!compact && (
        <div style={styles.actions}>
          <button
            style={{ ...styles.btn, background: '#16A34A' }}
            onClick={() => navigate(ROUTES.DEPOSIT)}
          >
            + Deposit
          </button>
          <button
            style={{ ...styles.btn, background: '#0066B3' }}
            onClick={() => navigate(ROUTES.WITHDRAWAL)}
          >
            ↑ Withdraw
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background:   'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    borderRadius: '16px',
    padding:      '20px',
    color:        '#fff',
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '12px',
  },
  label: {
    fontSize:  '14px',
    opacity:   0.85,
    fontWeight: 500,
  },
  historyBtn: {
    background:   'rgba(255,255,255,0.2)',
    border:       'none',
    borderRadius: '20px',
    color:        '#fff',
    padding:      '4px 12px',
    fontSize:     '12px',
    cursor:       'pointer',
  },
  amount: {
    fontSize:   '28px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  subLabel: {
    fontSize:     '13px',
    opacity:      0.75,
    marginBottom: '12px',
  },
  escrowRow: {
    display:         'flex',
    justifyContent:  'space-between',
    alignItems:      'center',
    background:      'rgba(255,255,255,0.15)',
    borderRadius:    '8px',
    padding:         '8px 12px',
    fontSize:        '13px',
    marginBottom:    '12px',
  },
  actions: {
    display: 'flex',
    gap:     '10px',
    marginTop: '4px',
  },
  btn: {
    flex:         1,
    border:       'none',
    borderRadius: '10px',
    color:        '#fff',
    padding:      '10px',
    fontWeight:   600,
    fontSize:     '14px',
    cursor:       'pointer',
  },
  skeleton: {
    background:   'rgba(255,255,255,0.2)',
    borderRadius: '6px',
    height:       '24px',
    width:        '100%',
    animation:    'pulse 1.5s infinite',
  },
};

export default WalletCard;