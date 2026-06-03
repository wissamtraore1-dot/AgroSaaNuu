// src/Components/common/NotificationBell.jsx
// Cloche de notifications avec panel dropdown.
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Package, DollarSign, Truck, Zap, Tag } from 'lucide-react';
import NotificationService from '../../services/notification.service';

const GREEN = '#1a5c2a';

const TYPE_ICONS = {
  COMMANDE:    { Icon: Package,    color: '#3b82f6', bg: '#eff6ff' },
  PAIEMENT:    { Icon: DollarSign, color: '#16a34a', bg: '#f0fdf4' },
  LIVRAISON:   { Icon: Truck,      color: '#8b5cf6', bg: '#f5f3ff' },
  SYSTEME:     { Icon: Zap,        color: '#6b7280', bg: '#f9fafb' },
  PROMOTION:   { Icon: Tag,        color: '#f59e0b', bg: '#fffbeb' },
  ALERTE_PRIX: { Icon: Tag,        color: '#ef4444', bg: '#fef2f2' },
};

export default function NotificationBell() {
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const charger = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getNonLues(),
      ]);
      setNotifs(r1.results || r1.notifications || []);
      setNonLues(r2.non_lues || 0);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    charger();
    const id = setInterval(charger, 30_000); // Polling toutes les 30s
    return () => clearInterval(id);
  }, [charger]);

  // Fermer en cliquant en dehors
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const marquerToutesLues = async () => {
    try {
      await NotificationService.marquerToutesLues();
      setNonLues(0);
      setNotifs(n => n.map(x => ({ ...x, est_lue: true })));
    } catch { /* silencieux */ }
  };

  const marquerLue = async (id) => {
    try {
      await NotificationService.marquerLue(id);
      setNotifs(n => n.map(x => x.id === id ? { ...x, est_lue: true } : x));
      setNonLues(c => Math.max(0, c - 1));
    } catch { /* silencieux */ }
  };

  const fmtDate = d => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60)   return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return new Date(d).toLocaleDateString('fr-FR');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Cloche */}
      <motion.button
        onClick={() => { setOpen(v => !v); if (!open) charger(); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ position: 'relative', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <Bell size={20} color={nonLues > 0 ? GREEN : '#6b7280'} />
        <AnimatePresence>
          {nonLues > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}
            >
              {nonLues > 9 ? '9+' : nonLues}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '340px', background: 'white', borderRadius: '16px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.16)', border: '1px solid #e5e7eb',
              zIndex: 9999, overflow: 'hidden',
            }}
          >
            {/* Header dropdown */}
            <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1a2e10' }}>
                Notifications {nonLues > 0 && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>({nonLues})</span>}
              </h4>
              {nonLues > 0 && (
                <button onClick={marquerToutesLues} style={{ background: 'none', border: 'none', color: GREEN, fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} /> Tout lire
                </button>
              )}
            </div>

            {/* Liste */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                  <Bell size={28} color="#d1d5db" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0 }}>Aucune notification</p>
                </div>
              ) : notifs.slice(0, 30).map(n => {
                const { Icon, color, bg } = TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEME;
                return (
                  <div key={n.id}
                    onClick={() => { if (!n.est_lue) marquerLue(n.id); if (n.lien) window.location.href = n.lien; }}
                    style={{
                      padding: '0.9rem 1.2rem', cursor: 'pointer', display: 'flex', gap: '10px',
                      background: n.est_lue ? 'white' : '#fafff9',
                      borderBottom: '1px solid #f9fafb',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = n.est_lue ? 'white' : '#fafff9'}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: n.est_lue ? '500' : '700', color: '#1a2e10', lineHeight: 1.3 }}>
                        {n.titre}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.77rem', color: '#6b7280', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.message}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#9ca3af' }}>{fmtDate(n.created_at)}</p>
                    </div>
                    {!n.est_lue && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GREEN, marginTop: '4px', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
