import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, Package, MapPin, Star,
  CheckCircle, Clock, XCircle, ArrowUpRight,
  TrendingUp, Navigation, AlertCircle, DollarSign, Loader,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import TransportService from '../../services/transport.service';

const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const JOURS_SEMAINE = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const STATUT_CONFIG = {
  PENDING:    { label: 'En attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  ACCEPTEE:   { label: 'Acceptée',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  EN_COURS:   { label: 'En cours',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  TERMINEE:   { label: 'Livré',      bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:    { label: 'Annulée',    bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
  // alias lowercase (selon backend)
  pending:    { label: 'En attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  accepted:   { label: 'Acceptée',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  in_transit: { label: 'En cours',   bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  completed:  { label: 'Livré',      bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  cancelled:  { label: 'Annulée',    bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const fadeUp = { hidden: { y: 30, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function TransporterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [disponible, setDisponible] = useState(false);
  const [missions,   setMissions]   = useState([]);
  const [vehicules,  setVehicules]  = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    try {
      setChargement(true);
      const [vehs, msns, dispo] = await Promise.all([
        TransportService.getMyVehicles().catch(() => []),
        TransportService.getMyMissions({ page: 1 }).catch(() => ({ results: [] })),
        TransportService.getAvailability().catch(() => ({ est_disponible: false })),
      ]);
      setVehicules(Array.isArray(vehs) ? vehs : vehs.results || []);
      setMissions(msns.results || []);
      setDisponible(dispo.est_disponible ?? false);
    } finally {
      setChargement(false);
    }
  };

  const toggleDisponibilite = async () => {
    const newVal = !disponible;
    setDisponible(newVal);
    try { await TransportService.setAvailability(newVal); }
    catch { setDisponible(!newVal); }
  };

  // ─── Stats calculées ────────────────────────────────────────────────────
  const isEnCours  = s => ['ACCEPTEE','EN_COURS','accepted','in_transit'].includes(s);
  const isTerminee = s => ['TERMINEE','completed'].includes(s);
  const isPending  = s => ['PENDING','pending'].includes(s);

  const enCours   = missions.filter(m => isEnCours(m.status)).length;
  const terminees = missions.filter(m => isTerminee(m.status)).length;
  const enAttente = missions.filter(m => isPending(m.status)).length;

  const now = new Date();
  const revenusMois = missions
    .filter(m => {
      const d = new Date(m.created_at);
      return isTerminee(m.status) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, m) => s + (Number(m.tarif) || Number(m.cout) || Number(m.montant) || 0), 0);

  const statsCards = [
    { label: 'Missions totales',   value: missions.length,   icon: Truck,       color: '#d97706', bg: '#fffbeb', change: `${terminees} terminées`   },
    { label: 'En cours',          value: enCours,            icon: Navigation,  color: '#2563eb', bg: '#eff6ff', change: `${enAttente} en attente`   },
    { label: 'Livraisons faites', value: terminees,          icon: Package,     color: '#1a5c2a', bg: '#f0fdf4', change: 'total'                     },
    {
      label: 'Revenus du mois',
      value: revenusMois > 0 ? `${revenusMois.toLocaleString('fr-FR')} FCFA` : '— FCFA',
      icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff',
      change: `${MOIS_LABELS[now.getMonth()]} ${now.getFullYear()}`,
    },
  ];

  // ─── Graphiques ─────────────────────────────────────────────────────────
  const missionsParMois = MOIS_LABELS.map((mois, i) => ({
    mois,
    missions: missions.filter(m => new Date(m.created_at).getMonth() === i).length,
  }));

  const debutSemaine = new Date(now);
  debutSemaine.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const revenusParJour = JOURS_SEMAINE.map((jour, i) => {
    const target = new Date(debutSemaine); target.setDate(debutSemaine.getDate() + i);
    const rev = missions
      .filter(m => {
        const d = new Date(m.created_at);
        return isTerminee(m.status) &&
          d.toDateString() === target.toDateString();
      })
      .reduce((s, m) => s + (Number(m.tarif) || Number(m.cout) || Number(m.montant) || 0), 0);
    return { jour, revenus: rev };
  });

  // ─── Nom affiché ────────────────────────────────────────────────────────
  const prenom = user?.prenom || user?.first_name || (user?.nom || '').split(' ').pop() || 'Transporteur';

  // ─── Skeleton loader ────────────────────────────────────────────────────
  if (chargement) {
    return (
      <DashboardLayout role="transporter">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: '80px', borderRadius: '16px', background: '#f3f4f6', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="transporter">
      <div>

        {/* ===== BANNIÈRE VÉRIFICATION ===== */}
        {user?.transporter_profile && !user.transporter_profile.est_verifie && (() => {
          const tp          = user.transporter_profile;
          const demandeFaite = !!tp.date_demande_verification;
          const estRejete    = !demandeFaite && !!tp.motif_rejet;
          return (
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
                : <Clock    size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              }
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: estRejete ? '#991b1b' : '#92400e' }}>
                  {estRejete ? 'Vérification refusée' : demandeFaite ? 'Vérification de compte en cours' : 'Compte non vérifié — vérification requise'}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: estRejete ? '#b91c1c' : '#b45309', marginTop: '3px' }}>
                  {estRejete
                    ? <>Votre demande a été refusée par l'administrateur.{tp.motif_rejet && <> <strong>Motif :</strong> {tp.motif_rejet}</>} Corrigez vos documents et relancez une mission pour resoumettre.</>
                    : demandeFaite
                      ? "Votre demande a été transmise à l'administrateur. Vous serez notifié(e) une fois approuvé(e)."
                      : "Votre compte est en attente de vérification. L'administrateur traitera votre dossier sous 5 heures."}
                </p>
              </div>
            </motion.div>
          );
        })()}

        {/* ===== BANNER PROFIL INCOMPLET ===== */}
        {!user?.cip && (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: '#fffbeb', border: '1px solid #fde047', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} color="#d97706" />
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#92400e' }}>Profil incomplet</p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#b45309' }}>Enregistrez votre véhicule pour pouvoir accepter des missions de livraison.</p>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/transporter/enregistrer-vehicule')}
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.65rem 1.4rem', fontWeight: '700', fontSize: '0.87rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <span>Enregistrer mon véhicule</span>
            </motion.button>
          </motion.div>
        )}

        {/* ===== EN-TÊTE ===== */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Bonjour, {prenom}</h1>
            <p style={styles.headerSub}>Gérez vos missions et suivez vos livraisons</p>
          </div>
          <div style={styles.disponibiliteWrap}>
            <span style={styles.disponibiliteLabel}>
              {disponible ? 'Disponible' : 'Indisponible'}
            </span>
            <motion.div
              style={{ ...styles.toggleTrack, background: disponible ? '#1a5c2a' : '#d1d5db' }}
              onClick={toggleDisponibilite}
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
              <motion.div key={i} className="col-6 col-lg-3" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.08 }}>
                <motion.div style={styles.statCard} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                  <div style={styles.statTop}>
                    <div style={{ ...styles.statIcon, background: s.bg }}>
                      <Icon size={22} color={s.color} strokeWidth={2} />
                    </div>
                    <span style={{ ...styles.statChange, color: '#6b7280' }}>{s.change}</span>
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

          {/* REVENUS SEMAINE */}
          <motion.div className="col-12 col-lg-8" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><TrendingUp size={18} color="#d97706" /> Revenus cette semaine</h3>
              </div>
              {revenusParJour.some(d => d.revenus > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={revenusParJour}>
                    <defs>
                      <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`${Number(v).toLocaleString('fr-FR')} FCFA`, 'Revenus']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="revenus" stroke="#d97706" strokeWidth={2.5} fill="url(#colorRevenus)" dot={{ fill: '#d97706', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: '8px' }}>
                  <TrendingUp size={32} color="#e5e7eb" />
                  <span style={{ fontSize: '0.85rem' }}>Pas encore de revenus cette semaine</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* MISSIONS PAR MOIS */}
          <motion.div className="col-12 col-lg-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><Truck size={18} color="#d97706" /> Missions / mois</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={missionsParMois.slice(0, now.getMonth() + 1)} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="missions" fill="#f0c040" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* ===== MISSIONS + VÉHICULES ===== */}
        <div className="row g-3 mb-4">

          {/* DERNIÈRES MISSIONS */}
          <motion.div className="col-12 col-lg-8" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><Navigation size={18} color="#2563eb" /> Mes missions</h3>
                <Link to="/transporter/missions" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              {missions.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                  <Truck size={36} color="#e5e7eb" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.88rem', margin: 0 }}>Aucune mission pour l'instant</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['ID', 'Trajet', 'Montant', 'Statut', 'Date'].map(h => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {missions.slice(0, 5).map((m, i) => {
                        const cfg  = STATUT_CONFIG[m.status] || STATUT_CONFIG.PENDING;
                        const Icon = cfg.icon;
                        const montant = Number(m.tarif) || Number(m.cout) || Number(m.montant) || 0;
                        const depart  = m.ville_depart  || m.pickup_location  || '—';
                        const arrivee = m.ville_arrivee || m.delivery_location || '—';
                        return (
                          <motion.tr key={m.id || i} style={styles.tr} whileHover={{ background: '#f9fafb' }}>
                            <td style={styles.td}><span style={styles.msnId}>#{m.id}</span></td>
                            <td style={styles.td}>
                              <div style={styles.trajet}>
                                <MapPin size={12} color="#6b7280" />
                                <span>{depart}</span>
                                <span style={{ color: '#d97706' }}>→</span>
                                <span>{arrivee}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              {montant > 0
                                ? <strong style={{ color: '#d97706' }}>{montant.toLocaleString('fr-FR')} FCFA</strong>
                                : <span style={{ color: '#9ca3af' }}>—</span>
                              }
                            </td>
                            <td style={styles.td}>
                              <span style={{ ...styles.badge, background: cfg.bg, color: cfg.color }}>
                                <Icon size={12} /> {cfg.label}
                              </span>
                            </td>
                            <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>
                              {m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : '—'}
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

          {/* MES VÉHICULES */}
          <motion.div className="col-12 col-lg-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><Truck size={18} color="#d97706" /> Mes véhicules</h3>
                <Link to="/transporter/vehicles" style={styles.voirTout}>
                  Voir tout <ArrowUpRight size={14} />
                </Link>
              </div>

              {vehicules.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                  Aucun véhicule enregistré
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {vehicules.slice(0, 3).map(v => {
                    const estDispo = v.est_disponible ?? v.statut === 'Disponible';
                    return (
                      <motion.div key={v.id} style={styles.vehiculeCard} whileHover={{ x: 4 }}>
                        {v.photo
                          ? <img src={v.photo} alt={v.type} style={styles.vehiculeImg} onError={e => { e.target.style.display = 'none'; }} />
                          : <div style={{ ...styles.vehiculeImg, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={20} color="#9ca3af" /></div>
                        }
                        <div style={{ flex: 1 }}>
                          <div style={styles.vehiculeNom}>{v.type || v.nom || 'Véhicule'}</div>
                          <div style={styles.vehiculeImmat}>{v.immatriculation || '—'}</div>
                          <div style={styles.vehiculeLoc}>
                            <MapPin size={12} color="#6b7280" /> {v.localisation || v.ville || '—'}
                          </div>
                        </div>
                        <span style={{ ...styles.badge, background: estDispo ? '#dcfce7' : '#dbeafe', color: estDispo ? '#16a34a' : '#2563eb' }}>
                          {estDispo ? <CheckCircle size={12} /> : <Navigation size={12} />}
                          {estDispo ? 'Disponible' : 'En mission'}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} style={{ marginTop: '1rem' }}>
                <Link to="/transporter/enregistrer-vehicule" style={styles.btnAddVehicule}>
                  + Ajouter un véhicule
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
  header:            { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  headerTitle:       { fontSize: '1.5rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  headerSub:         { fontSize: '0.88rem', color: '#6b7280', margin: 0 },
  disponibiliteWrap: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #e5e7eb' },
  disponibiliteLabel:{ fontSize: '0.88rem', fontWeight: '600', color: '#374151' },
  toggleTrack:       { width: '46px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer', flexShrink: 0 },
  toggleThumb:       { position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' },
  statCard:          { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s' },
  statTop:           { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  statIcon:          { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statChange:        { fontSize: '0.78rem', fontWeight: '700' },
  statValue:         { fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', marginBottom: '4px' },
  statLabel:         { fontSize: '0.8rem', color: '#6b7280' },
  card:              { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #f0f0f0', height: '100%' },
  cardHeader:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle:         { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  voirTout:          { fontSize: '0.82rem', color: '#1a5c2a', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  table:             { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th:                { padding: '0.6rem 0.8rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.78rem', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  tr:                { borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' },
  td:                { padding: '0.75rem 0.8rem', color: '#374151', whiteSpace: 'nowrap' },
  msnId:             { fontWeight: '700', color: '#d97706', fontSize: '0.82rem' },
  trajet:            { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' },
  badge:             { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  vehiculeCard:      { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', cursor: 'pointer' },
  vehiculeImg:       { width: '70px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  vehiculeNom:       { fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' },
  vehiculeImmat:     { fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  vehiculeLoc:       { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' },
  btnAddVehicule:    { display: 'block', textAlign: 'center', background: '#fffbeb', color: '#d97706', border: '2px dashed #fbbf24', borderRadius: '12px', padding: '0.7rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },
};
