import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Package,
  DollarSign, ArrowUpRight,
  MapPin, Clock, CheckCircle, XCircle, Loader, Leaf,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import OrderService from '../../services/order.service';
import ProductService from '../../services/product.service';
import WalletService from '../../services/wallet.service';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';

const STATUT_STYLE = {
  PAIEMENT_EN_ATTENTE: { label: 'En attente',   bg: '#fef3c7', color: '#d97706', icon: Clock       },
  PAIEMENT_RECU:       { label: 'Payée',         bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
  EN_PREPARATION:      { label: 'Préparation',   bg: '#ede9fe', color: '#7c3aed', icon: Package     },
  EN_LIVRAISON:        { label: 'En livraison',  bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
  LIVREE:              { label: 'Livrée',        bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:             { label: 'Annulée',       bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function computeWeeklyData(commandes) {
  const data = JOURS.map(j => ({ jour: j, ventes: 0 }));
  commandes.forEach(c => {
    if (!c.created_at) return;
    const dayOfWeek = new Date(c.created_at).getDay();
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    data[idx].ventes += Number(c.total || 0);
  });
  return data;
}

const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function SellerDashboard() {
  const { user } = useAuth();
  const [commandes,   setCommandes]   = useState([]);
  const [produits,    setProduits]    = useState([]);
  const [stats,       setStats]       = useState({ revenus: 0, nbCommandes: 0, nbProduits: 0 });
  const [ventesData,  setVentesData]  = useState(JOURS.map(j => ({ jour: j, ventes: 0 })));
  const [loading,     setLoading]     = useState(true);
  const [periode,     setPeriode]     = useState('semaine');

  useEffect(() => {
    const charger = async () => {
      try {
        setLoading(true);
        const [ordersRes, produitsRes, walletRes] = await Promise.allSettled([
          OrderService.getSellerOrders({ page: 1 }),
          ProductService.mesProduits(),
          WalletService.monWallet(),
        ]);

        const orders   = ordersRes.status   === 'fulfilled' ? (ordersRes.value.results   || ordersRes.value   || []) : [];
        const listeP   = produitsRes.status === 'fulfilled' ? (Array.isArray(produitsRes.value) ? produitsRes.value : produitsRes.value.results || []) : [];
        const wallet   = walletRes.status   === 'fulfilled' ? walletRes.value : null;

        setCommandes(orders.slice(0, 5));
        setProduits(listeP.slice(0, 3));

        const solde   = Number(wallet?.solde ?? wallet?.available ?? 0);
        const totalCmds = ordersRes.status === 'fulfilled' ? (ordersRes.value.count ?? orders.length) : orders.length;

        setStats({ revenus: solde, nbCommandes: totalCmds, nbProduits: listeP.length });
        setVentesData(computeWeeklyData(orders));
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const produitsParCategorie = produits.reduce((acc, p) => {
    const cat = p.categorie_nom || p.category_name || 'Autre';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const stockData = Object.entries(produitsParCategorie).map(([nom, stock]) => ({ nom, stock }));

  const prenom = user?.prenom || user?.first_name || 'Vendeur';

  const sellerProfile   = user?.seller_profile;
  const estVerifie      = sellerProfile?.est_verifie;
  const demandeFaite    = !!sellerProfile?.date_demande_verification;
  const estRejete       = !estVerifie && !demandeFaite && !!sellerProfile?.motif_rejet;

  return (
    <DashboardLayout role="seller">
      <div>

        {/* BANNIÈRE VÉRIFICATION */}
        {sellerProfile && !estVerifie && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap',
              background: estRejete ? '#fef2f2' : demandeFaite ? '#fef3c7' : '#fff7ed',
              border: `1px solid ${estRejete ? '#fca5a5' : demandeFaite ? '#fde68a' : '#fed7aa'}`,
              borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '1.2rem',
            }}
          >
            {estRejete
              ? <XCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              : <Clock    size={20} color={ORANGE}   style={{ flexShrink: 0, marginTop: '2px' }} />
            }
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: estRejete ? '#991b1b' : '#92400e' }}>
                {estRejete
                  ? 'Vérification refusée'
                  : demandeFaite
                    ? 'Vérification de compte en cours'
                    : 'Compte non vérifié — vérification requise'}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: estRejete ? '#b91c1c' : '#b45309', marginTop: '3px' }}>
                {estRejete
                  ? <>Votre demande a été refusée par l'administrateur.{sellerProfile.motif_rejet && <> <strong>Motif :</strong> {sellerProfile.motif_rejet}</>} Corrigez vos documents et relancez une publication pour resoumettre.</>
                  : demandeFaite
                    ? "Votre demande a été transmise à l'administrateur. Vous serez notifié(e) une fois approuvé(e)."
                    : "Essayez de publier un produit pour soumettre une demande de vérification à l'administrateur."}
              </p>
            </div>
          </motion.div>
        )}

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Bonjour, {prenom}</h1>
            <p style={styles.headerSub}>Voici un résumé de votre activité</p>
          </div>
          <Link to="/seller/add-product" style={styles.btnAjouter}>
            + Ajouter un produit
          </Link>
        </motion.div>

        {/* STATS CARDS */}
        {loading ? (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ flex: '1 1 160px', height: '96px', borderRadius: '16px', background: '#f3f4f6' }} />)}
          </div>
        ) : (
          <div className="row g-3 mb-4">
            {[
              { label: 'Solde disponible', value: `${stats.revenus.toLocaleString('fr-FR')} FCFA`, icon: DollarSign, color: GREEN, bg: '#f0fdf4' },
              { label: 'Commandes reçues', value: stats.nbCommandes,  icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Produits actifs',  value: stats.nbProduits,   icon: Package,     color: ORANGE,   bg: '#fffbeb' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} className="col-12 col-sm-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                  <motion.div style={styles.statCard} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                    <div style={styles.statTop}>
                      <div style={{ ...styles.statIcon, background: s.bg }}>
                        <Icon size={22} color={s.color} />
                      </div>
                    </div>
                    <div style={styles.statValue}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* GRAPHIQUES */}
        <div className="row g-3 mb-4">

          <motion.div className="col-12 col-lg-8" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <TrendingUp size={18} color={GREEN} /><span> Évolution des ventes</span>
                </h3>
                <div style={styles.periodeSwitch}>
                  {['semaine', 'mois'].map(p => (
                    <button key={p} onClick={() => setPeriode(p)} style={{ ...styles.periodeBtn, background: periode === p ? GREEN : 'transparent', color: periode === p ? 'white' : '#6b7280' }}>
                      {p === 'semaine' ? '7 jours' : '30 jours'}
                    </button>
                  ))}
                </div>
              </div>
              {ventesData.every(d => d.ventes === 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#9ca3af', fontSize: '0.88rem' }}>
                  Aucune vente cette semaine
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={ventesData}>
                    <defs>
                      <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={GREEN} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={GREEN} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={v => [`${Number(v).toLocaleString('fr-FR')} FCFA`, 'Ventes']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="ventes" stroke={GREEN} strokeWidth={2.5} fill="url(#colorVentes)" dot={{ fill: GREEN, r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div className="col-12 col-lg-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
            <div style={styles.card}>
              <h3 style={{ ...styles.cardTitle, marginBottom: '1rem' }}>
                <Package size={18} color={ORANGE} /><span> Mes produits</span>
              </h3>
              {stockData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9ca3af', fontSize: '0.85rem', flexDirection: 'column', gap: '8px' }}>
                  <Package size={32} color="#e5e7eb" />
                  <span>Aucun produit</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stockData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nom" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="stock" fill="#f0c040" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

        </div>

        {/* COMMANDES + PRODUITS */}
        <div className="row g-3">

          <motion.div className="col-12 col-lg-7" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <ShoppingBag size={18} color="#2563eb" /><span> Dernières commandes</span>
                </h3>
                <Link to="/seller/orders" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader size={22} color={GREEN} /></div>
              ) : commandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.88rem' }}>Aucune commande reçue</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['ID', 'Montant', 'Statut', 'Date'].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {commandes.map((c, i) => {
                        const s    = STATUT_STYLE[c.status] || STATUT_STYLE.PAIEMENT_EN_ATTENTE;
                        const Icon = s.icon;
                        return (
                          <tr key={i} style={styles.tr}>
                            <td style={styles.td}><span style={styles.cmdId}>#{c.id}</span></td>
                            <td style={styles.td}><strong style={{ color: GREEN }}>{Number(c.total || 0).toLocaleString('fr-FR')} FCFA</strong></td>
                            <td style={styles.td}>
                              <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                                <Icon size={11} /> {s.label}
                              </span>
                            </td>
                            <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.78rem' }}>
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="col-12 col-lg-5" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Package size={18} color={ORANGE} /><span> Mes produits récents</span>
                </h3>
                <Link to="/seller/products" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader size={22} color={ORANGE} /></div>
              ) : produits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af', fontSize: '0.85rem' }}>Aucun produit publié</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {produits.map((p, i) => {
                    const nom = p.nom || p.name || 'Produit';
                    const prix = Number(p.prix || p.price || 0).toLocaleString('fr-FR');
                    const lieu = p.localisation || p.ville || '';
                    return (
                      <motion.div key={p.id || i} style={styles.produitItem} whileHover={{ x: 4 }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                          {p.image ? <img src={p.image} alt={nom} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} /> : <Leaf size={24} color="#d97706" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.produitNom}>{nom}</div>
                          {lieu && <div style={styles.produitLoc}><MapPin size={12} color="#6b7280" />{lieu}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={styles.produitPrix}>{prix} FCFA</div>
                          <span style={{ ...styles.badge, background: '#dcfce7', color: '#16a34a' }}>Actif</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: '1rem' }}>
                <Link to="/seller/add-product" style={styles.btnAddProduit}>
                  + Ajouter un produit
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>

      </div>
    </DashboardLayout>
  );
}

const styles = {
  header:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  headerTitle:   { fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  headerSub:     { fontSize: '0.88rem', color: '#6b7280', margin: 0 },
  btnAjouter:    { background: GREEN, color: 'white', padding: '0.6rem 1.4rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' },
  statCard:      { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  statTop:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  statIcon:      { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue:     { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px' },
  statLabel:     { fontSize: '0.8rem', color: '#6b7280' },
  card:          { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' },
  cardHeader:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle:     { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  periodeSwitch: { display: 'flex', background: '#f4f6f4', borderRadius: '8px', padding: '3px' },
  periodeBtn:    { border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  voirTout:      { fontSize: '0.82rem', color: GREEN, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  table:         { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:            { padding: '0.6rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:            { borderBottom: '1px solid #f9fafb' },
  td:            { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  cmdId:         { fontWeight: '700', color: GREEN, fontSize: '0.82rem' },
  badge:         { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  produitItem:   { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  produitNom:    { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' },
  produitLoc:    { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  produitPrix:   { fontWeight: '800', fontSize: '0.88rem', color: GREEN, marginBottom: '4px' },
  btnAddProduit: { display: 'block', textAlign: 'center', background: '#f0fdf4', color: GREEN, border: '2px dashed #86efac', borderRadius: '12px', padding: '0.7rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },
};
