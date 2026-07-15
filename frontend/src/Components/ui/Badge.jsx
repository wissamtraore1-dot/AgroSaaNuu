// ============================================================
// AgroSaaNuu — Badge Component
// src/components/ui/Badge.jsx
// ============================================================
import React from 'react';

const VARIANTS = {
  success:   { bg: '#EAF3DE', color: '#3B6D11', dot: '#639922' },
  danger:    { bg: '#FDE8E8', color: '#9B1C1C', dot: '#E02424' },
  warning:   { bg: '#FEF3C7', color: '#92400E', dot: '#D97706' },
  info:      { bg: '#E6F1FB', color: '#185FA5', dot: '#378ADD' },
  primary:   { bg: '#EEF2FF', color: '#3730A3', dot: '#4F46E5' },
  secondary: { bg: '#F1EFE8', color: '#5F5E5A', dot: '#9CA3AF' },
};

const Badge = ({ variant = 'info', dot = false, children, className = '' }) => {
  const style = VARIANTS[variant] || VARIANTS.info;

  return (
    <span
      className={className}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '5px',
        padding:       '3px 10px',
        borderRadius:  '20px',
        fontSize:      '12px',
        fontWeight:    500,
        background:    style.bg,
        color:         style.color,
        whiteSpace:    'nowrap',
      }}
    >
      {dot && (
        <span style={{
          width:        '6px',
          height:       '6px',
          borderRadius: '50%',
          background:   style.dot,
          flexShrink:   0,
        }} />
      )}
      {children}
    </span>
  );
};

export default Badge;