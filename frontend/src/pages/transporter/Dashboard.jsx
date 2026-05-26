import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Truck, Package, MapPin, Star,
  CheckCircle, Clock, XCircle, ArrowUpRight,
  TrendingUp, Navigation, AlertCircle, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';

// ===== MOCK DATA =====
const statsCards = [
  { label: 'Missions totales',   value: '36',          icon: Truck,       color: '#d97706', bg: '#fffbeb', change: '+4 ce mois'      },
  { label: 'En cours',          value: '2',            icon: Navigation,  color: '#2563eb', bg: '#eff6ff', change: '1 en attente'    },
  { label: 'Livraisons faites', value: '32',           icon: Package,     color: '#1a5c2a', bg: '#f0fdf4', change: '+3 cette semaine' },
  { label: 'Revenus du mois',   value: '280 000 FCFA', icon: DollarSign,  color: '#7c3aed', bg: '#f5f3ff', change: '+15%'            },
];

const revenusData = [
  { jour: 'Lun', revenus: 30000  },
  { jour: 'Mar', revenus: 55000  },
  { jour: 'Mer', revenus: 40000  },
  { jour: 'Jeu', revenus: 80000  },
  { jour: 'Ven', revenus: 65000  },
  { jour: 'Sam', revenus: 95000  },
  { jour: 'Dim', revenus: 50000  },
];

const missionsData = [
  { mois: 'Jan', missions: 4  },
  { mois: 'Fév', missions: 6  },
  { mois: 'Mar', missions: 5  },
  { mois: 'Avr', missions: 9  },
  { mois: 'Mai', missions: 7  },
  { mois: 'Jun', missions: 11 },
];

const missions = [
  {
    id: '#MSN001',
    produit:   'Maïs 2t',
    vendeur:   'Moussa K.',
    acheteur:  'Kofi A.',
    depart:    'Bankoura',
    arrivee:   'Cotonou',
    montant:   '45 000',
    statut:    'En cours',
    date:      "Aujourd'hui",
  },
  {
    id: '#MSN002',
    produit:   'Riz 3t',
    vendeur:   'Sèna B.',
    acheteur:  'Yao D.',
    depart:    'Parakou',
    arrivee:   'Porto-Novo',
    montant:   '60 000',
    statut:    'En attente',
    date:      'Hier',
  },
  {
    id: '#MSN003',
    produit:   'Soja 1t',
    vendeur:   'Afi K.',
    acheteur:  'Kofi A.',
    depart:    'Nikki',
    arrivee:   'Abomey',
    montant:   '35 000',
    statut:    'Livré',
    date:      '3 jours',
  },
  {
    id: '#MSN004',
    produit:   'Mil 2t',
    vendeur:   'Yao D.',
    acheteur:  'Sèna B.',
    depart:    'Natitingou',
    arrivee:   'Ouidah',
    montant:   '55 000',
    statut:    'Annulée',
    date:      '5 jours',
  },
];

const vehicules = [
  {
    id: 1,
    nom:         'Camion 10t',
    immatriculation: 'BJ-1234-AB',
    statut:      'Disponible',
    localisation:'Cotonou',
    image:       'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=120&q=80',
  },
  {
    id: 2,
    nom:         'Camion 5t',
    immatriculation: 'BJ-5678-CD',
    statut:      'En mission',
    localisation:'Parakou',
    image:       'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=120&q=80',
  },
];

const avis = [
  { id: 1, nom: 'Moussa K.', note: 5,   commentaire: 'Livraison rapide et soignée !',       date: 'Il y a 2 jours'   },
  { id: 2, nom: 'Kofi A.',   note: 4,   commentaire: 'Très professionnel, je recommande.',   date: 'Il y a 5 jours'   },
  { id: 3, nom: 'Sèna B.',   note: 4.5, commentaire: 'Ponctuel et sérieux.',                 date: 'Il y a 1 semaine' },
];

const statutStyle = {
  'En cours':   { bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  'En attente': { bg: '#fef3c7', color: '#d97706', icon: Clock       },
  'Livré':      { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  'Annulée':    { bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function TransporterDashboard() {
  const [disponible, setDisponible] = useState(true);

  return (
    <DashboardLayout role="transporter">
      <div>

        {/* ===== EN-TÊTE ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          style={styles.header}
        >
          <div>
            <h1 style={styles.headerTitle}>Bonjour, Sèna 👋</h1>
            <p style={styles.headerSub}>
              Gérez vos missions et suivez vos livraisons
            </p>
          </div>

          {/* TOGGLE DISPONIBILITÉ */}
          <div style={styles.disponibiliteWrap}>
            <span style={styles.disponibiliteLabel}>
              {disponible ? '🟢 Disponible' : '🔴 Indisponible'}
            </span>
            <motion.div
              style={{
                ...styles.toggleTrack,
                background: disponible ? '#1a5c2a' : '#d1d5db',
              }}
              onClick={() => setDisponible(!disponible)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                style={styles.toggleThumb}
                animate={{ x: disponible ? 22 : 2 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
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
                    <span style={{
                      ...styles.statChange,
                      color: s.change.startsWith('+') ? '#16a34a' : '#6b7280',
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

          {/* REVENUS */}
          <motion.div
            className="col-12 col-lg-8"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <TrendingUp size={18} color="#d97706" /> Revenus cette semaine
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenusData}>
                  <defs>
                    <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip
                    formatter={(v) => [`${v.toLocaleString()} FCFA`, 'Revenus']}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenus" stroke="#d97706" strokeWidth={2.5} fill="url(#colorRevenus)" dot={{ fill: '#d97706', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* MISSIONS PAR MOIS */}
          <motion.div
            className="col-12 col-lg-4"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Truck size={18} color="#d97706" /> Missions / mois
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={missionsData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="missions" fill="#f0c040" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* ===== MISSIONS + VÉHICULES ===== */}
        <div className="row g-3 mb-4">

          {/* DERNIÈRES MISSIONS */}
          <motion.div
            className="col-12 col-lg-8"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Navigation size={18} color="#2563eb" /> Mes missions
                </h3>
                <Link to="/transporter/jobs" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['ID', 'Produit', 'Trajet', 'Montant', 'Statut', 'Date'].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((m, i) => {
                      const s    = statutStyle[m.statut];
                      const Icon = s.icon;
                      return (
                        <motion.tr
                          key={i}
                          style={styles.tr}
                          whileHover={{ background: '#f9fafb' }}
                        >
                          <td style={styles.td}>
                            <span style={styles.msnId}>{m.id}</span>
                          </td>
                          <td style={styles.td}>{m.produit}</td>
                          <td style={styles.td}>
                            <div style={styles.trajet}>
                              <MapPin size={12} color="#6b7280" />
                              <span>{m.depart}</span>
                              <span style={{ color: '#d97706' }}>→</span>
                              <span>{m.arrivee}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <strong style={{ color: '#d97706' }}>{m.montant} FCFA</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                              <Icon size={12} />
                              {m.statut}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>
                            {m.date}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* MES VÉHICULES */}
          <motion.div
            className="col-12 col-lg-4"
            variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }}
          >
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <Truck size={18} color="#d97706" /> Mes véhicules
                </h3>
                <Link to="/transporter/vehicles" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vehicules.map((v) => (
                  <motion.div
                    key={v.id}
                    style={styles.vehiculeCard}
                    whileHover={{ x: 4 }}
                  >
                    <img
                      src={v.image}
                      alt={v.nom}
                      style={styles.vehiculeImg}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x60?text=Camion'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={styles.vehiculeNom}>{v.nom}</div>
                      <div style={styles.vehiculeImmat}>{v.immatriculation}</div>
                      <div style={styles.vehiculeLoc}>
                        <MapPin size={12} color="#6b7280" /> {v.localisation}
                      </div>
                    </div>
                    <span style={{
                      ...styles.badge,
                      background: v.statut === 'Disponible' ? '#dcfce7' : '#dbeafe',
                      color:      v.statut === 'Disponible' ? '#16a34a' : '#2563eb',
                    }}>
                      {v.statut === 'Disponible'
                        ? <CheckCircle size={12} />
                        : <Navigation  size={12} />
                      }
                      {v.statut}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* AJOUTER VÉHICULE */}
              <motion.div whileHover={{ scale: 1.02 }} style={{ marginTop: '1rem' }}>
                <Link to="/transporter/vehicles/add" style={styles.btnAddVehicule}>
                  + Ajouter un véhicule
                </Link>
              </motion.div>

            </div>
          </motion.div>

        </div>

        {/* ===== AVIS CLIENTS ===== */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.7 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <Star size={18} color="#f0c040" fill="#f0c040" /> Avis clients
              </h3>
              <div style={styles.noteMoyenne}>
                <Star size={16} color="#f0c040" fill="#f0c040" />
                <span style={styles.noteMoyenneText}>4.8 / 5</span>
              </div>
            </div>

            <div className="row g-3">
              {avis.map((a, i) => (
                <motion.div
                  key={a.id}
                  className="col-12 col-md-4"
                  whileHover={{ y: -4 }}
                >
                  <div style={styles.avisCard}>
                    {/* ÉTOILES */}
                    <div style={styles.etoiles}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={14}
                          color="#f0c040"
                          fill={n <= a.note ? '#f0c040' : 'transparent'}
                        />
                      ))}
                      <span style={styles.noteValue}>{a.note}</span>
                    </div>
                    <p style={styles.avisCommentaire}>"{a.commentaire}"</p>
                    <div style={styles.avisFooter}>
                      <div style={styles.avisAvatar}>{a.nom[0]}</div>
                      <div>
                        <div style={styles.avisNom}>{a.nom}</div>
                        <div style={styles.avisDate}>{a.date}</div>
                      </div>
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

  // TOGGLE DISPONIBILITÉ
  disponibiliteWrap:  { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #e5e7eb' },
  disponibiliteLabel: { fontSize: '0.88rem', fontWeight: '600', color: '#374151' },
  toggleTrack:        { width: '46px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0 },
  toggleThumb:        { position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' },

  // STATS
  statCard:   { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  statTop:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  statIcon:   { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statChange: { fontSize: '0.78rem', fontWeight: '700' },
  statValue:  { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px' },
  statLabel:  { fontSize: '0.8rem', color: '#6b7280' },

  // CARDS
  card:       { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  voirTout:   { fontSize: '0.82rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },

  // TABLE
  table:  { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:     { padding: '0.6rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:     { borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' },
  td:     { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  msnId:  { fontWeight: '700', color: '#d97706', fontSize: '0.82rem' },
  trajet: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' },
  badge:  { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },

  // VÉHICULES
  vehiculeCard:  { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer' },
  vehiculeImg:   { width: '70px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  vehiculeNom:   { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' },
  vehiculeImmat: { fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  vehiculeLoc:   { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' },
  btnAddVehicule:{ display: 'block', textAlign: 'center', background: '#fffbeb', color: '#d97706', border: '2px dashed #fbbf24', borderRadius: '12px', padding: '0.7rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },

  // AVIS
  noteMoyenne:     { display: 'flex', alignItems: 'center', gap: '6px' },
  noteMoyenneText: { fontWeight: '800', fontSize: '1rem', color: '#1a2e10' },
  avisCard:        { background: '#fafafa', borderRadius: '14px', padding: '1.2rem', border: '1px solid #f0f0f0' },
  etoiles:         { display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '0.7rem' },
  noteValue:       { fontSize: '0.82rem', fontWeight: '700', color: '#1a2e10', marginLeft: '4px' },
  avisCommentaire: { fontSize: '0.87rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '1rem' },
  avisFooter:      { display: 'flex', alignItems: 'center', gap: '10px' },
  avisAvatar:      { width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.88rem', flexShrink: 0 },
  avisNom:         { fontWeight: '700', fontSize: '0.85rem', color: '#1a2e10' },
  avisDate:        { fontSize: '0.75rem', color: '#6b7280' },
};