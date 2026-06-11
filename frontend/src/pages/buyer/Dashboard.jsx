import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Package, Clock, CheckCircle,
  XCircle, MapPin, ArrowUpRight, Search,
  Truck, TrendingUp, Navigation, Loader, Heart, Leaf,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import OrderService from '../../services/order.service';
import ProductService from '../../services/product.service';
import WalletService from '../../services/wallet.service';

const BLEU  = '#2563eb';
const GREEN = '#1a5c2a';

const STATUT_STYLE = {
  PAIEMENT_EN_ATTENTE: { label: 'En attente',  bg: '#fef3c7', color: '#d97706', icon: Clock       },
  PAIEMENT_RECU:       { label: 'Payée',        bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
  EN_PREPARATION:      { label: 'Préparation',  bg: '#ede9fe', color: '#7c3aed', icon: Package     },
  EN_LIVRAISON:        { label: 'En livraison', bg: '#dbeafe', color: '#2563eb', icon: Truck       },
  LIVREE:              { label: 'Livrée',       bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:             { label: 'Annulée',      bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function computeWeeklyData(commandes) {
  const data = JOURS.map(j => ({ jour: j, depenses: 0 }));
  commandes.forEach(c => {
    if (!c.created_at) return;
    const dayOfWeek = new Date(c.created_at).getDay();
    const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    data[idx].depenses += Number(c.total || 0);
  });
  return data;
}

const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function BuyerDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [commandes,    setCommandes]    = useState([]);
  const [favoris,      setFavoris]      = useState([]);
  const [stats,        setStats]        = useState({ total: 0, enCours: 0, livrees: 0, depenses: 0 });
  const [depensesData, setDepensesData] = useState(JOURS.map(j => ({ jour: j, depenses: 0 })));
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    const charger = async () => {
      try {
        setLoading(true);
        const [ordersRes, favorisRes, walletRes] = await Promise.allSettled([
          OrderService.getBuyerOrders({ page: 1 }),
          ProductService.mesFavoris(),
          WalletService.monWallet(),
        ]);

        const orders = ordersRes.status  === 'fulfilled' ? (ordersRes.value.results  || ordersRes.value  || []) : [];
        const favs   = favorisRes.status === 'fulfilled' ? (Array.isArray(favorisRes.value) ? favorisRes.value : favorisRes.value.results || []) : [];
        const wallet = walletRes.status  === 'fulfilled' ? walletRes.value : null;

        setCommandes(orders.slice(0, 4));
        setFavoris(favs.slice(0, 3));

        const enCours  = orders.filter(c => ['EN_PREPARATION', 'EN_LIVRAISON', 'PAIEMENT_RECU'].includes(c.status)).length;
        const livrees  = orders.filter(c => ['LIVREE', 'CONFIRMEE_RECEPTION', 'PAIEMENT_LIBERE'].includes(c.status)).length;
        const depenses = Number(wallet?.solde_depense ?? wallet?.total_spent ?? 0) || orders.reduce((s, c) => s + Number(c.total || 0), 0);
        const total    = ordersRes.status === 'fulfilled' ? (ordersRes.value.count ?? orders.length) : orders.length;

        setStats({ total, enCours, livrees, depenses });
        setDepensesData(computeWeeklyData(orders));
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const prenom = user?.prenom || user?.first_name || 'Acheteur';

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Bonjour, {prenom}</h1>
            <p style={styles.headerSub}>Trouvez les meilleures céréales au Bénin</p>
          </div>
          <div style={styles.searchWrap}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/buyer/catalog?q=${search}`)}
              style={styles.searchInput}
            />
          </div>
        </motion.div>

        {/* STATS */}
        {loading ? (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ flex: '1 1 130px', height: '96px', borderRadius: '16px', background: '#f3f4f6' }} />)}
          </div>
        ) : (
          <div className="row g-3 mb-4">
            {[
              { label: 'Commandes totales', value: stats.total,                                   icon: ShoppingCart, color: BLEU,    bg: '#eff6ff' },
              { label: 'En cours',          value: stats.enCours,                                 icon: Clock,        color: '#d97706', bg: '#fffbeb' },
              { label: 'Livrées',           value: stats.livrees,                                 icon: Package,      color: GREEN,     bg: '#f0fdf4' },
              { label: 'Total dépensé',     value: `${stats.depenses.toLocaleString('fr-FR')} F`, icon: TrendingUp,   color: '#7c3aed', bg: '#f5f3ff' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} className="col-6 col-lg-3" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
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

        {/* GRAPHIQUE DÉPENSES */}
        <motion.div className="mb-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <TrendingUp size={18} color={BLEU} /><span> Mes dépenses cette semaine</span>
              </h3>
            </div>
            {depensesData.every(d => d.depenses === 0) ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9ca3af', fontSize: '0.88rem' }}>
                Aucune dépense enregistrée cette semaine
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={depensesData}>
                  <defs>
                    <linearGradient id="colorDep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={BLEU} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={BLEU} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={v => [`${Number(v).toLocaleString('fr-FR')} FCFA`, 'Dépenses']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="depenses" stroke={BLEU} strokeWidth={2.5} fill="url(#colorDep)" dot={{ fill: BLEU, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* COMMANDES + FAVORIS */}
        <div className="row g-3 mb-4">

          <motion.div className="col-12 col-lg-7" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <ShoppingCart size={18} color={BLEU} /><span> Mes commandes récentes</span>
                </h3>
                <Link to="/buyer/orders" style={{ ...styles.voirTout, color: BLEU }}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader size={22} color={BLEU} /></div>
              ) : commandes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontSize: '0.88rem' }}>Aucune commande passée</div>
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
                          <motion.tr key={i} style={styles.tr} whileHover={{ background: '#f9fafb' }}
                            onClick={() => navigate(`/buyer/orders/${c.id}`)} className="cursor-pointer">
                            <td style={styles.td}><span style={{ ...styles.cmdId, color: BLEU }}>#{c.id}</span></td>
                            <td style={styles.td}><strong style={{ color: BLEU }}>{Number(c.total || 0).toLocaleString('fr-FR')} FCFA</strong></td>
                            <td style={styles.td}>
                              <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                                <Icon size={11} /><span> {s.label}</span>
                              </span>
                            </td>
                            <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.78rem' }}>
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="col-12 col-lg-5" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Heart size={18} color="#dc2626" /><span> Produits favoris</span>
                </h3>
                <Link to="/buyer/catalog" style={{ ...styles.voirTout, color: BLEU }}>
                  Catalogue <ArrowUpRight size={14} />
                </Link>
              </div>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader size={22} color={BLEU} /></div>
              ) : favoris.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#9ca3af', fontSize: '0.85rem' }}>Aucun favori enregistré</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {favoris.map((p, i) => {
                    const nom = p.nom || p.name || 'Produit';
                    const prix = Number(p.prix || p.price || 0).toLocaleString('fr-FR');
                    const lieu = p.localisation || p.ville || '';
                    return (
                      <motion.div key={p.id || i} style={styles.produitItem} whileHover={{ x: 4 }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, overflow: 'hidden' }}>
                          {p.image ? <img src={p.image} alt={nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Leaf size={24} color="#d97706" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.produitNom}>{nom}</div>
                          {lieu && <div style={styles.produitLoc}><MapPin size={12} color="#6b7280" />{lieu}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ ...styles.produitPrix, color: BLEU }}>{prix} FCFA</div>
                          <motion.button
                            onClick={() => navigate(`/buyer/catalog`)}
                            style={{ background: BLEU, color: 'white', border: 'none', borderRadius: '8px', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          >
                            Commander
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </DashboardLayout>
  );
}

const styles = {
  header:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  headerTitle:  { fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  headerSub:    { fontSize: '0.88rem', color: '#6b7280', margin: 0 },
  searchWrap:   { position: 'relative', display: 'flex', alignItems: 'center' },
  searchInput:  { padding: '0.6rem 1rem 0.6rem 2.4rem', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '0.88rem', outline: 'none', background: 'white', width: '240px' },
  statCard:     { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  statTop:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  statIcon:     { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue:    { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '2px' },
  statLabel:    { fontSize: '0.8rem', color: '#6b7280' },
  card:         { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0' },
  cardHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle:    { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  voirTout:     { fontSize: '0.82rem', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:           { padding: '0.6rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:           { borderBottom: '1px solid #f9fafb', transition: 'background 0.2s', cursor: 'pointer' },
  td:           { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  cmdId:        { fontWeight: '700', fontSize: '0.82rem' },
  badge:        { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  produitItem:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer' },
  produitNom:   { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' },
  produitLoc:   { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  produitPrix:  { fontWeight: '800', fontSize: '0.88rem', marginBottom: '6px' },
};
