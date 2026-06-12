import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, CheckCircle, Clock,
  MapPin, Star, Shield, AlertCircle,
  Loader, ArrowLeft, X, Sparkles, AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import TransportService from '../../services/transport.service';

const GREEN = '#1a5c2a';

const ETAPES_ORDRE = ['PAIEMENT_EN_ATTENTE', 'PAIEMENT_RECU', 'EN_PREPARATION', 'EN_LIVRAISON', 'LIVREE', 'CONFIRMEE_RECEPTION', 'PAIEMENT_LIBERE'];

const buildTimeline = (statutCommande, mission) => [
  { id: 'commande',     label: 'Commande passée',       icon: Package,     fait: true },
  { id: 'paiement',     label: 'Paiement sécurisé',     icon: Shield,      fait: ETAPES_ORDRE.indexOf(statutCommande) >= ETAPES_ORDRE.indexOf('PAIEMENT_RECU') },
  { id: 'preparation',  label: 'En préparation',         icon: Clock,       fait: ETAPES_ORDRE.indexOf(statutCommande) >= ETAPES_ORDRE.indexOf('EN_PREPARATION') },
  { id: 'livraison',    label: 'En cours de livraison',  icon: Truck,       fait: ETAPES_ORDRE.indexOf(statutCommande) >= ETAPES_ORDRE.indexOf('EN_LIVRAISON'),
    date: mission?.date_depart ? new Date(mission.date_depart).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null },
  { id: 'livree',       label: 'Livrée',                 icon: CheckCircle, fait: ETAPES_ORDRE.indexOf(statutCommande) >= ETAPES_ORDRE.indexOf('LIVREE'),
    date: mission?.date_arrivee ? new Date(mission.date_arrivee).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : null },
  { id: 'confirme',     label: 'Paiement libéré',        icon: Sparkles,    fait: statutCommande === 'PAIEMENT_LIBERE' },
];

export default function OrderTracking() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [commande,      setCommande]      = useState(null);
  const [mission,       setMission]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [confirming,    setConfirming]    = useState(false);
  const [confirme,      setConfirme]      = useState(false);
  const [note,          setNote]          = useState(0);
  const [commentaire,   setCommentaire]   = useState('');
  const [litige,        setLitige]        = useState(false);
  const [litigeText,    setLitigeText]    = useState('');
  const [litigeEnvoye,  setLitigeEnvoye]  = useState(false);
  const [message,       setMessage]       = useState('');

  useEffect(() => {
    if (!id) { navigate('/buyer/orders'); return; }
    const charger = async () => {
      try {
        const [cmdData, missionData] = await Promise.allSettled([
          OrderService.detail(id),
          TransportService.getMissionDeCommande(id),
        ]);
        if (cmdData.status === 'fulfilled') {
          setCommande(cmdData.value.commande ?? cmdData.value);
        }
        if (missionData.status === 'fulfilled') {
          setMission(missionData.value.mission ?? missionData.value);
        }
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id, navigate]);

  const handleConfirmer = async () => {
    setSubmitting(true);
    try {
      const res = await OrderService.confirmerTripartite(id);
      setCommande(prev => ({
        ...prev,
        confirme_acheteur:     res.confirme_acheteur     ?? prev.confirme_acheteur,
        confirme_vendeur:      res.confirme_vendeur      ?? prev.confirme_vendeur,
        confirme_transporteur: res.confirme_transporteur ?? prev.confirme_transporteur,
        statut: res.message?.includes('libéré') ? 'PAIEMENT_LIBERE' : prev.statut,
      }));
      if (res.message?.includes('libéré')) {
        setConfirme(true);
        if (note > 0) {
          try { await OrderService.noterVendeur(id, { note, commentaire }); } catch { /* silencieux */ }
        }
      } else {
        setMessage(res.message || 'Confirmation enregistrée.');
      }
    } catch {
      setMessage('Erreur lors de la confirmation. Réessayez.');
    } finally { setSubmitting(false); }
  };

  const handleLitige = async () => {
    if (!litigeText.trim()) return;
    setSubmitting(true);
    try {
      await OrderService.signalerLitige(id, litigeText);
      setLitigeEnvoye(true);
    } catch {
      setMessage('Erreur lors du signalement.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <DashboardLayout role="buyer">
      <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader size={28} />
        </motion.div>
      </div>
    </DashboardLayout>
  );

  if (!commande) return (
    <DashboardLayout role="buyer">
      <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
        <p>Commande introuvable.</p>
        <Link to="/buyer/orders" style={{ color: GREEN, fontWeight: '700' }}>← Mes commandes</Link>
      </div>
    </DashboardLayout>
  );

  const statut       = commande.statut || 'PAIEMENT_EN_ATTENTE';
  const timeline     = buildTimeline(statut, mission);
  const ref          = commande.reference || `#${String(id).slice(0, 8).toUpperCase()}`;
  const vendeur      = commande.vendeur_nom || '—';
  const transporteur = commande.transporteur_nom || mission?.transporteur_nom || '—';
  const montant      = Number(commande.montant_total || 0);
  const adresse      = commande.adresse_livraison || '—';
  const dateCmd      = commande.created_at ? new Date(commande.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const dejaConfirme     = commande.confirme_acheteur;
  const peutConfirmer    = ['EN_LIVRAISON', 'LIVREE'].includes(statut) && !dejaConfirme && !confirme;
  const peutSignaler     = !['PAIEMENT_EN_ATTENTE', 'ANNULEE', 'PAIEMENT_LIBERE'].includes(statut);

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* En-tête */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
        >
          <Link to="/buyer/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: GREEN, textDecoration: 'none', fontWeight: '600', fontSize: '0.88rem' }}>
            <ArrowLeft size={16} /> Mes commandes
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} /> Suivi de commande</h1>
          <span style={{ fontSize: '0.78rem', background: '#f0fdf4', color: GREEN, padding: '3px 10px', borderRadius: '20px', fontWeight: '700', fontFamily: 'monospace' }}>{ref}</span>
        </motion.div>

        {/* Message flash */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#dc2626', display: 'flex', justifyContent: 'space-between' }}
            >
              {message}
              <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex' }}><X size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="row g-4">
          <div className="col-12 col-lg-8">

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color={GREEN} /> Suivi de livraison
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {timeline.map((etape, i) => {
                  const Icon   = etape.icon;
                  const isLast = i === timeline.length - 1;
                  return (
                    <div key={etape.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', paddingBottom: isLast ? 0 : '1.5rem' }}>
                      {!isLast && (
                        <div style={{ position: 'absolute', left: '19px', top: '38px', width: '2px', height: 'calc(100% - 20px)', background: etape.fait ? GREEN : '#e5e7eb', zIndex: 0 }} />
                      )}
                      <motion.div
                        style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, background: etape.fait ? GREEN : '#f4f6f4', border: etape.fait ? 'none' : '2px solid #e5e7eb' }}
                        animate={etape.fait && i === timeline.filter(e => e.fait).length - 1 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Icon size={16} color={etape.fait ? 'white' : '#9ca3af'} />
                      </motion.div>
                      <div style={{ flex: 1, paddingTop: '8px' }}>
                        <div style={{ fontWeight: etape.fait ? '700' : '400', fontSize: '0.92rem', color: etape.fait ? '#1a2e10' : '#9ca3af', marginBottom: '3px' }}>
                          {etape.label}
                        </div>
                        {etape.date && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{etape.date}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Confirmation réception + note vendeur */}
            <AnimatePresence>
              {peutConfirmer && !litigeEnvoye && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} color={GREEN} /> Avez-vous reçu votre commande ?
                  </h3>

                  {/* Badges confirmations tripartites */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {[
                      { label: 'Acheteur',     done: commande.confirme_acheteur },
                      { label: 'Vendeur',      done: commande.confirme_vendeur  },
                      { label: 'Transporteur', done: commande.confirme_transporteur },
                    ].map(({ label, done }) => (
                      <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: done ? '#dcfce7' : '#f3f4f6', color: done ? '#16a34a' : '#6b7280', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {done ? <CheckCircle size={12} /> : <Clock size={12} />} {label}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #86efac', marginBottom: '1.2rem' }}>
                    <Shield size={16} color={GREEN} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: GREEN, marginBottom: '4px' }}>Votre argent est encore protégé</div>
                      <div style={{ fontSize: '0.82rem', color: '#374151' }}>
                        <strong>{montant.toLocaleString('fr-FR')} FCFA</strong> sont bloqués. Confirmez la réception pour libérer le paiement au vendeur.
                      </div>
                    </div>
                  </div>

                  {!confirming ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <motion.button onClick={() => setConfirming(true)} style={btnConfirmerStyle} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <CheckCircle size={16} /> Oui, j'ai reçu ma commande
                      </motion.button>
                      {peutSignaler && (
                        <motion.button onClick={() => setLitige(true)} style={btnLitigeStyle} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <AlertCircle size={16} /> Signaler un problème
                        </motion.button>
                      )}
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <label style={labelStyle}>Notez votre expérience *</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <motion.button key={n} onClick={() => setNote(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Star size={32} color="#f0c040" fill={n <= note ? '#f0c040' : 'transparent'} />
                          </motion.button>
                        ))}
                      </div>
                      {note > 0 && (
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#d97706', marginBottom: '12px', display: 'block' }}>
                          {['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent !'][note]}
                        </span>
                      )}
                      <label style={{ ...labelStyle, marginTop: '10px' }}>Commentaire (optionnel)</label>
                      <textarea
                        value={commentaire} onChange={e => setCommentaire(e.target.value)}
                        placeholder="Décrivez votre expérience..." rows={3}
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1rem', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <motion.button onClick={() => setConfirming(false)} style={btnAnnulerStyle} whileHover={{ scale: 1.02 }}>Annuler</motion.button>
                        <motion.button onClick={handleConfirmer} disabled={submitting || note === 0} style={{ ...btnConfirmerStyle, opacity: (submitting || note === 0) ? 0.7 : 1, flex: 1 }} whileHover={{ scale: submitting ? 1 : 1.02 }}>
                          {submitting ? <><Loader size={16} /><span> Envoi…</span></> : <><CheckCircle size={16} /><span> Confirmer et payer le vendeur</span></>}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Litige inline */}
                  <AnimatePresence>
                    {litige && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: '#fef2f2', borderRadius: '14px', padding: '1.2rem', border: '1px solid #fecaca', marginTop: '1rem' }}
                      >
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem' }}>
                          <AlertCircle size={16} color="#dc2626" /> Signaler un problème
                        </h4>
                        <textarea
                          value={litigeText} onChange={e => setLitigeText(e.target.value)}
                          placeholder="Décrivez le problème rencontré..." rows={3}
                          style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #fecaca', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <motion.button onClick={() => setLitige(false)} style={btnAnnulerStyle} whileHover={{ scale: 1.02 }}>Annuler</motion.button>
                          <motion.button onClick={handleLitige} disabled={submitting || !litigeText.trim()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', opacity: (submitting || !litigeText.trim()) ? 0.7 : 1 }} whileHover={{ scale: 1.02 }}>
                            {submitting ? 'Envoi…' : <><AlertCircle size={15} /> Envoyer le signalement</>}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Succès confirmation */}
            <AnimatePresence>
              {confirme && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #4db86a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}
                  >
                    <CheckCircle size={48} color="white" />
                  </motion.div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Livraison confirmée ! <Sparkles size={22} color="#d97706" /></h3>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1.2rem' }}>
                    Le paiement de <strong style={{ color: GREEN }}>{montant.toLocaleString('fr-FR')} FCFA</strong> a été libéré au vendeur <strong>{vendeur}</strong>.
                  </p>
                  <Link to="/buyer/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: GREEN, color: 'white', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' }}>
                    Voir mes commandes
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Litige envoyé */}
            <AnimatePresence>
              {litigeEnvoye && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><AlertTriangle size={48} color="#F59E0B" /></div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.6rem' }}>Signalement envoyé</h3>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1.2rem' }}>
                    L'argent restera bloqué pendant l'examen du litige. Notre équipe vous contactera sous 24h.
                  </p>
                  <Link to="/buyer/orders" style={{ display: 'inline-flex', alignItems: 'center', background: '#dc2626', color: 'white', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', textDecoration: 'none' }}>
                    Retour à mes commandes
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Sidebar détails */}
          <div className="col-12 col-lg-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ background: 'white', borderRadius: '16px', padding: '1.3rem', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={16} /> Détails de la commande</h4>

              {[
                { label: 'Référence',    value: ref          },
                { label: 'Vendeur',      value: vendeur      },
                { label: 'Transporteur', value: transporteur },
                { label: 'Date',         value: dateCmd      },
                { label: 'Adresse',      value: adresse      },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.85rem' }}>
                  <span style={{ color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontWeight: '600', color: '#1a2e10', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: '10px', padding: '0.8rem', margin: '1rem 0', border: '1px solid #86efac' }}>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Montant bloqué</span>
                <span style={{ fontWeight: '800', color: GREEN, fontSize: '1.05rem' }}>{montant.toLocaleString('fr-FR')} FCFA</span>
              </div>

              {mission?.ville_depart && mission?.ville_arrivee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', borderRadius: '10px', padding: '0.8rem', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#d97706' }}>
                  <MapPin size={14} />
                  <span>{mission.ville_depart} → {mission.ville_arrivee}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const btnConfirmerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: GREEN, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' };
const btnLitigeStyle    = { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '0.85rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' };
const btnAnnulerStyle   = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.85rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' };
const labelStyle        = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };
