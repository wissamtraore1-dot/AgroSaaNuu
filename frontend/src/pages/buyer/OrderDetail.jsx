import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Package, CheckCircle, Truck, Star,
  AlertTriangle, MapPin, Loader, X,
} from 'lucide-react';
import OrderService from '../../services/order.service';
import DashboardLayout from '../../Components/layout/DashboardLayout';

const STATUT_LABEL = {
  PAIEMENT_EN_ATTENTE:  { label: 'Paiement en attente', color: '#d97706', bg: '#fffbeb' },
  PAIEMENT_RECU:        { label: 'Paiement sécurisé',   color: '#2563eb', bg: '#eff6ff' },
  EN_PREPARATION:       { label: 'En préparation',       color: '#7c3aed', bg: '#f5f3ff' },
  EN_LIVRAISON:         { label: 'En livraison',         color: '#0891b2', bg: '#ecfeff' },
  LIVREE:               { label: 'Livrée',               color: '#16a34a', bg: '#f0fdf4' },
  CONFIRMEE_RECEPTION:  { label: 'Réception confirmée',  color: '#059669', bg: '#ecfdf5' },
  PAIEMENT_LIBERE:      { label: 'Clôturée',             color: '#15803d', bg: '#f0fdf4' },
  ANNULEE:              { label: 'Annulée',              color: '#dc2626', bg: '#fef2f2' },
  LITIGE:               { label: 'En litige',            color: '#dc2626', bg: '#fef2f2' },
  // legacy aliases (au cas où)
  EN_ATTENTE:           { label: 'En attente',           color: '#d97706', bg: '#fffbeb' },
  ANNULE:               { label: 'Annulée',              color: '#dc2626', bg: '#fef2f2' },
};

const GREEN = '#1a5c2a';

export default function BuyerOrderDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [commande,      setCommande]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [action,        setAction]        = useState('');   // 'reception' | 'noter' | 'litige'
  const [noteVendeur,   setNoteVendeur]   = useState(0);
  const [commentaire,   setCommentaire]   = useState('');
  const [descLitige,    setDescLitige]    = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [message,       setMessage]       = useState('');

  useEffect(() => {
    OrderService.detail(id)
      .then(data => setCommande(data.commande ?? data))
      .catch(() => setMessage('Commande introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const statut = commande?.statut || commande?.status || '';
  const cfg    = STATUT_LABEL[statut] || { label: statut, color: '#6b7280', bg: '#f9fafb' };

  // ── Confirmer la réception (système tripartite) ──
  const confirmerReception = async () => {
    setSubmitting(true);
    try {
      const res = await OrderService.confirmerTripartite(id);
      const toutLibere = res.message?.includes('libéré');
      setCommande(prev => ({
        ...prev,
        confirme_acheteur:     res.confirme_acheteur     ?? true,
        confirme_vendeur:      res.confirme_vendeur      ?? prev.confirme_vendeur,
        confirme_transporteur: res.confirme_transporteur ?? prev.confirme_transporteur,
        statut: toutLibere ? 'PAIEMENT_LIBERE' : prev.statut,
      }));
      if (toutLibere) {
        setMessage('Paiement libéré au vendeur ! Vous pouvez maintenant évaluer votre expérience.');
        setAction('noter');
      } else {
        setMessage(res.message || 'Confirmation enregistrée. En attente des autres parties.');
        setAction('');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la confirmation. Réessayez.');
    } finally { setSubmitting(false); }
  };

  // ── Noter le vendeur ──
  const soumettreNote = async () => {
    if (noteVendeur === 0) { setMessage('Sélectionnez une note.'); return; }
    setSubmitting(true);
    try {
      await OrderService.noterVendeur(id, { note: noteVendeur, commentaire });
      setMessage('Merci pour votre évaluation !');
      setAction('done');
    } catch {
      setMessage('Erreur lors de l\'envoi de la note.');
    } finally { setSubmitting(false); }
  };

  // ── Signaler un problème ──
  const signalerProbleme = async () => {
    if (!descLitige.trim()) { setMessage('Décrivez le problème.'); return; }
    setSubmitting(true);
    try {
      await OrderService.signalerLitige(id, descLitige);
      setMessage('Problème signalé. Notre équipe va traiter votre demande.');
      setAction('');
      setDescLitige('');
    } catch {
      setMessage('Erreur lors du signalement.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
      <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!commande) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
      Commande introuvable.
    </div>
  );

  const items   = commande.items || commande.lignes || [];
  const total   = commande.total || commande.montant_total || 0;
  const ref     = commande.reference || commande.numero || `#${id.slice(0, 8).toUpperCase()}`;
  const vendeur = commande.vendeur_nom || commande.vendeur?.nom_complet || 'Vendeur';

  const peutConfirmerReception = ['EN_LIVRAISON', 'LIVREE'].includes(statut) && !commande?.confirme_acheteur;
  const peutNoter              = ['CONFIRMEE_RECEPTION', 'PAIEMENT_LIBERE'].includes(statut) && action !== 'done';
  const peutSignaler           = !['PAIEMENT_EN_ATTENTE', 'ANNULEE', 'ANNULE', 'PAIEMENT_LIBERE'].includes(statut);

  return (
    <DashboardLayout role="buyer">
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Retour */}
      <motion.button
        onClick={() => navigate('/buyer/orders')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '1.2rem' }}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
      >
        <ArrowLeft size={15} /> Mes commandes
      </motion.button>

      {/* Message flash */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="order-message"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#15803d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            {message}
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d', display: 'flex' }}><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête commande */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid #e5e7eb', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' }}>Commande {ref}</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>
              {commande.created_at ? new Date(commande.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
            </p>
          </div>
          <span style={{ background: cfg.bg, color: cfg.color, borderRadius: '20px', padding: '4px 14px', fontWeight: '700', fontSize: '0.82rem' }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151' }}>
          Vendeur : <strong>{vendeur}</strong>
        </p>
      </div>

      {/* Articles */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid #e5e7eb', marginBottom: '12px' }}>
        <p style={{ margin: '0 0 12px', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Package size={16} /> Articles ({items.length})
        </p>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <img
              src={item.image || item.produit_image || '/assets/images/placeholder.png'}
              alt={item.nom || item.name}
              style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2px', fontWeight: '600', fontSize: '0.9rem', color: '#1a2e10' }}>{item.nom || item.name}</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                {item.quantite || item.qty} × {Number(item.prix_unitaire || item.price).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>
              {((item.quantite || item.qty) * (item.prix_unitaire || item.price)).toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontWeight: '800', fontSize: '1rem', color: '#1a2e10' }}>
          <span>Total</span>
          <span style={{ color: GREEN }}>{Number(total).toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      {/* Suivi livraison */}
      {['EN_LIVRAISON', 'LIVREE', 'CONFIRMEE_RECEPTION', 'PAIEMENT_LIBERE'].includes(statut) && (
        <motion.button
          onClick={() => navigate(`/buyer/orders/${id}/tracking`)}
          style={{ width: '100%', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', color: '#2563eb', cursor: 'pointer', marginBottom: '12px', fontSize: '0.9rem' }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        >
          <MapPin size={16} /> Suivre la livraison
        </motion.button>
      )}

      {/* ── CONFIRMER LA RÉCEPTION ── */}
      {peutConfirmerReception && action !== 'reception' && (
        <motion.button
          onClick={() => setAction('reception')}
          style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(26,92,42,0.25)' }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        >
          <CheckCircle size={18} /> Confirmer la réception
        </motion.button>
      )}

      <AnimatePresence>
        {action === 'reception' && (
          <motion.div
            key="reception-panel"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1.25rem', marginBottom: '12px' }}
          >
            <p style={{ margin: '0 0 10px', fontWeight: '700', color: '#15803d' }}>Confirmer la réception</p>
            <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#374151' }}>
              En confirmant, vous certifiez avoir bien reçu votre commande. Le paiement sera libéré au vendeur.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button
                onClick={confirmerReception}
                disabled={submitting}
                style={{ flex: 1, background: GREEN, color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: '700', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                whileHover={{ scale: 1.02 }}
              >
                {submitting ? 'Envoi…' : 'Oui, j\'ai reçu ma commande'}
              </motion.button>
              <motion.button
                onClick={() => setAction('')}
                style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.75rem 1rem', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
                whileHover={{ scale: 1.02 }}
              >
                Annuler
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ÉVALUER LE VENDEUR (extends Confirmer réception) ── */}
      {(peutNoter || action === 'noter') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '1.25rem', marginBottom: '12px' }}
        >
          <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" /> Évaluer le vendeur
          </p>
          <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#6b7280' }}>
            Votre avis aide les autres acheteurs.
          </p>

          {/* Étoiles */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <motion.button
                key={n}
                onClick={() => setNoteVendeur(n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
              >
                <Star
                  size={28}
                  color="#f59e0b"
                  fill={n <= noteVendeur ? '#f59e0b' : 'none'}
                />
              </motion.button>
            ))}
          </div>

          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Laissez un commentaire (optionnel)…"
            rows={3}
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '0.7rem', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />

          <motion.button
            onClick={soumettreNote}
            disabled={submitting || noteVendeur === 0}
            style={{ marginTop: '10px', width: '100%', background: noteVendeur === 0 ? '#e5e7eb' : '#f59e0b', color: noteVendeur === 0 ? '#9ca3af' : 'white', border: 'none', borderRadius: '10px', padding: '0.8rem', fontWeight: '700', cursor: noteVendeur === 0 ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
            whileHover={{ scale: noteVendeur > 0 ? 1.01 : 1 }}
          >
            {submitting ? 'Envoi…' : 'Envoyer mon évaluation'}
          </motion.button>
        </motion.div>
      )}

      {/* ── SIGNALER UN PROBLÈME ── */}
      {peutSignaler && (
        <>
          {action !== 'litige' ? (
            <motion.button
              onClick={() => setAction('litige')}
              style={{ width: '100%', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', color: '#dc2626', cursor: 'pointer', fontSize: '0.88rem' }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            >
              <AlertTriangle size={16} /> Signaler un problème
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '14px', padding: '1.25rem' }}
            >
              <p style={{ margin: '0 0 10px', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} /> Signaler un problème
              </p>
              <textarea
                value={descLitige}
                onChange={e => setDescLitige(e.target.value)}
                placeholder="Décrivez le problème rencontré…"
                rows={3}
                style={{ width: '100%', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '0.7rem', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <motion.button
                  onClick={signalerProbleme}
                  disabled={submitting}
                  style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: '700', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {submitting ? 'Envoi…' : 'Envoyer le signalement'}
                </motion.button>
                <motion.button
                  onClick={() => { setAction(''); setDescLitige(''); }}
                  style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.75rem 1rem', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
                  whileHover={{ scale: 1.02 }}
                >
                  Annuler
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}

    </div>
    </DashboardLayout>
  );
}
