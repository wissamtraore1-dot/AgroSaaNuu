import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, ArrowLeft, Package, DollarSign, Truck, Info, Tag } from 'lucide-react';
import NotificationService from '../services/notification.service';

const TYPE_CONFIG = {
  COMMANDE:    { icon: Package,    color: '#2563eb', bg: '#eff6ff' },
  PAIEMENT:    { icon: DollarSign, color: '#16a34a', bg: '#f0fdf4' },
  LIVRAISON:   { icon: Truck,      color: '#d97706', bg: '#fffbeb' },
  PROMOTION:   { icon: Tag,        color: '#7c3aed', bg: '#f5f3ff' },
  ALERTE_PRIX: { icon: Tag,        color: '#dc2626', bg: '#fef2f2' },
  SYSTEME:     { icon: Info,       color: '#6b7280', bg: '#f9fafb' },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const charger = async () => {
    try {
      const data = await NotificationService.mesNotifications();
      setNotifications(Array.isArray(data) ? data : data.results ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const marquerLue = async (id) => {
    await NotificationService.marquerLue(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lue: true } : n));
  };

  const toutLire = async () => {
    await NotificationService.toutLire();
    setNotifications(prev => prev.map(n => ({ ...n, est_lue: true })));
  };

  const nonLues = notifications.filter(n => !n.est_lue).length;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <motion.button
          onClick={() => navigate(-1)}
          style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#374151', fontWeight: '600' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft size={15} /> Retour
        </motion.button>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} /> Notifications
            {nonLues > 0 && (
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '20px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>
                {nonLues}
              </span>
            )}
          </h1>
        </div>

        {nonLues > 0 && (
          <motion.button
            onClick={toutLire}
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#16a34a', fontWeight: '600' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <CheckCheck size={14} /> Tout marquer lu
          </motion.button>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Chargement…</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Aucune notification pour l'instant</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEME;
            const IconComp = cfg.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: notif.est_lue ? 'white' : '#fefce8',
                  border: `1.5px solid ${notif.est_lue ? '#e5e7eb' : '#fde68a'}`,
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: notif.lien ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (!notif.est_lue) marquerLue(notif.id);
                  if (notif.lien) navigate(notif.lien);
                }}
              >
                {/* Icône type */}
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={18} color={cfg.color} />
                </div>

                {/* Texte */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 3px', fontWeight: notif.est_lue ? '500' : '700', fontSize: '0.9rem', color: '#1a2e10' }}>
                    {notif.titre}
                  </p>
                  <p style={{ margin: '0 0 5px', fontSize: '0.82rem', color: '#6b7280' }}>
                    {notif.message}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                    {new Date(notif.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Marquer lu */}
                {!notif.est_lue && (
                  <motion.button
                    onClick={e => { e.stopPropagation(); marquerLue(notif.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#16a34a' }}
                    whileHover={{ scale: 1.1 }} title="Marquer comme lue"
                  >
                    <Check size={16} />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
