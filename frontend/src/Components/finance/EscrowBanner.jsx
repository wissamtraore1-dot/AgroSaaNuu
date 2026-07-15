// ============================================================
// AgroSaaNuu — Escrow Banner
// src/components/finance/EscrowBanner.jsx
// ============================================================
import React from 'react';
import { Lock, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { ESCROW_STATUS, ESCROW_STATUS_LABELS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatPrice';

const CONFIG = {
  [ESCROW_STATUS.HELD]: {
    bg:      '#FEF3C7',
    border:  '#D97706',
    color:   '#92400E',
    Icon:    Lock,
    title:   'Funds Secured',
  },
  [ESCROW_STATUS.RELEASED]: {
    bg:      '#EAF3DE',
    border:  '#639922',
    color:   '#3B6D11',
    Icon:    CheckCircle,
    title:   'Funds Released',
  },
  [ESCROW_STATUS.REFUNDED]: {
    bg:      '#E6F1FB',
    border:  '#378ADD',
    color:   '#185FA5',
    Icon:    RefreshCw,
    title:   'Refunded',
  },
  [ESCROW_STATUS.DISPUTED]: {
    bg:      '#FDE8E8',
    border:  '#E02424',
    color:   '#9B1C1C',
    Icon:    AlertTriangle,
    title:   'Dispute Opened',
  },
};

const EscrowBanner = ({ status, amount, autoReleaseIn = null, onConfirm = null }) => {
  const cfg = CONFIG[status] || CONFIG[ESCROW_STATUS.HELD];
  const label = ESCROW_STATUS_LABELS[status];
  const CfgIcon = cfg.Icon;

  return (
    <div style={{
      background:   cfg.bg,
      border:       `1.5px solid ${cfg.border}`,
      borderRadius: '12px',
      padding:      '14px 18px',
      display:      'flex',
      alignItems:   'flex-start',
      gap:          '12px',
    }}>
      <span style={{ lineHeight: 1, display: 'inline-flex' }}><CfgIcon size={22} color={cfg.color} /></span>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: cfg.color, marginBottom: '2px' }}>
          {cfg.title}
          {amount && (
            <span style={{ fontWeight: 400, marginLeft: '8px' }}>
              — {formatPrice(amount)}
            </span>
          )}
        </div>
        <div style={{ fontSize: '13px', color: cfg.color, opacity: 0.85 }}>
          {label}
        </div>
        {autoReleaseIn && status === ESCROW_STATUS.HELD && (
          <div style={{ fontSize: '12px', color: cfg.color, opacity: 0.7, marginTop: '4px' }}>
            Auto-release in {autoReleaseIn}h if no action taken
          </div>
        )}
      </div>

      {/* Confirm delivery button — shown to buyer only */}
      {onConfirm && status === ESCROW_STATUS.HELD && (
        <button
          onClick={onConfirm}
          style={{
            background:   cfg.border,
            color:        '#fff',
            border:       'none',
            borderRadius: '8px',
            padding:      '8px 16px',
            fontSize:     '13px',
            fontWeight:   600,
            cursor:       'pointer',
            whiteSpace:   'nowrap',
          }}
        >
          Confirm Receipt
        </button>
      )}
    </div>
  );
};

export default EscrowBanner;