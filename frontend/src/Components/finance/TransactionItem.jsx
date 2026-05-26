// ============================================================
// AgroConnect — Transaction Item
// src/components/finance/TransactionItem.jsx
// ============================================================
import React from 'react';
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_COLORS,
  TRANSACTION_TYPE_ICONS,
} from '../../utils/constants';
import { formatPrice, formatRelativeTime } from '../../utils/formatPrice';
import Badge from '../ui/Badge';

const TransactionItem = ({ transaction, onClick }) => {
  const {
    type,
    amount,
    created_at,
    reference,
    status,
  } = transaction;

  const isCredit = ['deposit', 'escrow_release', 'refund', 'points_redeem']
    .includes(type);

  const label  = TRANSACTION_TYPE_LABELS[type]  || type;
  const color  = TRANSACTION_TYPE_COLORS[type]  || 'info';
  const icon   = TRANSACTION_TYPE_ICONS[type]   || '•';

  return (
    <div
      onClick={onClick}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '12px',
        padding:       '12px 0',
        borderBottom:  '1px solid var(--bs-border-color, #e5e7eb)',
        cursor:        onClick ? 'pointer' : 'default',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width:          '40px',
        height:         '40px',
        borderRadius:   '50%',
        background:     '#F1EFE8',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '18px',
        flexShrink:     0,
      }}>
        {icon}
      </div>

      {/* Label + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '14px' }}>{label}</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
          {formatRelativeTime(created_at)}
          {reference && (
            <span style={{ marginLeft: '8px', opacity: 0.6 }}>#{reference}</span>
          )}
        </div>
      </div>

      {/* Amount + badge */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize:   '15px',
          color:      isCredit ? '#3B6D11' : '#9B1C1C',
        }}>
          {isCredit ? '+' : '-'}{formatPrice(amount)}
        </div>
        {status && (
          <div style={{ marginTop: '4px' }}>
            <Badge variant={color}>{status}</Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;