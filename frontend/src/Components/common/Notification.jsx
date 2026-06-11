// ============================================================
// AgroConnect — Notification Toast System
// src/components/common/Notification.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';

const ICONS = {
  success: <CheckCircle size={18} color="#16A34A" />,
  error:   <XCircle    size={18} color="#DC2626" />,
  warning: <AlertTriangle size={18} color="#D97706" />,
  info:    <Info       size={18} color="#3B82F6" />,
};

const COLORS = {
  success: { bg: '#F0FDF4', border: '#86EFAC', title: '#15803D', text: '#166534', progress: '#16A34A' },
  error:   { bg: '#FEF2F2', border: '#FECACA', title: '#9B1C1C', text: '#991B1B', progress: '#DC2626' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', title: '#92400E', text: '#78350F', progress: '#D97706' },
  info:    { bg: '#EFF6FF', border: '#BFDBFE', title: '#1E40AF', text: '#1E3A8A', progress: '#3B82F6' },
};

const Toast = ({ notification, onDismiss }) => {
  const { id, type = 'info', title, message } = notification;
  const [visible,  setVisible]  = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = COLORS[type] || COLORS.info;

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar
  useEffect(() => {
    const duration = type === 'error' ? 6000 : 4000;
    const interval = 50;
    const step     = (interval / duration) * 100;
    const timer    = setInterval(() => {
      setProgress(p => {
        if (p <= 0) { clearInterval(timer); return 0; }
        return p - step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [type]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      style={{
        ...styles.toast,
        background:   cfg.bg,
        border:       `1.5px solid ${cfg.border}`,
        opacity:      visible ? 1 : 0,
        transform:    visible ? 'translateX(0)' : 'translateX(120%)',
        transition:   'all .3s ease',
      }}
    >
      {/* Progress bar */}
      <div style={{
        ...styles.progressBar,
        width:      `${progress}%`,
        background: cfg.progress,
      }} />

      {/* Content */}
      <div style={styles.content}>
        <span style={styles.icon}>{ICONS[type] || ICONS.info}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div style={{ ...styles.toastTitle, color: cfg.title }}>
              {title}
            </div>
          )}
          {message && (
            <div style={{ ...styles.toastMsg, color: cfg.text }}>
              {message}
            </div>
          )}
        </div>
        <button style={styles.closeBtn} onClick={handleDismiss}><X size={14} color="#9CA3AF" /></button>
      </div>
    </div>
  );
};

const Notification = () => {
  const { notifications, dismiss } = useNotificationContext();

  if (notifications.length === 0) return null;

  return (
    <div style={styles.container}>
      {notifications.map(n => (
        <Toast key={n.id} notification={n} onDismiss={dismiss} />
      ))}
    </div>
  );
};

const styles = {
  container: {
    position:      'fixed',
    top:           '20px',
    right:         '20px',
    zIndex:        9999,
    display:       'flex',
    flexDirection: 'column',
    gap:           '10px',
    maxWidth:      '380px',
    width:         '100%',
  },
  toast: {
    borderRadius:  '14px',
    overflow:      'hidden',
    boxShadow:     '0 4px 20px rgba(0,0,0,0.08)',
    position:      'relative',
  },
  progressBar: {
    height:     '3px',
    transition: 'width .05s linear',
  },
  content: {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        '10px',
    padding:    '12px 14px',
  },
  icon: {
    fontSize:  '18px',
    flexShrink: 0,
    lineHeight: 1.4,
  },
  toastTitle: {
    fontSize:     '14px',
    fontWeight:   700,
    marginBottom: '2px',
  },
  toastMsg: {
    fontSize:   '13px',
    lineHeight: 1.5,
  },
  closeBtn: {
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    fontSize:   '12px',
    color:      '#9CA3AF',
    padding:    '0',
    flexShrink: 0,
    lineHeight: 1.4,
  },
};

export default Notification;