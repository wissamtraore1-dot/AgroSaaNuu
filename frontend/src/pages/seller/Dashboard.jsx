import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Package,
  DollarSign, Eye, ArrowUpRight,
  MapPin, Clock, CheckCircle, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const statsCards = [
  { label: 'Revenus du mois',   value: '450 000 FCFA', icon: DollarSign,  color: '#1a5c2a', bg: '#f0fdf4', change: '+12%' },
  { label: 'Commandes reçues',  value: '24',           icon: ShoppingBag, color: '#2563eb', bg: '#eff6ff', change: '+5%'  },
  { label: 'Produits actifs',   value: '8',            icon: Package,     color: '#d97706', bg: '#fffbeb', change: '0%'   },
  { label: 'Vues du profil',    value: '1 240',        icon: Eye,         color: '#7c3aed', bg: '#f5f3ff', change: '+18%' },
];

const ventesData = [
  { jour: 'Lun', ventes: 45000  },
  { jour: 'Mar', ventes: 82000  },
  { jour: 'Mer', ventes: 61000  },
  { jour: 'Jeu', ventes: 120000 },
  { jour: 'Ven', ventes: 95000  },
  { jour: 'Sam', ventes: 140000 },
  { jour: 'Dim', ventes: 78000  },
];

const produitsData = [
  { nom: 'Maïs', stock: 4 },
  { nom: 'Riz',  stock: 7 },
  { nom: 'Soja', stock: 2 },
  { nom: 'Mil',  stock: 5 },
];

const commandes = [
  { id: '#CMD001', produit: 'Maïs 2t',  acheteur: 'Kofi A.',  montant: '120 000', statut: 'En attente',  date: 'Aujourd\'hui' },
  { id: '#CMD002', produit: 'Riz 3t',   acheteur: 'Sèna B.',  montant: '180 000', statut: 'Confirmée',   date: 'Hier'         },
  { id: '#CMD003', produit: 'Soja 1t',  acheteur: 'Yao D.',   montant: '67 000',  statut: 'Livrée',      date: '3 jours'      },
  { id: '#CMD004', produit: 'Maïs 5t',  acheteur: 'Afi K.',   montant: '300 000', statut: 'Annulée',     date: '5 jours'      },
];

const produits = [
  { id: 1, nom: 'Maïs 2t',  localisation: 'Bankoura', prix: '100 000', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=80&q=80' },
  { id: 2, nom: 'Riz 3t',   localisation: 'Parakou',  prix: '180 000', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&q=80' },
  { id: 3, nom: 'Soja 1t',  localisation: 'Nikki',    prix: '67 000',  image: 'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=80&q=80' },
];

const statutStyle = {
  'En attente': { bg: '#fef3c7', color: '#d97706' },
  'Confirmée':  { bg: '#dbeafe', color: '#2563eb' },
  'Livrée':     { bg: '#dcfce7', color: '#16a34a' },
  'Annulée':    { bg: '#fee2e2', color: '#dc2626' },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function SellerDashboard() {
  const [periode, setPeriode] = useState('semaine');

  return (
    <DashboardLayout role="seller">
      <div>

        {/* ===== EN-TÊTE ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.header}
        >
          <div>
            <h1 style={styles.headerTitle}>Bonjour, Moussa 👋</h1>
            <p style={styles.headerSub}>
              Voici un résumé de votre activité aujourd'hui
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/seller/products/add" style={styles.btnAjouter}>
              + Ajouter un produit
            </Link>
          </motion.div>
        </motion.div>

        {/* ===== STATS CARDS ===== */}
        <div className="row g-3 mb-4">
          {statsCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="col-6 col-lg-3"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.08 }}
              >
                <motion.div
                  style={styles.statCard}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                >
                  <div style={styles.statTop}>
                    <div style={{ ...styles.statIcon, background: s.bg }}>
                      <Icon size={22} color={s.color} strokeWidth={2} />
                    </div>
                    <span style={{
                      ...styles.statChange,
                      color: s.change.startsWith('+') ? '#16a34a' : s.change === '0%' ? '#6b7280' : '#dc2626',
                    }}>
                      {s.change}
                    </span>
                  </div>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== GRAPHIQUES ===== */}
        <div className="row g-3 mb-4">

          {/* GRAPHIQUE VENTES */}
          <motion.div
            className="col-12 col-lg-8"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <TrendingUp size={18} color="#1a5c2a" /> Évolution des ventes
                </h3>
                <div style={styles.periodeSwitch}>
                  {['semaine', 'mois'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriode(p)}
                      style={{
                        ...styles.periodeBtn,
                        background: periode === p ? '#1a5c2a' : 'transparent',
                        color:      periode === p ? 'white'   : '#6b7280',
                      }}
                    >
                      {p === 'semaine' ? '7 jours' : '30 jours'}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ventesData}>
                  <defs>
                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a5c2a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a5c2a" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip
                    formatter={(v) => [`${v.toLocaleString()} FCFA`, 'Ventes']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="ventes" stroke="#1a5c2a" strokeWidth={2.5} fill="url(#colorVentes)" dot={{ fill: '#1a5c2a', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* GRAPHIQUE STOCK */}
          <motion.div
            className="col-12 col-lg-4"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Package size={18} color="#d97706" /> Stock produits
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={produitsData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nom" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="stock" fill="#f0c040" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* ===== COMMANDES + PRODUITS ===== */}
        <div className="row g-3">

          {/* DERNIÈRES COMMANDES */}
          <motion.div
            className="col-12 col-lg-7"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <ShoppingBag size={18} color="#2563eb" /> Dernières commandes
                </h3>
                <Link to="/seller/orders" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['ID', 'Produit', 'Acheteur', 'Montant', 'Statut', 'Date'].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map((c, i) => (
                      <motion.tr
                        key={i}
                        style={styles.tr}
                        whileHover={{ background: '#f9fafb' }}
                      >
                        <td style={styles.td}>
                          <span style={styles.cmdId}>{c.id}</span>
                        </td>
                        <td style={styles.td}>{c.produit}</td>
                        <td style={styles.td}>{c.acheteur}</td>
                        <td style={styles.td}>
                          <strong style={{ color: '#1a5c2a' }}>{c.montant} FCFA</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: statutStyle[c.statut].bg,
                            color:      statutStyle[c.statut].color,
                          }}>
                            {c.statut === 'Livrée'    && <CheckCircle size={12} />}
                            {c.statut === 'Annulée'   && <XCircle     size={12} />}
                            {c.statut === 'En attente' && <Clock       size={12} />}
                            {c.statut}
                          </span>
                        </td>
                        <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>
                          {c.date}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* MES PRODUITS */}
          <motion.div
            className="col-12 col-lg-5"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Package size={18} color="#d97706" /> Mes produits
                </h3>
                <Link to="/seller/products" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {produits.map((p, i) => (
                  <motion.div
                    key={p.id}
                    style={styles.produitItem}
                    whileHover={{ x: 4 }}
                  >
                    <img
                      src={p.image}
                      alt={p.nom}
                      style={styles.produitImg}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={styles.produitNom}>{p.nom}</div>
                      <div style={styles.produitLoc}>
                        <MapPin size={12} color="#6b7280" />
                        {p.localisation}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={styles.produitPrix}>{p.prix} FCFA</div>
                      <span style={{ ...styles.badge, background: '#dcfce7', color: '#16a34a' }}>
                        Actif
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: '1rem' }}
              >
                <Link to="/seller/products/add" style={styles.btnAddProduit}>
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

// ===== STYLES =====
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  headerSub:   { fontSize: '0.88rem', color: '#6b7280', margin: 0 },
  btnAjouter:  {
    background: '#1a5c2a', color: 'white',
    padding: '0.6rem 1.4rem', borderRadius: '12px',
    textDecoration: 'none', fontWeight: '700',
    fontSize: '0.9rem', display: 'inline-flex',
    alignItems: 'center', gap: '6px',
    boxShadow: '0 4px 14px rgba(26,92,42,0.3)',
  },
  statCard:  { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  statTop:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  statIcon:  { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statChange:{ fontSize: '0.78rem', fontWeight: '700' },
  statValue: { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px' },
  statLabel: { fontSize: '0.8rem', color: '#6b7280' },
  card:      { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' },
  cardHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  periodeSwitch: { display: 'flex', background: '#f4f6f4', borderRadius: '8px', padding: '3px' },
  periodeBtn:    { border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  voirTout:  { fontSize: '0.82rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:        { padding: '0.6rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' },
  td:        { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  cmdId:     { fontWeight: '700', color: '#1a5c2a', fontSize: '0.82rem' },
  badge:     { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  produitItem:{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  produitImg: { width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  produitNom: { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' },
  produitLoc: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  produitPrix:{ fontWeight: '800', fontSize: '0.88rem', color: '#1a5c2a', marginBottom: '4px' },
  btnAddProduit: { display: 'block', textAlign: 'center', background: '#f0fdf4', color: '#1a5c2a', border: '2px dashed #86efac', borderRadius: '12px', padding: '0.7rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },
};