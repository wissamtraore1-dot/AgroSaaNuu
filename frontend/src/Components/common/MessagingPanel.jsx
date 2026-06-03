// src/Components/common/MessagingPanel.jsx
// Panneau de messagerie interne (acheteur ↔ vendeur ↔ transporteur).
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OrderService from '../../services/order.service';

const GREEN = '#1a5c2a';

const ROLE_COLORS = {
  BUYER:       { bg: '#eff6ff', color: '#1d4ed8', label: 'Acheteur' },
  SELLER:      { bg: '#f0fdf4', color: GREEN,     label: 'Vendeur'  },
  TRANSPORTER: { bg: '#f5f3ff', color: '#7c3aed', label: 'Transporteur' },
};

/**
 * Props:
 *  - commandeId : string UUID
 *  - height     : string CSS — hauteur du panneau (default: '400px')
 */
export default function MessagingPanel({ commandeId, height = '400px' }) {
  const { user }   = useAuth();
  const [messages, setMessages] = useState([]);
  const [contenu,  setContenu]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState('');
  const bottomRef  = useRef(null);
  const pollRef    = useRef(null);

  const charger = useCallback(async () => {
    try {
      const res = await OrderService.getMessages(commandeId);
      setMessages(res.messages || []);
    } catch { /* silencieux */ }
  }, [commandeId]);

  // Chargement initial + polling toutes les 10s
  useEffect(() => {
    setLoading(true);
    charger().finally(() => setLoading(false));
    pollRef.current = setInterval(charger, 10_000);
    return () => clearInterval(pollRef.current);
  }, [charger]);

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    const texte = contenu.trim();
    if (!texte) return;
    setSending(true); setError('');
    try {
      const res = await OrderService.envoyerMessage(commandeId, texte);
      setMessages(prev => [...prev, res.message]);
      setContenu('');
    } catch {
      setError('Erreur envoi message');
    } finally { setSending(false); }
  };

  const fmtTime = d => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  let lastDate = '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height, background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px', background: '#fafafa' }}>
        <MessageCircle size={18} color={GREEN} />
        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>Messages</span>
        <span style={{ fontSize: '0.76rem', color: '#9ca3af', marginLeft: 'auto' }}>
          {messages.length} message{messages.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Corps messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem', color: '#9ca3af' }}>
            <Loader size={20} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
            <MessageCircle size={28} color="#d1d5db" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '0.84rem', margin: 0 }}>Aucun message. Démarrez la conversation.</p>
          </div>
        ) : messages.map(msg => {
          const isMine   = msg.expediteur === user?.id || msg.expediteur_nom === user?.nom_complet;
          const roleInfo = ROLE_COLORS[msg.expediteur_role] || ROLE_COLORS.BUYER;
          const dateStr  = fmtDate(msg.created_at);
          const showDate = dateStr !== lastDate;
          lastDate = dateStr;

          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.72rem', color: '#9ca3af', position: 'relative' }}>
                  <span style={{ background: 'white', padding: '0 8px', position: 'relative', zIndex: 1 }}>{dateStr}</span>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#f3f4f6', zIndex: 0 }} />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '78%' }}>
                  {!isMine && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: roleInfo.color }}>{msg.expediteur_nom}</span>
                      <span style={{ fontSize: '0.65rem', background: roleInfo.bg, color: roleInfo.color, borderRadius: '4px', padding: '1px 5px' }}>{roleInfo.label}</span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '0.55rem 0.85rem',
                      background: isMine ? GREEN : '#f3f4f6',
                      color: isMine ? 'white' : '#1a2e10',
                      borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '0.87rem', lineHeight: 1.4, wordBreak: 'break-word',
                    }}
                  >
                    {msg.contenu}
                  </motion.div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: '#9ca3af', textAlign: isMine ? 'right' : 'left' }}>
                    {fmtTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSend}
        style={{ padding: '0.7rem 1rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', background: '#fafafa' }}
      >
        {error && <p style={{ margin: 0, fontSize: '0.76rem', color: '#dc2626', width: '100%' }}>{error}</p>}
        <input
          type="text" value={contenu} onChange={e => setContenu(e.target.value)}
          placeholder="Écrire un message…"
          style={{ flex: 1, padding: '0.62rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.88rem', outline: 'none', color: '#1a2e10', background: 'white' }}
        />
        <motion.button type="submit" disabled={!contenu.trim() || sending}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
          style={{ background: GREEN, border: 'none', borderRadius: '12px', padding: '0 14px', cursor: contenu.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: contenu.trim() ? 1 : 0.5 }}
        >
          {sending ? <Loader size={16} color="white" /> : <Send size={16} color="white" />}
        </motion.button>
      </form>
    </div>
  );
}
