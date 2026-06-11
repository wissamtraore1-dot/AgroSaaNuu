import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet, ArrowUpRight, ArrowDownLeft,
  Plus, Send, Eye, EyeOff,
  TrendingUp, TrendingDown, Clock,
  CheckCircle, XCircle, RefreshCw,
  CreditCard, Smartphone, Building,
  ChevronRight, Shield, Lock, Coins, Upload,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const solde        = 485000;
const soldeEnAttente = 120000;

const historiqueData = [
  { date: 'Jan', solde: 120000 },
  { date: 'Fév', solde: 180000 },
  { date: 'Mar', solde: 150000 },
  { date: 'Avr', solde: 320000 },
  { date: 'Mai', solde: 485000 },
];

const transactions = [
  { id: 1,  type: 'entree',  label: 'Vente Maïs 2t — Kofi A.',       montant: 120000, date: "Aujourd'hui 09:24",  statut: 'success', mode: 'MTN'  },
  { id: 2,  type: 'sortie',  label: 'Retrait vers MTN Mobile Money',  montant: 50000,  date: "Aujourd'hui 08:00",  statut: 'success', mode: 'MTN'  },
  { id: 3,  type: 'entree',  label: 'Vente Riz 3t — Sèna B.',         montant: 180000, date: 'Hier 15:32',         statut: 'success', mode: 'Moov' },
  { id: 4,  type: 'sortie',  label: 'Frais de commission',            montant: 9000,   date: 'Hier 15:32',         statut: 'success', mode: 'Auto' },
  { id: 5,  type: 'entree',  label: 'Vente Soja 1t — Yao D.',         montant: 67000,  date: '08 Mai 11:20',       statut: 'pending', mode: 'MTN'  },
  { id: 6,  type: 'sortie',  label: 'Retrait vers Moov Money',        montant: 30000,  date: '07 Mai 10:00',       statut: 'failed',  mode: 'Moov' },
  { id: 7,  type: 'entree',  label: 'Vente Mil 2t — Afi K.',          montant: 95000,  date: '06 Mai 14:45',       statut: 'success', mode: 'Bank' },
];

const modespaiement = [
  { id: 'mtn',  label: 'MTN Mobile Money', icon: Smartphone, color: '#f59e0b', bg: '#fffbeb', numero: '+229 01 XX XX XX' },
  { id: 'moov', label: 'Moov Money',       icon: Smartphone, color: '#2563eb', bg: '#eff6ff', numero: '+229 02 XX XX XX' },
  { id: 'bank', label: 'Virement bancaire',icon: Building,   color: '#1a5c2a', bg: '#f0fdf4', numero: 'BJ XX XXXX XXXX' },
];

const statutStyle = {
  success: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle, label: 'Succès'    },
  pending: { bg: '#fef3c7', color: '#d97706', icon: Clock,       label: 'En attente' },
  failed:  { bg: '#fee2e2', color: '#dc2626', icon: XCircle,     label: 'Échoué'    },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function WalletPage() {
  const [showSolde,  setShowSolde]  = useState(true);
  const [activeTab,  setActiveTab]  = useState('tous');
  const [showModal,  setShowModal]  = useState(null); // 'depot' | 'retrait'

  const transactionsFiltrees = transactions.filter((t) => {
    if (activeTab === 'tous')    return true;
    if (activeTab === 'entrees') return t.type === 'entree';
    if (activeTab === 'sorties') return t.type === 'sortie';
    if (activeTab === 'pending') return t.statut === 'pending';
    return true;
  });

  const totalEntrees = transactions.filter((t) => t.type === 'entree' && t.statut === 'success').reduce((s, t) => s + t.montant, 0);
  const totalSorties = transactions.filter((t) => t.type === 'sortie' && t.statut === 'success').reduce((s, t) => s + t.montant, 0);

  return (
    <DashboardLayout role="seller">
      <div>

        {/* ===== EN-TÊTE ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.header}
        >
          <div>
            <h1 style={{ ...styles.headerTitle, display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={22} /> Mon Portefeuille</h1>
            <p style={styles.headerSub}>Gérez vos finances en toute sécurité</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button
              style={styles.btnDeposer}
              onClick={() => setShowModal('depot')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={16} /> Déposer
            </motion.button>
            <motion.button
              style={styles.btnRetirer}
              onClick={() => setShowModal('retrait')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Send size={16} /> Retirer
            </motion.button>
          </div>
        </motion.div>

        {/* ===== CARTE SOLDE ===== */}
        <div className="row g-3 mb-4">
          <motion.div
            className="col-12 col-lg-5"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}
          >
            <div style={styles.soldeCard}>
              {/* FOND DÉCO */}
              <div style={styles.soldeDeco1} />
              <div style={styles.soldeDeco2} />

              <div style={styles.soldeHeader}>
                <div style={styles.soldeIconWrap}>
                  <Wallet size={22} color="white" />
                </div>
                <button
                  style={styles.eyeBtn}
                  onClick={() => setShowSolde(!showSolde)}
                >
                  {showSolde
                    ? <Eye    size={18} color="rgba(255,255,255,0.8)" />
                    : <EyeOff size={18} color="rgba(255,255,255,0.8)" />
                  }
                </button>
              </div>

              <p style={styles.soldeLabel}>Solde disponible</p>
              <div style={styles.soldeAmount}>
                {showSolde
                  ? `${solde.toLocaleString('fr-FR')} FCFA`
                  : '•••••• FCFA'
                }
              </div>

              <div style={styles.soldeAttente}>
                <Clock size={13} color="rgba(255,255,255,0.7)" />
                <span>
                  En attente : {showSolde
                    ? `${soldeEnAttente.toLocaleString('fr-FR')} FCFA`
                    : '•••••'
                  }
                </span>
              </div>

              <div style={styles.soldeBtns}>
                <motion.button
                  style={styles.soldeBtn}
                  onClick={() => setShowModal('depot')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowDownLeft size={16} /> Déposer
                </motion.button>
                <motion.button
                  style={styles.soldeBtn}
                  onClick={() => setShowModal('retrait')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowUpRight size={16} /> Retirer
                </motion.button>
                <motion.button
                  style={styles.soldeBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={16} /> Actualiser
                </motion.button>
              </div>

            </div>
          </motion.div>

          {/* STATS */}
          <div className="col-12 col-lg-7">
            <div className="row g-3 h-100">

              {/* ENTRÉES */}
              <motion.div
                className="col-6"
                variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}
              >
                <div style={{ ...styles.statCard, borderLeft: '4px solid #16a34a' }}>
                  <div style={{ ...styles.statIcon, background: '#dcfce7' }}>
                    <TrendingUp size={20} color="#16a34a" />
                  </div>
                  <div style={styles.statValue}>{totalEntrees.toLocaleString('fr-FR')}</div>
                  <div style={styles.statLabel}>FCFA reçus</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
                    ↑ Ce mois
                  </div>
                </div>
              </motion.div>

              {/* SORTIES */}
              <motion.div
                className="col-6"
                variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
              >
                <div style={{ ...styles.statCard, borderLeft: '4px solid #dc2626' }}>
                  <div style={{ ...styles.statIcon, background: '#fee2e2' }}>
                    <TrendingDown size={20} color="#dc2626" />
                  </div>
                  <div style={styles.statValue}>{totalSorties.toLocaleString('fr-FR')}</div>
                  <div style={styles.statLabel}>FCFA retirés</div>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '600' }}>
                    ↓ Ce mois
                  </div>
                </div>
              </motion.div>

              {/* GRAPHIQUE */}
              <motion.div
                className="col-12"
                variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }}
              >
                <div style={styles.miniChart}>
                  <p style={styles.miniChartTitle}>Évolution du solde</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <AreaChart data={historiqueData}>
                      <defs>
                        <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1a5c2a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1a5c2a" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(v) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Solde']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.78rem' }}
                      />
                      <Area type="monotone" dataKey="solde" stroke="#1a5c2a" strokeWidth={2} fill="url(#soldeGrad)" dot={{ r: 3, fill: '#1a5c2a' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* ===== MODES DE PAIEMENT ===== */}
        <motion.div
          className="mb-4"
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <CreditCard size={18} color="#1a5c2a" /> Mes moyens de paiement
              </h3>
              <motion.button
                style={styles.btnAjouterMode}
                whileHover={{ scale: 1.03 }}
              >
                <Plus size={14} /> Ajouter
              </motion.button>
            </div>

            <div className="row g-3">
              {modespaiement.map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.id}
                    className="col-12 col-md-4"
                    whileHover={{ y: -3 }}
                  >
                    <div style={styles.modeCard}>
                      <div style={{ ...styles.modeIcon, background: m.bg }}>
                        <Icon size={22} color={m.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.modeLabel}>{m.label}</div>
                        <div style={styles.modeNumero}>{m.numero}</div>
                      </div>
                      <ChevronRight size={16} color="#9ca3af" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ===== TRANSACTIONS ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <Clock size={18} color="#1a5c2a" /> Historique des transactions
              </h3>
              <Link to="/finance/transactions" style={styles.voirTout}>
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* TABS */}
            <div style={styles.tabs}>
              {[
                { id: 'tous',    label: 'Toutes'      },
                { id: 'entrees', label: '↑ Entrées'   },
                { id: 'sorties', label: '↓ Sorties'   },
                { id: 'pending', label: 'En attente'},
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  style={{
                    ...styles.tab,
                    background:  activeTab === tab.id ? '#1a5c2a' : 'transparent',
                    color:       activeTab === tab.id ? 'white'   : '#6b7280',
                    borderColor: activeTab === tab.id ? '#1a5c2a' : '#e5e7eb',
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* LISTE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AnimatePresence mode="wait">
                {transactionsFiltrees.map((t, i) => {
                  const s    = statutStyle[t.statut];
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={t.id}
                      style={styles.transactionItem}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4, background: '#f9fafb' }}
                    >
                      {/* ICÔNE TYPE */}
                      <div style={{
                        ...styles.transIcon,
                        background: t.type === 'entree' ? '#dcfce7' : '#fee2e2',
                      }}>
                        {t.type === 'entree'
                          ? <ArrowDownLeft size={18} color="#16a34a" />
                          : <ArrowUpRight  size={18} color="#dc2626" />
                        }
                      </div>

                      {/* INFOS */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.transLabel}>{t.label}</div>
                        <div style={styles.transMeta}>
                          <Clock size={11} color="#9ca3af" />
                          {t.date}
                          <span style={styles.transMode}>{t.mode}</span>
                        </div>
                      </div>

                      {/* MONTANT + STATUT */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          ...styles.transMontant,
                          color: t.type === 'entree' ? '#16a34a' : '#dc2626',
                        }}>
                          {t.type === 'entree' ? '+' : '-'}
                          {t.montant.toLocaleString('fr-FR')} FCFA
                        </div>
                        <span style={{ ...styles.transStatut, background: s.bg, color: s.color }}>
                          <Icon size={11} />
                          {s.label}
                        </span>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>

        {/* ===== SÉCURITÉ ===== */}
        <motion.div
          className="mt-4"
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}
        >
          <div style={styles.secuCard}>
            <Shield size={20} color="#1a5c2a" />
            <div>
              <div style={styles.secuTitle}>Vos fonds sont protégés</div>
              <div style={styles.secuDesc}>
                AgroConnect utilise un cryptage de niveau bancaire pour sécuriser toutes vos transactions.
              </div>
            </div>
            <Lock size={18} color="#1a5c2a" style={{ flexShrink: 0 }} />
          </div>
        </motion.div>

      </div>

      {/* ===== MODAL DÉPÔT / RETRAIT ===== */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="wallet-overlay"
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="wallet-modal"
            style={styles.modal}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
              <h3 style={{ ...styles.modalTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {showModal === 'depot'
                  ? <><Coins size={18} /> Déposer des fonds</>
                  : <><Upload size={18} /> Retirer des fonds</>
                }
              </h3>
              <p style={styles.modalSub}>
                {showModal === 'depot'
                  ? 'Rechargez votre portefeuille via Mobile Money ou virement bancaire'
                  : 'Transférez votre solde vers votre compte Mobile Money ou bancaire'
                }
              </p>

              {/* MONTANT */}
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Montant (FCFA) *</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  style={styles.input}
                  min="1000"
                />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Minimum : 1 000 FCFA
                  {showModal === 'retrait' && ` — Solde disponible : ${solde.toLocaleString('fr-FR')} FCFA`}
                </span>
              </div>

              {/* MODE */}
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Mode de paiement *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {modespaiement.map((m) => {
                    const Icon = m.icon;
                    return (
                      <label key={m.id} style={styles.modeOption}>
                        <input type="radio" name="mode" value={m.id} style={{ accentColor: '#1a5c2a' }} />
                        <div style={{ ...styles.modeIcon, width: '32px', height: '32px', background: m.bg }}>
                          <Icon size={16} color={m.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1a2e10' }}>{m.label}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.numero}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* BOUTONS */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <motion.button
                  style={styles.modalBtnAnnuler}
                  onClick={() => setShowModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  style={styles.modalBtnValider}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showModal === 'depot' ? 'Déposer' : 'Retirer'}
                </motion.button>
              </div>

            </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}

// ===== STYLES =====
const styles = {
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  headerTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  headerSub:   { fontSize: '0.88rem', color: '#6b7280', margin: 0 },
  btnDeposer:  { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.6rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  btnRetirer:  { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#1a5c2a', border: '1.5px solid #1a5c2a', borderRadius: '12px', padding: '0.6rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },

  // SOLDE CARD
  soldeCard:   { background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)', borderRadius: '20px', padding: '1.8rem', position: 'relative', overflow: 'hidden', height: '100%' },
  soldeDeco1:  { position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' },
  soldeDeco2:  { position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)' },
  soldeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  soldeIconWrap:{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  eyeBtn:      { background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' },
  soldeLabel:  { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' },
  soldeAmount: { color: 'white', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', marginBottom: '0.8rem', letterSpacing: '-0.02em' },
  soldeAttente:{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', marginBottom: '1.5rem' },
  soldeBtns:   { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  soldeBtn:    { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '10px', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(4px)' },

  // STATS
  statCard:    { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' },
  statIcon:    { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' },
  statValue:   { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '2px' },
  statLabel:   { fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' },

  // MINI CHART
  miniChart:      { background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #f0f0f0' },
  miniChartTitle: { fontSize: '0.82rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' },

  // CARDS
  card:       { background: 'white', borderRadius: '16px', padding: '1.3rem', border: '1px solid #e5e7eb', marginBottom: '1rem' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  voirTout:   { fontSize: '0.82rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  btnAjouterMode: { display: 'flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#1a5c2a', border: '1px solid #86efac', borderRadius: '8px', padding: '0.35rem 0.8rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' },

  // MODES PAIEMENT
  modeCard:   { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.9rem', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' },
  modeIcon:   { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modeLabel:  { fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' },
  modeNumero: { fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' },

  // TABS
  tabs: { display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' },
  tab:  { padding: '0.4rem 1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },

  // TRANSACTIONS
  transactionItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.15s' },
  transIcon:       { width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  transLabel:      { fontWeight: '600', fontSize: '0.88rem', color: '#1a2e10', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  transMeta:       { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#9ca3af' },
  transMode:       { background: '#f4f6f4', padding: '1px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600', color: '#6b7280' },
  transMontant:    { fontWeight: '800', fontSize: '0.95rem', marginBottom: '3px' },
  transStatut:     { display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700' },

  // SÉCURITÉ
  secuCard:  { display: 'flex', alignItems: 'center', gap: '14px', background: '#f0fdf4', borderRadius: '14px', padding: '1rem 1.2rem', border: '1px solid #86efac' },
  secuTitle: { fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10', marginBottom: '2px' },
  secuDesc:  { fontSize: '0.78rem', color: '#6b7280' },

  // MODAL
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(4px)' },
  modal:    { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '20px', padding: '2rem', width: '90%', maxWidth: '440px', zIndex: 200, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle:{ fontSize: '1.2rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.4rem' },
  modalSub:  { fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' },
  label:     { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input:     { padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', background: '#fafafa' },
  modeOption:{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.7rem', borderRadius: '10px', border: '1px solid #e5e7eb', cursor: 'pointer' },
  modalBtnAnnuler:{ flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  modalBtnValider:{ flex: 2, background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
};