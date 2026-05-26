import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, MapPin, Smartphone, Building,
  CheckCircle, AlertCircle, Loader, Shield,
  Lock, ChevronRight, Info, Clock, Truck,
  ArrowLeft, Package, Star
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const produit = {
  id:          1,
  nom:         'Maïs blanc 2t',
  vendeur:     'Moussa K.',
  noteVendeur: 4.9,
  localisation:'Bankoura',
  prix:        180000,
  quantite:    1,
  image:       'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&q=80',
};

const modesPaiement = [
  {
    id:      'mtn',
    label:   'MTN Mobile Money',
    numero:  '+229 01 XX XX XX',
    icon:    Smartphone,
    color:   '#f59e0b',
    bg:      '#fffbeb',
    border:  '#fcd34d',
    frais:   1,
    delai:   'Instantané',
    logo:    '🟡',
  },
  {
    id:      'moov',
    label:   'Moov Money',
    numero:  '+229 02 XX XX XX',
    icon:    Smartphone,
    color:   '#2563eb',
    bg:      '#eff6ff',
    border:  '#93c5fd',
    frais:   1,
    delai:   'Instantané',
    logo:    '🔵',
  },
  {
    id:      'celtis',
    label:   'Celtis Cash',
    numero:  '+229 03 XX XX XX',
    icon:    Smartphone,
    color:   '#7c3aed',
    bg:      '#f5f3ff',
    border:  '#c4b5fd',
    frais:   0.5,
    delai:   'Instantané',
    logo:    '🟣',
  },
  {
    id:      'bank',
    label:   'Virement bancaire',
    numero:  'BJ XX XXXX XXXX',
    icon:    Building,
    color:   '#1a5c2a',
    bg:      '#f0fdf4',
    border:  '#86efac',
    frais:   0,
    delai:   '1 à 3 jours',
    logo:    '🏦',
  },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function Checkout() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState(1); // 1: recap, 2: paiement, 3: confirmation, 4: succès
  const [modeSelect,  setModeSelect]  = useState(null);
  const [adresse,     setAdresse]     = useState('');
  const [telephone,   setTelephone]   = useState('');
  const [note,        setNote]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [codeOTP,     setCodeOTP]     = useState('');
  const [otpEnvoye,   setOtpEnvoye]   = useState(false);

  const modeActif  = modesPaiement.find((m) => m.id === modeSelect);
  const fraisMontant = modeActif ? Math.round(produit.prix * modeActif.frais / 100) : 0;
  const fraisLivraison = 5000;
  const total = produit.prix + fraisMontant + fraisLivraison;

  const handleNextStep1 = () => {
    if (!adresse.trim()) { setError('Veuillez entrer votre adresse de livraison.'); return; }
    if (!telephone.trim()) { setError('Veuillez entrer votre numéro de téléphone.'); return; }
    setError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!modeSelect) { setError('Veuillez choisir un mode de paiement.'); return; }
    setError('');
    setStep(3);
  };

  const handleEnvoyerOTP = () => {
    setOtpEnvoye(true);
  };

  const handlePayer = () => {
    if (modeActif?.id !== 'bank' && !codeOTP) {
      setError('Veuillez entrer le code OTP reçu.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 2500);
  };

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* EN-TÊTE */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.header}
        >
          <button style={styles.btnRetour} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 style={styles.headerTitle}>🛒 Finaliser ma commande</h1>
        </motion.div>

        {/* STEPPER */}
        <motion.div
          style={styles.stepper}
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
        >
          {['Livraison', 'Paiement', 'Confirmation', 'Succès'].map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <motion.div
                style={{
                  ...styles.stepCircle,
                  background: i + 1 < step  ? '#1a5c2a'
                            : i + 1 === step ? '#f0c040' : '#e5e7eb',
                  color:      i + 1 < step  ? 'white'
                            : i + 1 === step ? '#1a2e10' : '#9ca3af',
                }}
                animate={{ scale: i + 1 === step ? 1.15 : 1 }}
              >
                {i + 1 < step
                  ? <CheckCircle size={14} />
                  : <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>{i + 1}</span>
                }
              </motion.div>
              <span style={{
                ...styles.stepLabel,
                color:      i + 1 === step ? '#1a2e10' : '#9ca3af',
                fontWeight: i + 1 === step ? '700' : '400',
              }}>
                {s}
              </span>
              {i < 3 && (
                <div style={{
                  ...styles.stepLine,
                  background: i + 1 < step ? '#1a5c2a' : '#e5e7eb',
                }} />
              )}
            </div>
          ))}
        </motion.div>

        <div className="row g-4">

          {/* ===== CONTENU PRINCIPAL ===== */}
          <div className="col-12 col-lg-8">
            <AnimatePresence mode="wait">

              {/* ===== ÉTAPE 1 — LIVRAISON ===== */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  style={styles.card}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 style={styles.cardTitle}>
                    <Truck size={18} color="#1a5c2a" /> Informations de livraison
                  </h3>

                  <AnimatePresence>
                    {error && (
                      <motion.div style={styles.errorBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AlertCircle size={15} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ADRESSE */}
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>
                      <MapPin size={14} color="#1a5c2a" /> Adresse de livraison *
                    </label>
                    <textarea
                      placeholder="Ex: Quartier Cadjèhoun, Rue 12, Cotonou"
                      value={adresse}
                      onChange={(e) => { setAdresse(e.target.value); setError(''); }}
                      style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                      rows={3}
                    />
                  </div>

                  {/* TÉLÉPHONE */}
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>
                      <Smartphone size={14} color="#1a5c2a" /> Téléphone de contact *
                    </label>
                    <input
                      type="tel"
                      placeholder="+229 XX XX XX XX"
                      value={telephone}
                      onChange={(e) => { setTelephone(e.target.value); setError(''); }}
                      style={styles.input}
                    />
                  </div>

                  {/* NOTE */}
                  <div style={styles.fieldWrap}>
                    <label style={styles.label}>Note pour le vendeur (optionnel)</label>
                    <textarea
                      placeholder="Instructions spéciales, point de repère..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      style={{ ...styles.input, minHeight: '70px', resize: 'vertical' }}
                      rows={2}
                    />
                  </div>

                  {/* INFO ESCROW */}
                  <div style={styles.escrowBox}>
                    <Shield size={16} color="#1a5c2a" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={styles.escrowTitle}>Paiement sécurisé par séquestre</div>
                      <div style={styles.escrowDesc}>
                        Votre argent sera bloqué jusqu'à confirmation de la livraison. Le vendeur sera payé uniquement après que vous ayez confirmé la réception.
                      </div>
                    </div>
                  </div>

                  <motion.button
                    style={styles.btnNext}
                    onClick={handleNextStep1}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continuer vers le paiement <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              )}

              {/* ===== ÉTAPE 2 — PAIEMENT ===== */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  style={styles.card}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 style={styles.cardTitle}>
                    <Lock size={18} color="#1a5c2a" /> Choisissez votre mode de paiement
                  </h3>

                  <AnimatePresence>
                    {error && (
                      <motion.div style={styles.errorBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AlertCircle size={15} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                    {modesPaiement.map((m) => {
                      const Icon     = m.icon;
                      const isActive = modeSelect === m.id;
                      const fraisMontantM = Math.round(produit.prix * m.frais / 100);
                      return (
                        <motion.div
                          key={m.id}
                          style={{
                            ...styles.modeCard,
                            borderColor: isActive ? m.color : '#e5e7eb',
                            background:  isActive ? m.bg    : 'white',
                            boxShadow:   isActive ? `0 0 0 3px ${m.color}22` : 'none',
                          }}
                          onClick={() => { setModeSelect(m.id); setError(''); }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* LOGO */}
                          <div style={{ ...styles.modeIconWrap, background: m.bg }}>
                            <span style={{ fontSize: '1.4rem' }}>{m.logo}</span>
                          </div>

                          {/* INFOS */}
                          <div style={{ flex: 1 }}>
                            <div style={styles.modeLabel}>{m.label}</div>
                            <div style={styles.modeMeta}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={11} /> {m.delai}
                              </span>
                              <span>
                                Frais : {m.frais === 0 ? 'Gratuit' : `${m.frais}% (${fraisMontantM.toLocaleString('fr-FR')} FCFA)`}
                              </span>
                            </div>
                          </div>

                          {/* CHECK */}
                          {isActive ? (
                            <motion.div
                              style={{ ...styles.modeCheck, background: m.color }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle size={14} color="white" />
                            </motion.div>
                          ) : (
                            <ChevronRight size={18} color="#9ca3af" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* INFO ESCROW */}
                  <div style={styles.escrowBox}>
                    <Lock size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ ...styles.escrowTitle, color: '#2563eb' }}>Comment fonctionne le paiement ?</div>
                      <div style={styles.escrowDesc}>
                        1️⃣ Votre paiement est débité et <strong>bloqué en séquestre</strong><br />
                        2️⃣ Le vendeur prépare et expédie votre commande<br />
                        3️⃣ Vous confirmez la réception<br />
                        4️⃣ Le vendeur reçoit son argent ✅
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button style={styles.btnBack} onClick={() => setStep(1)} whileHover={{ scale: 1.02 }}>
                      <ArrowLeft size={15} /> Retour
                    </motion.button>
                    <motion.button style={styles.btnNext} onClick={handleNextStep2} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Confirmer le mode <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== ÉTAPE 3 — CONFIRMATION & OTP ===== */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  style={styles.card}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 style={styles.cardTitle}>
                    <Shield size={18} color="#1a5c2a" /> Confirmer et payer
                  </h3>

                  {/* RÉCAP COMMANDE */}
                  <div style={styles.recapBox}>
                    <div style={styles.recapHeader}>📦 Récapitulatif</div>
                    {[
                      { label: 'Produit',         value: produit.nom },
                      { label: 'Vendeur',         value: produit.vendeur },
                      { label: 'Adresse',         value: adresse },
                      { label: 'Téléphone',       value: telephone },
                      { label: 'Mode paiement',   value: modeActif?.label },
                    ].map((row, i) => (
                      <div key={i} style={styles.recapRow}>
                        <span style={styles.recapLabel}>{row.label}</span>
                        <span style={styles.recapValue}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* MONTANT FINAL */}
                  <div style={styles.totalBox}>
                    <div style={styles.totalRow}>
                      <span>Prix produit</span>
                      <span>{produit.prix.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div style={styles.totalRow}>
                      <span>Frais de livraison</span>
                      <span>{fraisLivraison.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div style={styles.totalRow}>
                      <span>Frais paiement ({modeActif?.frais}%)</span>
                      <span>{fraisMontant.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div style={{ ...styles.totalRow, ...styles.totalFinal }}>
                      <span>Total à payer</span>
                      <span style={{ color: '#1a5c2a' }}>{total.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  {/* OTP MOBILE MONEY */}
                  {modeActif?.id !== 'bank' && (
                    <div style={styles.otpBox}>
                      <div style={styles.otpTitle}>
                        <Smartphone size={16} color={modeActif?.color} />
                        Validation par code OTP
                      </div>
                      <p style={styles.otpDesc}>
                        Cliquez sur "Envoyer le code" pour recevoir un OTP sur le numéro {modeActif?.numero}
                      </p>

                      {!otpEnvoye ? (
                        <motion.button
                          style={{ ...styles.btnEnvoyerOTP, background: modeActif?.color }}
                          onClick={handleEnvoyerOTP}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Envoyer le code OTP
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div style={styles.otpSuccessMsg}>
                            <CheckCircle size={14} color="#16a34a" />
                            Code envoyé sur {modeActif?.numero}
                          </div>
                          <input
                            type="text"
                            placeholder="Entrez le code OTP à 6 chiffres"
                            value={codeOTP}
                            onChange={(e) => { setCodeOTP(e.target.value); setError(''); }}
                            style={{ ...styles.input, letterSpacing: '0.3em', fontWeight: '700', fontSize: '1.1rem', textAlign: 'center' }}
                            maxLength={6}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* VIREMENT BANCAIRE */}
                  {modeActif?.id === 'bank' && (
                    <div style={styles.bankBox}>
                      <Building size={16} color="#1a5c2a" />
                      <div>
                        <div style={styles.bankTitle}>Instructions de virement</div>
                        <div style={styles.bankDesc}>
                          Effectuez un virement de <strong>{total.toLocaleString('fr-FR')} FCFA</strong> vers :<br />
                          <strong>IBAN :</strong> BJ XX XXXX XXXX XXXX<br />
                          <strong>Réf :</strong> AGR-{Date.now().toString().slice(-6)}
                        </div>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div style={styles.errorBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <AlertCircle size={15} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <motion.button style={styles.btnBack} onClick={() => setStep(2)} whileHover={{ scale: 1.02 }}>
                      <ArrowLeft size={15} /> Retour
                    </motion.button>
                    <motion.button
                      style={{ ...styles.btnPayer, opacity: loading ? 0.8 : 1 }}
                      onClick={handlePayer}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader size={18} />
                        </motion.div>
                      ) : (
                        <>
                          <Lock size={16} />
                          Payer {total.toLocaleString('fr-FR')} FCFA
                        </>
                      )}
                    </motion.button>
                  </div>

                </motion.div>
              )}

              {/* ===== ÉTAPE 4 — SUCCÈS ===== */}
              {step === 4 && (
                <motion.div
                  key="step4"
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

                  <h3 style={styles.successTitle}>Commande passée ! 🎉</h3>
                  <p style={styles.successDesc}>
                    Votre paiement de <strong>{total.toLocaleString('fr-FR')} FCFA</strong> a été
                    <strong> bloqué en séquestre</strong>. Le vendeur <strong>{produit.vendeur}</strong> va
                    préparer votre commande. Vous recevrez une notification quand elle sera en route.
                  </p>

                  {/* ÉTAPES SUIVANTES */}
                  <div style={styles.nextSteps}>
                    {[
                      { icon: '✅', titre: 'Paiement sécurisé',    desc: 'Votre argent est bloqué et protégé'         },
                      { icon: '📦', titre: 'Préparation en cours', desc: 'Le vendeur prépare votre commande'           },
                      { icon: '🚚', titre: 'Livraison',            desc: 'Un transporteur viendra livrer chez vous'    },
                      { icon: '🎯', titre: 'Confirmation',         desc: 'Confirmez la réception pour payer le vendeur'},
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        style={styles.nextStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <span style={styles.nextStepIcon}>{s.icon}</span>
                        <div>
                          <div style={styles.nextStepTitre}>{s.titre}</div>
                          <div style={styles.nextStepDesc}>{s.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* NUMÉRO DE COMMANDE */}
                  <div style={styles.refBox}>
                    <div style={styles.refLabel}>Numéro de commande</div>
                    <div style={styles.refVal}>AGR-CMD-{Date.now().toString().slice(-8)}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <Link to="/buyer/orders" style={styles.btnSuivre}>
                      <Package size={16} /> Suivre ma commande
                    </Link>
                    <Link to="/products" style={styles.btnContinuer}>
                      Continuer mes achats
                    </Link>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ===== RÉCAP PRODUIT — SIDEBAR ===== */}
          <div className="col-12 col-lg-4">
            <motion.div
              style={styles.sidebarCard}
              variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
            >
              <h4 style={styles.sidebarTitle}>
                <ShoppingCart size={16} color="#1a5c2a" /> Ma commande
              </h4>

              {/* PRODUIT */}
              <div style={styles.produitWrap}>
                <img
                  src={produit.image}
                  alt={produit.nom}
                  style={styles.produitImg}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={styles.produitNom}>{produit.nom}</div>
                  <div style={styles.produitVendeur}>
                    par {produit.vendeur}
                    <span style={styles.produitNote}>
                      <Star size={11} color="#f0c040" fill="#f0c040" /> {produit.noteVendeur}
                    </span>
                  </div>
                  <div style={styles.produitLoc}>
                    <MapPin size={12} color="#6b7280" /> {produit.localisation}
                  </div>
                </div>
              </div>

              {/* PRIX */}
              <div style={styles.prixDetail}>
                <div style={styles.prixRow}>
                  <span>Prix produit</span>
                  <span>{produit.prix.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={styles.prixRow}>
                  <span>Frais de livraison</span>
                  <span>{fraisLivraison.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {modeActif && (
                  <div style={styles.prixRow}>
                    <span>Frais paiement</span>
                    <span>{fraisMontant.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div style={styles.prixTotal}>
                  <span>Total</span>
                  <span style={{ color: '#1a5c2a', fontSize: '1.1rem' }}>
                    {total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* GARANTIE */}
              <div style={styles.garantieBox}>
                <Shield size={14} color="#1a5c2a" />
                <span>Paiement protégé par séquestre AgroConnect</span>
              </div>

              {/* LIVRAISON */}
              <div style={styles.livraisonBox}>
                <Truck size={14} color="#2563eb" />
                <span>Livraison estimée sous 2 à 5 jours</span>
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
  btnRetour:   { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: '600', fontSize: '0.88rem', color: '#374151', cursor: 'pointer' },

  stepper:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2rem', flexWrap: 'wrap' },
  stepItem:    { display: 'flex', alignItems: 'center', gap: '6px' },
  stepCircle:  { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' },
  stepLabel:   { fontSize: '0.8rem', transition: 'all 0.3s', whiteSpace: 'nowrap' },
  stepLine:    { width: '40px', height: '2px', transition: 'background 0.3s' },

  card:        { background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  cardTitle:   { fontSize: '1.05rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' },

  fieldWrap:   { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' },
  label:       { fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' },
  input:       { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', color: '#1a2e10', background: '#fafafa', fontFamily: 'inherit', transition: 'border-color 0.2s' },

  errorBox:    { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#dc2626' },

  escrowBox:   { display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #86efac', marginBottom: '1.2rem' },
  escrowTitle: { fontWeight: '700', fontSize: '0.88rem', color: '#1a5c2a', marginBottom: '4px' },
  escrowDesc:  { fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 },

  modeCard:    { display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '14px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  modeIconWrap:{ width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeLabel:   { fontWeight: '700', fontSize: '0.92rem', color: '#1a2e10', marginBottom: '4px' },
  modeMeta:    { display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#6b7280', flexWrap: 'wrap' },
  modeCheck:   { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  recapBox:    { background: '#f9fafb', borderRadius: '14px', padding: '1rem', marginBottom: '1rem', border: '1px solid #e5e7eb' },
  recapHeader: { fontWeight: '800', fontSize: '0.9rem', color: '#1a2e10', marginBottom: '0.8rem' },
  recapRow:    { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem' },
  recapLabel:  { color: '#6b7280' },
  recapValue:  { fontWeight: '600', color: '#1a2e10', textAlign: 'right', maxWidth: '60%' },

  totalBox:    { background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' },
  totalRow:    { display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', color: '#374151', padding: '5px 0', borderBottom: '1px solid #f5f5f5' },
  totalFinal:  { fontWeight: '800', fontSize: '1rem', color: '#1a2e10', borderBottom: 'none', paddingTop: '10px', marginTop: '4px' },

  otpBox:      { background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem', border: '1px solid #e5e7eb', marginBottom: '1rem' },
  otpTitle:    { fontWeight: '700', fontSize: '0.92rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' },
  otpDesc:     { fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.8rem' },
  otpSuccessMsg:{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.8rem' },
  btnEnvoyerOTP:{ border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', color: 'white', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' },

  bankBox:     { display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #86efac', marginBottom: '1rem' },
  bankTitle:   { fontWeight: '700', fontSize: '0.88rem', color: '#1a5c2a', marginBottom: '4px' },
  bankDesc:    { fontSize: '0.82rem', color: '#374151', lineHeight: 1.8 },

  btnNext:     { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  btnBack:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.85rem 1.5rem', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' },
  btnPayer:    { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #1a5c2a, #2d8c47)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 18px rgba(26,92,42,0.4)' },

  successIcon:  { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' },
  successTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.6rem' },
  successDesc:  { fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1.5rem' },
  nextSteps:    { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem', textAlign: 'left' },
  nextStep:     { display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f9fafb', borderRadius: '12px', padding: '0.8rem 1rem' },
  nextStepIcon: { fontSize: '1.3rem', flexShrink: 0 },
  nextStepTitre:{ fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' },
  nextStepDesc: { fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  refBox:       { background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #86efac' },
  refLabel:     { fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '4px' },
  refVal:       { fontWeight: '800', color: '#1a5c2a', fontSize: '1rem', fontFamily: 'monospace' },
  btnSuivre:    { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#1a5c2a', color: 'white', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'none' },
  btnContinuer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#1a5c2a', border: '1.5px solid #1a5c2a', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'none' },

  sidebarCard:   { background: 'white', borderRadius: '16px', padding: '1.3rem', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' },
  sidebarTitle:  { fontSize: '0.95rem', fontWeight: '800', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' },
  produitWrap:   { display: 'flex', gap: '12px', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' },
  produitImg:    { width: '70px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  produitNom:    { fontWeight: '700', fontSize: '0.92rem', color: '#1a2e10', marginBottom: '4px' },
  produitVendeur:{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' },
  produitNote:   { display: 'flex', alignItems: 'center', gap: '2px', color: '#d97706', fontWeight: '700' },
  produitLoc:    { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280' },
  prixDetail:    { display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '1rem' },
  prixRow:       { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151', padding: '6px 0', borderBottom: '1px solid #f5f5f5' },
  prixTotal:     { display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10', padding: '10px 0 0' },
  garantieBox:   { display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', borderRadius: '10px', padding: '0.7rem', fontSize: '0.78rem', color: '#1a5c2a', fontWeight: '600', marginBottom: '8px' },
  livraisonBox:  { display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', borderRadius: '10px', padding: '0.7rem', fontSize: '0.78rem', color: '#2563eb', fontWeight: '600' },
};