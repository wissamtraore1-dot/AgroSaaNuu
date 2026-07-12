// ============================================================
// AgroConnect — Notification Context
// src/context/NotificationContext.jsx
// ============================================================
import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let _id = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback(({
    type    = 'info',   // 'success' | 'error' | 'warning' | 'info'
    title,
    message,
    duration = 4000,
  }) => {
    const id = ++_id;
    setNotifications(prev => [...prev, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // ── Shortcuts ─────────────────────────────────────────────
  const success = useCallback((message, title = 'Success') =>
    notify({ type: 'success', title, message }), [notify]);

  const error = useCallback((message, title = 'Error') =>
    notify({ type: 'error', title, message, duration: 6000 }), [notify]);

  const warning = useCallback((message, title = 'Warning') =>
    notify({ type: 'warning', title, message }), [notify]);

  const info = useCallback((message, title = 'Info') =>
    notify({ type: 'info', title, message }), [notify]);

  // ── Domain-specific notifications ─────────────────────────
  const notifyPaymentSuccess = (amount) =>
    success(`Payment of ${amount.toLocaleString('fr-BJ')} FCFA confirmed. Funds are secured.`, 'Paiement sécurisé');

  const notifyPaymentFailed = () =>
    error('Payment failed. Please try again or use a different method.', 'Paiement échoué');

  const notifyDeliveryConfirmed = () =>
    success('Delivery confirmed! Funds have been released to the seller.', 'Livraison confirmée');

  const notifyFundsReleased = (amount) =>
    success(`${amount.toLocaleString('fr-BJ')} FCFA released to your wallet.`, 'Fonds libérés');

  return (
    <NotificationContext.Provider value={{
      notifications,
      notify,
      dismiss,
      success,
      error,
      warning,
      info,
      notifyPaymentSuccess,
      notifyPaymentFailed,
      notifyDeliveryConfirmed,
      notifyFundsReleased,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used inside NotificationProvider');
  return ctx;
};