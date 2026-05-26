import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock,
  MapPin, Star, Shield, AlertCircle,
  Loader, Phone, MessageSquare, ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const commande = {
  id:          'AGR-CMD-12345678',
  produit:     'Maïs blanc 2t',
  vendeur:     'Moussa K.',
  transporteur:'Kofi T.',
  montant:     185000,
  date:        '10 Mai 2026',
  adresse:     'Quartier Cadjèhoun, Cotonou',
  statut:      'en_livraison', // en_attente | confirmee | en_livraison | livree | litigee
};

const etapesLivraison = [
  { id: 'commande',    label: 'Commande passée',       icon: Package,      date: '10 Mai 09:00', fait: true  },
  { id: 'paiement',   label: 'Paiement sécurisé',      icon: Shield,       date: '10 Mai 09:01', fait: true  },
  { id: 'preparation',label: 'Préparation en cours',   icon: Clock,        date: '10 Mai 10:30', fait: true  },
  { id: 'livraison',  label: 'En cours de livraison',  icon: Truck,        date: '11 Mai 08:00', fait: true  },
  { id: 'livree',     label: 'Livraison confirmée',    icon: CheckCircle,  date: '—',            fait: false },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function OrderTracking() {
  const [confirming,  setConfirming]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [confirme,    setConfirme]    = useState(false);
  const [note,        setNote]        = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [litige,      setLitige]      = useState(false);
  const [litigeText,  setLitigeText]  = useState('');
  const [litigeEnvoye,setLitigeEnvoye]= useState(false);

  const handleConfirmer = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirme(true);
    }, 2000);
  };

  const handleLitige = () => {
    setLitigeEnvoye(true);
  };

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={styles.header}>
          <Link to="/buyer/orders" style={styles.btnRetour}>
            <ArrowLeft size={16} /> Mes commandes
          </Link>
          <h1 style={styles.headerTitle}>📦 Suivi de commande</h1>
          <span style={styles.commandeId}>{commande.id}</span>
        </motion.div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">

            {/* ===== TIMELINE ===== */}
            <motion.div
              style={styles.card}
              variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
            >
              <h3 style={styles.cardTitle}>
                <Truck size={18} color="#1a5c2a" /> Suivi de livraison
              </h3>

              <div style={styles.timeline}>
                {etapesLivraison.map((etape, i) => {
                  const Icon = etape.icon;
                  const isLast = i === etapesLivraison.length - 1;
                  return (
                    <div key={etape.id} style={styles.timelineItem}>
                      {/* LIGNE */}
                      {!isLast && (
                        <div style={{
                          ...styles.timelineLine,
                          background: etape.fait ? '#1a5c2a' : '#e5e7eb',
                        }} />
                      )}

                      {/* CERCLE */}
                      <motion.div
                        style={{
                          ...styles.timelineCircle,
                          background: etape.fait ? '#1a5c2a' : '#f4f6f4',
                          border:     etape.fait ? 'none' : '2px solid #e5e7eb',
                        }}
                        animate={etape.fait && !isLast ? {} : etape.fait ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Icon size={16} color={etape.fait ? 'white' : '#9ca3af'} />
                      </motion.div>

                      {/* CONTENU */}
                      <div style={styles.timelineContent}>
                        <div style={{
                          ...styles.timelineLabel,
                          color: etape.fait ? '#1a2e10' : '#9ca3af',
                          fontWeight: etape.fait ? '700' : '400',
                        }}>
                          {etape.label}
                        </div>
                        <div style={styles.timelineDate}>{etape.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* ===== CONFIRMATION LIVRAISON ===== */}
            <AnimatePresence>
              {!confirme && !litigeEnvoye && (
                <motion.div
                  style={styles.card}
                  variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
                >
                  <h3 style={styles.cardTitle}>
                    <CheckCircle size={18} color="#1a5c2a" /> Avez-vous reçu votre commande ?
                  </h3>

                  <div style={styles.escrowInfo}>
                    <Shield size={16} color="#1a5c2a" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={styles.escrowTitle}>Votre argent est encore protégé</div>
                      <div style={styles.escrowDesc}>
                        <strong>{commande.montant.toLocaleString('fr-FR')} FCFA</strong> sont bloqués en séquestre.
                        Confirmez la réception pour libérer le paiement au vendeur.
                      </div>
                    </div>
                  </div>

                  {!confirming ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <motion.button
                        style={styles.btnConfirmer}
                        onClick={() => setConfirming(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle size={16} /> Oui, j'ai reçu ma commande
                      </motion.button>
                      <motion.button
                        style={styles.btnLitige}
                        onClick={() => setLitige(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <AlertCircle size={16} /> Signaler un problème
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      {/* NOTE */}
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Notez votre expérience *</label>
                        <div style={styles.starsWrap}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <motion.button
                              key={n}
                              onClick={() => setNote(n)}
                              style={styles.starBtn}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Star
                                size={32}
                                color="#f0c040"
                                fill={n <= note ? '#f0c040' : 'transparent'}
                              />
                            </motion.button>
                          ))}
                        </div>
                        {note > 0 && (
                          <span style={styles.noteLabel}>
                            {note === 1 ? '😞 Très mauvais' : note === 2 ? '😕 Mauvais' : note === 3 ? '😐 Moyen' : note === 4 ? '😊 Bien' : '🤩 Excellent !'}
                          </span>
                        )}
                      </div>

                      {/* COMMENTAIRE */}
                      <div style={styles.fieldWrap}>
                        <label style={styles.label}>Commentaire (optionnel)</label>
                        <textarea
                          placeholder="Décrivez votre expérience..."
                          value={commentaire}
                          onChange={(e) => setCommentaire(e.target.value)}
                          style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                          rows={3}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <motion.button
                          style={styles.btnBack}
                          onClick={() => setConfirming(false)}
                          whileHover={{ scale: 1.02 }}
                        >
                          Annuler
                        </motion.button>
                        <motion.button
                          style={{ ...styles.btnConfirmer, opacity: loading ? 0.8 : 1 }}
                          onClick={handleConfirmer}
                          disabled={loading || note === 0}
                          whileHover={{ scale: loading ? 1 : 1.02 }}
                          whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                          {loading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                              <Loader size={16} />
                            </motion.div>
                          ) : (
                            <>
                              <CheckCircle size={16} />
                              Confirmer et payer le vendeur
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* LITIGE */}
                  <AnimatePresence>
                    {litige && (
                      <motion.div
                        style={styles.litigeBox}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <h4 style={styles.litigeTitle}>
                          <AlertCircle size={16} color="#dc2626" /> Signaler un problème
                        </h4>
                        <textarea
                          placeholder="Décrivez le problème rencontré..."
                          value={litigeText}
                          onChange={(e) => setLitigeText(e.target.value)}
                          style={{ ...styles.input, minHeight: '80px' }}
                          rows={3}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <motion.button style={styles.btnBack} onClick={() => setLitige(false)} whileHover={{ scale: 1.02 }}>
                            Annuler
                          </motion.button>
                          <motion.button
                            style={styles.btnSignaler}
                            onClick={handleLitige}
                            disabled={!litigeText.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <AlertCircle size={15} /> Envoyer le signalement
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== SUCCÈS CONFIRMATION ===== */}
            <AnimatePresence>
              {confirme && (
                <motion.div
                  style={{ ...styles.card, textAlign: 'center' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    style={styles.successIcon}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  >
                    <CheckCircle size={48} color="white" />
                  </motion.div>
                  <h3 style={styles.successTitle}>Livraison confirmée ! 🎉</h3>
                  <p style={styles.successDesc}>
                    Vous avez confirmé la réception de votre commande. Le paiement de{' '}
                    <strong style={{ color: '#1a5c2a' }}>{commande.montant.toLocaleString('fr-FR')} FCFA</strong>{' '}
                    a été libéré au vendeur <strong>{commande.vendeur}</strong>. Merci pour votre confiance !
                  </p>
                  {note > 0 && (
                    <div style={styles.noteConfirm}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} size={20} color="#f0c040" fill={n <= note ? '#f0c040' : 'transparent'} />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>Merci pour votre avis !</div>
                    </div>
                  )}
                  <Link to="/buyer/orders" style={styles.btnRetourCommandes}>
                    Voir mes commandes
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== LITIGE ENVOYÉ ===== */}
            <AnimatePresence>
              {litigeEnvoye && (
                <motion.div
                  style={{ ...styles.card, textAlign: 'center' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                  <h3 style={{ ...styles.successTitle, color: '#dc2626' }}>Signalement envoyé</h3>
                  <p style={styles.successDesc}>
                    Votre signalement a été transmis à notre équipe. L'argent restera bloqué en séquestre pendant l'examen du litige. Nous vous contacterons sous 24h.
                  </p>
                  <Link to="/buyer/orders" style={{ ...styles.btnRetourCommandes, background: '#dc2626', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}>
                    Retour à mes commandes
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* SIDEBAR */}
          <div className="col-12 col-lg-4">
            <motion.div
              style={styles.sidebarCard}
              variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
            >
              <h4 style={styles.sidebarTitle}>📋 Détails de la commande</h4>

              {[
                { label: 'Produit',      value: commande.produit      },
                { label: 'Vendeur',      value: commande.vendeur      },
                { label: 'Transporteur', value: commande.transporteur },
                { label: 'Date',         value: commande.date         },
                { label: 'Adresse',      value: commande.adresse      },
              ].map((row, i) => (
                <div key={i} style={styles.detailRow}>
                  <span style={styles.detailLabel}>{row.label}</span>
                  <span style={styles.detailValue}>{row.value}</span>
                </div>
              ))}

              <div style={styles.montantBox}>
                <span style={styles.detailLabel}>Montant bloqué</span>
                <span style={styles.montantVal}>{commande.montant.toLocaleString('fr-FR')} FCFA</span>
              </div>

              {/* CONTACTER */}
              <div style={styles.contactBox}>
                <h5 style={styles.contactTitle}>Contacter</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <motion.button style={styles.contactBtn} whileHover={{ x: 3 }}>
                    <Phone size={15} color="#1a5c2a" />
                    <span>Appeler le vendeur</span>
                  </motion.button>
                  <motion.button style={styles.contactBtn} whileHover={{ x: 3 }}>
                    <MessageSquare size={15} color="#1a5c2a" />
                    <span>Message au transporteur</span>
                  </motion.button>
                  <motion.button style={styles.contactBtn} whileHover={{ x: 3 }}>
                    <Phone size={15} color="#2563eb" />
                    <span style={{ color: '#2563eb' }}>Support AgroConnect</span>
                  </motion.button>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

// ===== STYLES =====
const styles = {
  header:      { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  headerTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  commandeId:  { fontSize: '0.78rem', background: '#f0fdf4', color: '#1a5c2a', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', fontFamily: 'monospace' },
  btnRetour:   { display: 'flex', alignItems: 'center', gap: '6px', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600', fontSize: '0.88rem' },

  card:        { background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '1rem' },
  cardTitle:   { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' },

  // TIMELINE
  timeline:        { display: 'flex', flexDirection: 'column', gap: '0' },
  timelineItem:    { display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', paddingBottom: '1.5rem' },
  timelineLine:    { position: 'absolute', left: '19px', top: '38px', width: '2px', height: 'calc(100% - 20px)', zIndex: 0 },
  timelineCircle:  { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 },
  timelineContent: { flex: 1, paddingTop: '8px' },
  timelineLabel:   { fontSize: '0.92rem', marginBottom: '3px' },
  timelineDate:    { fontSize: '0.75rem', color: '#9ca3af' },

  // ESCROW
  escrowInfo:  { display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #86efac', marginBottom: '1.2rem' },
  escrowTitle: { fontWeight: '700', fontSize: '0.88rem', color: '#1a5c2a', marginBottom: '4px' },
  escrowDesc:  { fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 },

  // CONFIRMATION
  starsWrap:   { display: 'flex', gap: '8px', marginBottom: '6px' },
  starBtn:     { background: 'none', border: 'none', cursor: 'pointer', padding: '2px' },
  noteLabel:   { fontSize: '0.85rem', fontWeight: '600', color: '#d97706' },
  fieldWrap:   { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' },
  label:       { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input:       { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit' },

  // LITIGE
  litigeBox:   { background: '#fef2f2', borderRadius: '14px', padding: '1.2rem', border: '1px solid #fecaca', marginTop: '1rem' },
  litigeTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem' },

  // BOUTONS
  btnConfirmer:{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  btnLitige:   { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '0.85rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  btnSignaler: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  btnBack:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.85rem 1.2rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },

  // SUCCÈS
  successIcon:       { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' },
  successTitle:      { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.6rem' },
  successDesc:       { fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1.2rem' },
  noteConfirm:       { background: '#fffbeb', borderRadius: '10px', padding: '0.8rem', marginBottom: '1.2rem' },
  btnRetourCommandes:{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1a5c2a', color: 'white', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },

  // SIDEBAR
  sidebarCard:   { background: 'white', borderRadius: '16px', padding: '1.3rem', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' },
  sidebarTitle:  { fontSize: '0.95rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1rem' },
  detailRow:     { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.85rem' },
  detailLabel:   { color: '#6b7280' },
  detailValue:   { fontWeight: '600', color: '#1a2e10', textAlign: 'right', maxWidth: '60%' },
  montantBox:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', borderRadius: '10px', padding: '0.8rem', margin: '1rem 0', border: '1px solid #86efac' },
  montantVal:    { fontWeight: '800', color: '#1a5c2a', fontSize: '1.05rem' },
  contactBox:    { borderTop: '1px solid #f0f0f0', paddingTop: '1rem' },
  contactTitle:  { fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.7rem' },
  contactBtn:    { display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.6rem 0.9rem', fontSize: '0.82rem', fontWeight: '600', color: '#1a2e10', cursor: 'pointer', width: '100%', transition: 'all 0.2s' },
};