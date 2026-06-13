import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Wallet, ArrowUpRight, ArrowDownLeft,
  Plus, Send, Eye, EyeOff,
  TrendingUp, TrendingDown, Clock,
  CheckCircle, XCircle, RefreshCw,
  CreditCard, Smartphone, Building,
  Shield, Lock, Coins, Upload, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import WalletService from '../../services/wallet.service';
import { useAuth } from '../../context/AuthContext';

const GREEN = '#1a5c2a';

const TYPE_ENTREE = new Set(['DEPOT', 'RECEPTION', 'LIBERATION', 'REMBOURSEMENT']);

const TYPE_LABELS = {
  DEPOT:         'Dépôt',
  RETRAIT:       'Retrait',
  PAIEMENT:      'Paiement commande',
  RECEPTION:     'Réception paiement',
  COMMISSION:    'Commission AgroConnect',
  REMBOURSEMENT: 'Remboursement',
  BLOCAGE:       'Blocage séquestre',
  LIBERATION:    'Libération séquestre',
};

const STATUT_STYLE = {
  SUCCES:     { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle, label: 'Succès'     },
  EN_ATTENTE: { bg: '#fef3c7', color: '#d97706', icon: Clock,       label: 'En attente' },
  ECHEC:      { bg: '#fee2e2', color: '#dc2626', icon: XCircle,     label: 'Échoué'     },
  ANNULEE:    { bg: '#fee2e2', color: '#dc2626', icon: XCircle,     label: 'Annulée'    },
};

const MODE_CHOICES = [
  { id: 'MTN',    label: 'MTN Mobile Money',  icon: Smartphone, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'MOOV',   label: 'Moov Money',        icon: Smartphone, color: '#2563eb', bg: '#eff6ff' },
  { id: 'CELTIS', label: 'Celtis Cash',       icon: Smartphone, color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'BANK',   label: 'Virement bancaire', icon: Building,   color: '#1a5c2a', bg: '#f0fdf4' },
];

const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

function buildChartData(transactions) {
  const now = new Date();
  const months = {};
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('fr-FR', { month: 'short' });
    months[key] = 0;
  }
  transactions.forEach(t => {
    const d = new Date(t.created_at);
    const key = d.toLocaleString('fr-FR', { month: 'short' });
    if (key in months && TYPE_ENTREE.has(t.type) && t.statut === 'SUCCES') {
      months[key] += parseFloat(t.montant_net);
    }
  });
  return Object.entries(months).map(([date, montant]) => ({ date, montant }));
}

function formatDate(iso) {
  const d = new Date(iso);
  const diffH = Math.floor((Date.now() - d) / 3600000);
  if (diffH < 1)  return "À l'instant";
  if (diffH < 24) return `Aujourd'hui ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffH < 48) return `Hier ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function WalletPage() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || 'buyer';

  const [walletData,   setWalletData]   = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showSolde,    setShowSolde]    = useState(true);
  const [activeTab,    setActiveTab]    = useState('tous');
  const [showModal,    setShowModal]    = useState(null);
  const [montant,      setMontant]      = useState('');
  const [mode,         setMode]         = useState('MTN');
  const [numero,       setNumero]       = useState('');
  const [opLoading,    setOpLoading]    = useState(false);
  const [opError,      setOpError]      = useState('');
  const [opSuccess,    setOpSuccess]    = useState('');

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, tRes] = await Promise.all([
        WalletService.monWallet(),
        WalletService.transactions(),
      ]);
      setWalletData(wRes.wallet);
      setTransactions(Array.isArray(tRes) ? tRes : (tRes.results ?? []));
    } catch {
      /* silencieux */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const solde          = walletData ? parseFloat(walletData.solde_disponible) : 0;
  const soldeEnAttente = walletData ? parseFloat(walletData.solde_bloque)     : 0;
  const totalRecu      = walletData ? parseFloat(walletData.total_recu)       : 0;
  const totalRetire    = walletData ? parseFloat(walletData.total_retire)     : 0;
  const chartData      = buildChartData(transactions);

  const txFiltrees = transactions.filter(t => {
    const isEntree = TYPE_ENTREE.has(t.type);
    if (activeTab === 'entrees') return isEntree;
    if (activeTab === 'sorties') return !isEntree;
    if (activeTab === 'pending') return t.statut === 'EN_ATTENTE';
    return true;
  });

  const ouvrirModal = (type) => {
    setShowModal(type);
    setMontant(''); setMode('MTN'); setNumero('');
    setOpError(''); setOpSuccess('');
  };

  const handleOperation = async () => {
    setOpError(''); setOpSuccess('');
    if (!montant || parseFloat(montant) < 1000) {
      setOpError('Montant minimum : 1 000 FCFA');
      return;
    }
    setOpLoading(true);
    try {
      const fn = showModal === 'depot' ? WalletService.deposer : WalletService.retirer;
      const res = await fn({ montant: parseFloat(montant), mode, numero_mobile: numero });
      setOpSuccess(res.message || (showModal === 'depot' ? 'Dépôt effectué.' : 'Retrait effectué.'));
      await charger();
      setTimeout(() => setShowModal(null), 1800);
    } catch (err) {
      setOpError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={styles.header}>
          <div>
            <h1 style={{ ...styles.headerTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={22} /> Mon Portefeuille
            </h1>
            <p style={styles.headerSub}>Gérez vos finances en toute sécurité</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button style={styles.btnDeposer} onClick={() => ouvrirModal('depot')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Plus size={16} /> Déposer
            </motion.button>
            <motion.button style={styles.btnRetirer} onClick={() => ouvrirModal('retrait')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Send size={16} /> Retirer
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={36} color={GREEN} className="spin" />
          </div>
        ) : (
          <>
            {/* SOLDE + STATS */}
            <div className="row g-3 mb-4">
              <motion.div className="col-12 col-lg-5" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
                <div style={styles.soldeCard}>
                  <div style={styles.soldeDeco1} />
                  <div style={styles.soldeDeco2} />

                  <div style={styles.soldeHeader}>
                    <div style={styles.soldeIconWrap}><Wallet size={22} color="white" /></div>
                    <button style={styles.eyeBtn} onClick={() => setShowSolde(v => !v)}>
                      {showSolde ? <Eye size={18} color="rgba(255,255,255,0.8)" /> : <EyeOff size={18} color="rgba(255,255,255,0.8)" />}
                    </button>
                  </div>

                  <p style={styles.soldeLabel}>Solde disponible</p>
                  <div style={styles.soldeAmount}>
                    {showSolde ? `${solde.toLocaleString('fr-FR')} FCFA` : '•••••• FCFA'}
                  </div>

                  {soldeEnAttente > 0 && (
                    <div style={styles.soldeAttente}>
                      <Clock size={13} color="rgba(255,255,255,0.7)" />
                      <span>En attente : {showSolde ? `${soldeEnAttente.toLocaleString('fr-FR')} FCFA` : '•••••'}</span>
                    </div>
                  )}

                  <div style={styles.soldeBtns}>
                    <motion.button style={styles.soldeBtn} onClick={() => ouvrirModal('depot')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <ArrowDownLeft size={16} /> Déposer
                    </motion.button>
                    <motion.button style={styles.soldeBtn} onClick={() => ouvrirModal('retrait')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <ArrowUpRight size={16} /> Retirer
                    </motion.button>
                    <motion.button style={styles.soldeBtn} onClick={charger} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <RefreshCw size={16} /> Actualiser
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <div className="col-12 col-lg-7">
                <div className="row g-3 h-100">
                  <motion.div className="col-6" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
                    <div style={{ ...styles.statCard, borderLeft: '4px solid #16a34a' }}>
                      <div style={{ ...styles.statIcon, background: '#dcfce7' }}><TrendingUp size={20} color="#16a34a" /></div>
                      <div style={styles.statValue}>{totalRecu.toLocaleString('fr-FR')}</div>
                      <div style={styles.statLabel}>FCFA reçus</div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>Total cumulé</div>
                    </div>
                  </motion.div>

                  <motion.div className="col-6" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                    <div style={{ ...styles.statCard, borderLeft: '4px solid #dc2626' }}>
                      <div style={{ ...styles.statIcon, background: '#fee2e2' }}><TrendingDown size={20} color="#dc2626" /></div>
                      <div style={styles.statValue}>{totalRetire.toLocaleString('fr-FR')}</div>
                      <div style={styles.statLabel}>FCFA retirés</div>
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '600' }}>Total cumulé</div>
                    </div>
                  </motion.div>

                  <motion.div className="col-12" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.25 }}>
                    <div style={styles.miniChart}>
                      <p style={styles.miniChartTitle}>Entrées par mois (5 derniers mois)</p>
                      <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={GREEN} stopOpacity={0}   />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip
                            formatter={v => [`${v.toLocaleString('fr-FR')} FCFA`, 'Entrées']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.78rem' }}
                          />
                          <Area type="monotone" dataKey="montant" stroke={GREEN} strokeWidth={2} fill="url(#soldeGrad)" dot={{ r: 3, fill: GREEN }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}><Clock size={18} color={GREEN} /> Historique des transactions</h3>
                  <Link to="/finance/transactions" style={styles.voirTout}>Voir tout <ArrowUpRight size={14} /></Link>
                </div>

                <div style={styles.tabs}>
                  {[
                    { id: 'tous',    label: 'Toutes'     },
                    { id: 'entrees', label: '↑ Entrées'  },
                    { id: 'sorties', label: '↓ Sorties'  },
                    { id: 'pending', label: 'En attente' },
                  ].map(tab => (
                    <motion.button key={tab.id}
                      style={{ ...styles.tab, background: activeTab === tab.id ? GREEN : 'transparent', color: activeTab === tab.id ? 'white' : '#6b7280', borderColor: activeTab === tab.id ? GREEN : '#e5e7eb' }}
                      onClick={() => setActiveTab(tab.id)} whileTap={{ scale: 0.97 }}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>

                {txFiltrees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                    Aucune transaction.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <AnimatePresence mode="wait">
                      {txFiltrees.slice(0, 10).map((t, i) => {
                        const isEntree = TYPE_ENTREE.has(t.type);
                        const s = STATUT_STYLE[t.statut] ?? STATUT_STYLE.EN_ATTENTE;
                        const Icon = s.icon;
                        return (
                          <motion.div key={t.id} style={styles.transactionItem}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.04 }} whileHover={{ x: 4, background: '#f9fafb' }}
                          >
                            <div style={{ ...styles.transIcon, background: isEntree ? '#dcfce7' : '#fee2e2' }}>
                              {isEntree ? <ArrowDownLeft size={18} color="#16a34a" /> : <ArrowUpRight size={18} color="#dc2626" />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={styles.transLabel}>
                                {TYPE_LABELS[t.type] ?? t.type}
                                {t.description ? ` — ${t.description}` : ''}
                              </div>
                              <div style={styles.transMeta}>
                                <Clock size={11} color="#9ca3af" />
                                {formatDate(t.created_at)}
                                <span style={styles.transMode}>{t.mode}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ ...styles.transMontant, color: isEntree ? '#16a34a' : '#dc2626' }}>
                                {isEntree ? '+' : '-'}{parseFloat(t.montant_net).toLocaleString('fr-FR')} FCFA
                              </div>
                              <span style={{ ...styles.transStatut, background: s.bg, color: s.color }}>
                                <Icon size={11} /> {s.label}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>

            {/* SÉCURITÉ */}
            <motion.div className="mt-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
              <div style={styles.secuCard}>
                <Shield size={20} color={GREEN} />
                <div>
                  <div style={styles.secuTitle}>Vos fonds sont protégés</div>
                  <div style={styles.secuDesc}>AgroConnect utilise un cryptage de niveau bancaire pour sécuriser toutes vos transactions.</div>
                </div>
                <Lock size={18} color={GREEN} style={{ flexShrink: 0 }} />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* MODAL DÉPÔT / RETRAIT */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="wallet-modal-root"
            style={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !opLoading && setShowModal(null)}
          >
            <motion.div
              style={styles.modal}
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ ...styles.modalTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {showModal === 'depot'
                  ? <><Coins size={18} /> Déposer des fonds</>
                  : <><Upload size={18} /> Retirer des fonds</>}
              </h3>
              <p style={styles.modalSub}>
                {showModal === 'depot'
                  ? 'Via Mobile Money ou virement bancaire'
                  : `Solde disponible : ${solde.toLocaleString('fr-FR')} FCFA`}
              </p>

              {opError   && <div style={styles.alertError}>{opError}</div>}
              {opSuccess && <div style={styles.alertSuccess}>{opSuccess}</div>}

              <div style={styles.fieldWrap}>
                <label style={styles.label}>Montant (FCFA) *</label>
                <input type="number" placeholder="Ex: 50 000" style={styles.input} min="1000"
                  value={montant} onChange={e => setMontant(e.target.value)} />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Minimum : 1 000 FCFA</span>
              </div>

              <div style={styles.fieldWrap}>
                <label style={styles.label}>Mode de paiement *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {MODE_CHOICES.map(m => {
                    const Icon = m.icon;
                    const selected = mode === m.id;
                    return (
                      <label key={m.id} onClick={() => setMode(m.id)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        padding: '0.75rem 0.5rem', borderRadius: '12px', cursor: 'pointer',
                        border: `2px solid ${selected ? GREEN : '#e5e7eb'}`,
                        background: selected ? '#f0fdf4' : 'white',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={18} color={m.color} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: selected ? GREEN : '#374151', textAlign: 'center', lineHeight: 1.2 }}>
                          {m.label}
                        </span>
                        {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN }} />}
                      </label>
                    );
                  })}
                </div>
              </div>

              {mode !== 'BANK' && (
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    Numéro {mode === 'MTN' ? 'MTN' : mode === 'MOOV' ? 'Moov' : 'Celtis'}
                  </label>
                  <input type="tel" placeholder="+229 01 XX XX XX" style={styles.input}
                    value={numero} onChange={e => setNumero(e.target.value)} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.2rem' }}>
                <motion.button style={styles.modalBtnAnnuler} onClick={() => setShowModal(null)} disabled={opLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Annuler
                </motion.button>
                <motion.button style={{ ...styles.modalBtnValider, opacity: opLoading ? 0.7 : 1 }} onClick={handleOperation} disabled={opLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {opLoading
                    ? <RefreshCw size={16} className="spin" />
                    : (showModal === 'depot' ? 'Déposer' : 'Retirer')
                  }
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}

const styles = {
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  headerTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  headerSub:   { fontSize: '0.88rem', color: '#6b7280', margin: 0 },
  btnDeposer:  { display: 'flex', alignItems: 'center', gap: '6px', background: GREEN, color: 'white', border: 'none', borderRadius: '12px', padding: '0.6rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  btnRetirer:  { display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: GREEN, border: `1.5px solid ${GREEN}`, borderRadius: '12px', padding: '0.6rem 1.3rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },

  soldeCard:    { background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)', borderRadius: '20px', padding: '1.8rem', position: 'relative', overflow: 'hidden', height: '100%' },
  soldeDeco1:   { position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' },
  soldeDeco2:   { position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)' },
  soldeHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  soldeIconWrap:{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  eyeBtn:       { background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' },
  soldeLabel:   { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' },
  soldeAmount:  { color: 'white', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '900', marginBottom: '0.8rem', letterSpacing: '-0.02em' },
  soldeAttente: { display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', marginBottom: '1.5rem' },
  soldeBtns:    { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  soldeBtn:     { display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: '10px', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(4px)' },

  statCard:  { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' },
  statIcon:  { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' },
  statValue: { fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '2px' },
  statLabel: { fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' },

  miniChart:      { background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #f0f0f0' },
  miniChartTitle: { fontSize: '0.82rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' },

  card:       { background: 'white', borderRadius: '16px', padding: '1.3rem', border: '1px solid #e5e7eb', marginBottom: '1rem' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  voirTout:   { fontSize: '0.82rem', color: GREEN, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },

  tabs: { display: 'flex', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' },
  tab:  { padding: '0.4rem 1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },

  transactionItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.15s' },
  transIcon:       { width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  transLabel:      { fontWeight: '600', fontSize: '0.88rem', color: '#1a2e10', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  transMeta:       { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#9ca3af' },
  transMode:       { background: '#f4f6f4', padding: '1px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600', color: '#6b7280' },
  transMontant:    { fontWeight: '800', fontSize: '0.95rem', marginBottom: '3px' },
  transStatut:     { display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '700' },

  secuCard:  { display: 'flex', alignItems: 'center', gap: '14px', background: '#f0fdf4', borderRadius: '14px', padding: '1rem 1.2rem', border: '1px solid #86efac' },
  secuTitle: { fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10', marginBottom: '2px' },
  secuDesc:  { fontSize: '0.78rem', color: '#6b7280' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:   { background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', zIndex: 200, boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.2rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.4rem' },
  modalSub:   { fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.5rem' },
  fieldWrap:  { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' },
  label:      { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  input:      { padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', background: '#fafafa' },
  modeOption: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.7rem', borderRadius: '10px', border: '1px solid', cursor: 'pointer', transition: 'all 0.15s' },
  modalBtnAnnuler: { flex: 1, background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  modalBtnValider: { flex: 2, background: GREEN, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  alertError:   { background: '#fee2e2', color: '#dc2626', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '600' },
  alertSuccess: { background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '600' },
};
