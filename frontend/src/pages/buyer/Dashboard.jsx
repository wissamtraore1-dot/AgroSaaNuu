import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Package, Clock, CheckCircle,
  XCircle, MapPin, ArrowUpRight, Search,
  Truck, Star, Heart, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const statsCards = [
  { label: 'Commandes totales',  value: '18',          icon: ShoppingCart, color: '#2563eb', bg: '#eff6ff', change: '+3 ce mois' },
  { label: 'En cours',          value: '4',            icon: Clock,        color: '#d97706', bg: '#fffbeb', change: '2 en attente' },
  { label: 'Livraisons reçues', value: '12',           icon: Package,      color: '#1a5c2a', bg: '#f0fdf4', change: '+2 cette semaine' },
  { label: 'Total dépensé',     value: '840 000 FCFA', icon: TrendingUp,   color: '#7c3aed', bg: '#f5f3ff', change: 'ce mois' },
];

const depensesData = [
  { jour: 'Lun', depenses: 60000  },
  { jour: 'Mar', depenses: 120000 },
  { jour: 'Mer', depenses: 80000  },
  { jour: 'Jeu', depenses: 200000 },
  { jour: 'Ven', depenses: 150000 },
  { jour: 'Sam', depenses: 90000  },
  { jour: 'Dim', depenses: 140000 },
];

const commandes = [
  { id: '#CMD001', produit: 'Maïs 2t',  vendeur: 'Moussa K.', montant: '120 000', statut: 'En attente',  date: "Aujourd'hui" },
  { id: '#CMD002', produit: 'Riz 3t',   vendeur: 'Kofi A.',   montant: '180 000', statut: 'En cours',    date: 'Hier'         },
  { id: '#CMD003', produit: 'Soja 1t',  vendeur: 'Sèna B.',   montant: '67 000',  statut: 'Livré',       date: '3 jours'      },
  { id: '#CMD004', produit: 'Mil 2t',   vendeur: 'Yao D.',    montant: '95 000',  statut: 'Annulée',     date: '5 jours'      },
];

const produitsFavoris = [
  { id: 1, nom: 'Maïs 2t',  localisation: 'Bankoura', prix: '100 000', note: 4.8, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=80&q=80' },
  { id: 2, nom: 'Riz 3t',   localisation: 'Parakou',  prix: '180 000', note: 4.5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&q=80' },
  { id: 3, nom: 'Soja 1t',  localisation: 'Nikki',    prix: '67 000',  note: 4.7, image: 'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=80&q=80' },
];

const transporteurs = [
  { id: 1, nom: 'Moussa T.', vehicule: 'Camion 10t', note: 4.9, localisation: 'Cotonou',  avatar: 'https://i.pravatar.cc/60?img=11' },
  { id: 2, nom: 'Kofi A.',   vehicule: 'Camion 5t',  note: 4.6, localisation: 'Parakou',  avatar: 'https://i.pravatar.cc/60?img=12' },
];

const statutStyle = {
  'En attente': { bg: '#fef3c7', color: '#d97706', icon: Clock        },
  'En cours':   { bg: '#dbeafe', color: '#2563eb', icon: Truck        },
  'Livré':      { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle  },
  'Annulée':    { bg: '#fee2e2', color: '#dc2626', icon: XCircle      },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function BuyerDashboard() {
  const [search, setSearch] = useState('');

  return (
    <DashboardLayout role="buyer">
      <div>

        {/* ===== EN-TÊTE ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.header}
        >
          <div>
            <h1 style={styles.headerTitle}>Bonjour, Kofi 👋</h1>
            <p style={styles.headerSub}>
              Trouvez les meilleures céréales au Bénin
            </p>
          </div>

          {/* BARRE DE RECHERCHE RAPIDE */}
          <div style={styles.searchWrap}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
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
                  </div>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                  <div style={{ ...styles.statChange, color: s.color }}>{s.change}</div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== GRAPHIQUE DÉPENSES ===== */}
        <motion.div
          className="mb-4"
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <TrendingUp size={18} color="#2563eb" /> Mes dépenses cette semaine
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={depensesData}>
                <defs>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  formatter={(v) => [`${v.toLocaleString()} FCFA`, 'Dépenses']}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="depenses" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorDepenses)" dot={{ fill: '#2563eb', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ===== COMMANDES + FAVORIS ===== */}
        <div className="row g-3 mb-4">

          {/* DERNIÈRES COMMANDES */}
          <motion.div
            className="col-12 col-lg-7"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <ShoppingCart size={18} color="#2563eb" /> Mes commandes
                </h3>
                <Link to="/buyer/orders" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['ID', 'Produit', 'Vendeur', 'Montant', 'Statut', 'Date'].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map((c, i) => {
                      const s    = statutStyle[c.statut];
                      const Icon = s.icon;
                      return (
                        <motion.tr
                          key={i}
                          style={styles.tr}
                          whileHover={{ background: '#f9fafb' }}
                        >
                          <td style={styles.td}>
                            <span style={styles.cmdId}>{c.id}</span>
                          </td>
                          <td style={styles.td}>{c.produit}</td>
                          <td style={styles.td}>{c.vendeur}</td>
                          <td style={styles.td}>
                            <strong style={{ color: '#2563eb' }}>{c.montant} FCFA</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                              <Icon size={12} />
                              {c.statut}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>
                            {c.date}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* PRODUITS FAVORIS */}
          <motion.div
            className="col-12 col-lg-5"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Heart size={18} color="#dc2626" /> Produits favoris
                </h3>
                <Link to="/buyer/catalog" style={styles.voirTout}>
                  Catalogue <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {produitsFavoris.map((p) => (
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
                        <MapPin size={12} color="#6b7280" /> {p.localisation}
                      </div>
                      <div style={styles.produitNote}>
                        <Star size={12} color="#f0c040" fill="#f0c040" />
                        <span>{p.note}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={styles.produitPrix}>{p.prix} FCFA</div>
                      <motion.button
                        style={styles.btnAcheter}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Commander
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>

        {/* ===== TRANSPORTEURS SUGGÉRÉS ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <Truck size={18} color="#1a5c2a" /> Transporteurs disponibles près de vous
              </h3>
              <Link to="/transporters" style={styles.voirTout}>
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="row g-3">
              {transporteurs.map((t, i) => (
                <motion.div
                  key={t.id}
                  className="col-12 col-md-6"
                  whileHover={{ y: -4 }}
                >
                  <div style={styles.transportCard}>
                    <img src={t.avatar} alt={t.nom} style={styles.avatar} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.transportNom}>{t.nom}</div>
                      <div style={styles.transportInfo}>{t.vehicule}</div>
                      <div style={styles.transportLoc}>
                        <MapPin size={12} color="#6b7280" /> {t.localisation}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={styles.noteWrap}>
                        <Star size={13} color="#f0c040" fill="#f0c040" />
                        <span style={styles.noteText}>{t.note}</span>
                      </div>
                      <span style={{ ...styles.badge, background: '#dcfce7', color: '#16a34a' }}>
                        <CheckCircle size={11} /> Disponible
                      </span>
                      <motion.button
                        style={styles.btnContacter}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Contacter
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>

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
  searchWrap:  { position: 'relative', display: 'flex', alignItems: 'center' },
  searchInput: {
    padding: '0.6rem 1rem 0.6rem 2.4rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '0.88rem',
    outline: 'none',
    background: 'white',
    width: '240px',
  },
  statCard:   { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  statTop:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  statIcon:   { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue:  { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '2px' },
  statLabel:  { fontSize: '0.8rem', color: '#6b7280', marginBottom: '2px' },
  statChange: { fontSize: '0.75rem', fontWeight: '600' },
  card:       { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  voirTout:   { fontSize: '0.82rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:         { padding: '0.6rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:         { borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' },
  td:         { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  cmdId:      { fontWeight: '700', color: '#2563eb', fontSize: '0.82rem' },
  badge:      { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  produitItem:{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer' },
  produitImg: { width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  produitNom: { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' },
  produitLoc: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  produitNote:{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#d97706', marginTop: '2px' },
  produitPrix:{ fontWeight: '800', fontSize: '0.88rem', color: '#2563eb', marginBottom: '6px' },
  btnAcheter: { background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' },
  transportCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '14px', border: '1px solid #f0f0f0', background: '#fafafa' },
  avatar:     { width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0c040', flexShrink: 0 },
  transportNom:  { fontWeight: '700', fontSize: '0.92rem', color: '#1a2e10' },
  transportInfo: { fontSize: '0.8rem', color: '#6b7280' },
  transportLoc:  { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' },
  noteWrap:   { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', justifyContent: 'flex-end' },
  noteText:   { fontSize: '0.82rem', fontWeight: '700', color: '#1a2e10' },
  btnContacter: { display: 'block', width: '100%', marginTop: '6px', background: 'transparent', color: '#1a5c2a', border: '1.5px solid #1a5c2a', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' },
};