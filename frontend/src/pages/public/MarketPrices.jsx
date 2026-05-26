import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus,
  Search, MapPin, Calendar, RefreshCw,
  BarChart2, ArrowUpRight, ArrowDownRight,
  Filter, ChevronUp, ChevronDown, X
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ===== MOCK DATA =====
const prix = [
  { id: 1, produit: 'Maïs blanc',   categorie: 'Maïs',  unite: 'tonne', prix: 180000, variation: +5.2,  min: 160000, max: 200000, ville: 'Cotonou',     date: '10 Mai 2026' },
  { id: 2, produit: 'Maïs jaune',   categorie: 'Maïs',  unite: 'tonne', prix: 175000, variation: +2.1,  min: 155000, max: 195000, ville: 'Parakou',     date: '10 Mai 2026' },
  { id: 3, produit: 'Riz local',    categorie: 'Riz',   unite: 'tonne', prix: 320000, variation: -1.5,  min: 300000, max: 340000, ville: 'Cotonou',     date: '10 Mai 2026' },
  { id: 4, produit: 'Riz importé',  categorie: 'Riz',   unite: 'tonne', prix: 450000, variation: +3.8,  min: 420000, max: 480000, ville: 'Porto-Novo',  date: '10 Mai 2026' },
  { id: 5, produit: 'Soja certifié',categorie: 'Soja',  unite: 'tonne', prix: 280000, variation: 0,     min: 260000, max: 300000, ville: 'Natitingou',  date: '10 Mai 2026' },
  { id: 6, produit: 'Soja bio',     categorie: 'Soja',  unite: 'tonne', prix: 350000, variation: +7.1,  min: 320000, max: 380000, ville: 'Nikki',       date: '10 Mai 2026' },
  { id: 7, produit: 'Mil rouge',    categorie: 'Mil',   unite: 'tonne', prix: 210000, variation: -3.2,  min: 190000, max: 230000, ville: 'Djougou',     date: '10 Mai 2026' },
  { id: 8, produit: 'Mil blanc',    categorie: 'Mil',   unite: 'tonne', prix: 195000, variation: +1.4,  min: 175000, max: 215000, ville: 'Kandi',       date: '10 Mai 2026' },
  { id: 9, produit: 'Sorgho rouge', categorie: 'Sorgho',unite: 'tonne', prix: 160000, variation: -0.8,  min: 140000, max: 180000, ville: 'Banikoara',   date: '10 Mai 2026' },
  { id: 10,produit: 'Niébé',        categorie: 'Niébé', unite: 'tonne', prix: 420000, variation: +4.5,  min: 390000, max: 450000, ville: 'Parakou',     date: '10 Mai 2026' },
];

const historique = [
  { date: 'Jan', mais: 160000, riz: 300000, soja: 250000, mil: 180000 },
  { date: 'Fév', mais: 165000, riz: 310000, soja: 260000, mil: 185000 },
  { date: 'Mar', mais: 170000, riz: 305000, soja: 270000, mil: 190000 },
  { date: 'Avr', mais: 172000, riz: 315000, soja: 265000, mil: 200000 },
  { date: 'Mai', mais: 180000, riz: 320000, soja: 280000, mil: 210000 },
];

const categories = ['Tous', 'Maïs', 'Riz', 'Soja', 'Mil', 'Sorgho', 'Niébé'];

const villes = ['Toutes', 'Cotonou', 'Parakou', 'Porto-Novo', 'Natitingou', 'Nikki', 'Djougou', 'Kandi', 'Banikoara'];

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function MarketPrices() {
  const [search,      setSearch]      = useState('');
  const [categorie,   setCategorie]   = useState('Tous');
  const [ville,       setVille]       = useState('Toutes');
  const [sortField,   setSortField]   = useState('produit');
  const [sortDir,     setSortDir]     = useState('asc');
  const [lastUpdate]                  = useState('10 Mai 2026 — 08:00');

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const prixFiltres = useMemo(() => {
    let result = [...prix];
    if (search)               result = result.filter((p) => p.produit.toLowerCase().includes(search.toLowerCase()));
    if (categorie !== 'Tous') result = result.filter((p) => p.categorie === categorie);
    if (ville !== 'Toutes')   result = result.filter((p) => p.ville === ville);
    result.sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      return sortDir === 'asc'
        ? (typeof va === 'string' ? va.localeCompare(vb) : va - vb)
        : (typeof va === 'string' ? vb.localeCompare(va) : vb - va);
    });
    return result;
  }, [search, categorie, ville, sortField, sortDir]);

  // STATS RAPIDES
  const hausses  = prix.filter((p) => p.variation > 0).length;
  const baisses  = prix.filter((p) => p.variation < 0).length;
  const stables  = prix.filter((p) => p.variation === 0).length;
  const maxHausse = [...prix].sort((a, b) => b.variation - a.variation)[0];
  const maxBaisse = [...prix].sort((a, b) => a.variation - b.variation)[0];

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={14} color="#d1d5db" />;
    return sortDir === 'asc'
      ? <ChevronUp   size={14} color="#1a5c2a" />
      : <ChevronDown size={14} color="#1a5c2a" />;
  };

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* ===== HERO ===== */}
      <div style={styles.hero}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={styles.heroBreadcrumb}>
              <Link to="/" style={styles.breadLink}>Accueil</Link>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
              <span style={{ color: 'white' }}>Prix du marché</span>
            </div>
            <h1 style={styles.heroTitle}>📊 Prix du marché</h1>
            <p style={styles.heroSub}>
              Cours des céréales en temps réel au Bénin
            </p>
            <div style={styles.lastUpdate}>
              <RefreshCw size={14} />
              Dernière mise à jour : {lastUpdate}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-4">

        {/* ===== STATS RAPIDES ===== */}
        <div className="row g-3 mb-4">
          {[
            { label: 'En hausse',  value: hausses,  icon: TrendingUp,   color: '#16a34a', bg: '#dcfce7', suffix: ' produits' },
            { label: 'En baisse',  value: baisses,  icon: TrendingDown, color: '#dc2626', bg: '#fee2e2', suffix: ' produits' },
            { label: 'Stables',    value: stables,  icon: Minus,        color: '#6b7280', bg: '#f3f4f6', suffix: ' produits' },
            { label: 'Plus forte hausse', value: `+${maxHausse.variation}%`, icon: ArrowUpRight,   color: '#d97706', bg: '#fffbeb', suffix: ` (${maxHausse.produit})` },
            { label: 'Plus forte baisse', value: `${maxBaisse.variation}%`,  icon: ArrowDownRight, color: '#7c3aed', bg: '#f5f3ff', suffix: ` (${maxBaisse.produit})` },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="col-6 col-lg"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.08 }}
              >
                <div style={styles.statCard}>
                  <div style={{ ...styles.statIcon, background: s.bg }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                  <div style={styles.statSuffix}>{s.suffix}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== GRAPHIQUE ÉVOLUTION ===== */}
        <motion.div
          className="mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <BarChart2 size={18} color="#1a5c2a" />
                Évolution des prix — 5 derniers mois (FCFA/tonne)
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historique}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  formatter={(v, name) => [`${v.toLocaleString('fr-FR')} FCFA`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                />
                <Legend formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                <Line type="monotone" dataKey="mais"  stroke="#1a5c2a" strokeWidth={2.5} dot={{ r: 4 }} name="Maïs"  />
                <Line type="monotone" dataKey="riz"   stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} name="Riz"   />
                <Line type="monotone" dataKey="soja"  stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} name="Soja"  />
                <Line type="monotone" dataKey="mil"   stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} name="Mil"   />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ===== FILTRES ===== */}
        <motion.div
          className="mb-3"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          <div style={styles.filtersBar}>

            {/* RECHERCHE */}
            <div style={styles.searchWrap}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              {search && (
                <button onClick={() => setSearch('')} style={styles.clearBtn}>
                  <X size={14} color="#9ca3af" />
                </button>
              )}
            </div>

            {/* CATÉGORIES */}
            <div style={styles.catsWrap}>
              {categories.map((c) => (
                <motion.button
                  key={c}
                  style={{
                    ...styles.catBtn,
                    background:  categorie === c ? '#1a5c2a' : 'white',
                    color:       categorie === c ? 'white'   : '#374151',
                    borderColor: categorie === c ? '#1a5c2a' : '#e5e7eb',
                  }}
                  onClick={() => setCategorie(c)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {c}
                </motion.button>
              ))}
            </div>

            {/* VILLE */}
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              style={styles.villeSelect}
            >
              {villes.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

          </div>
        </motion.div>

        {/* ===== TABLEAU DES PRIX ===== */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <Filter size={16} color="#1a5c2a" />
                Cours des céréales
                <span style={styles.resultBadge}>{prixFiltres.length} résultats</span>
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    {[
                      { label: 'Produit',    field: 'produit'   },
                      { label: 'Catégorie',  field: 'categorie' },
                      { label: 'Ville',      field: 'ville'     },
                      { label: 'Prix/tonne', field: 'prix'      },
                      { label: 'Variation',  field: 'variation' },
                      { label: 'Min',        field: 'min'       },
                      { label: 'Max',        field: 'max'       },
                      { label: 'Date',       field: 'date'      },
                    ].map((col) => (
                      <th
                        key={col.field}
                        style={styles.th}
                        onClick={() => handleSort(col.field)}
                      >
                        <div style={styles.thInner}>
                          {col.label}
                          <SortIcon field={col.field} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {prixFiltres.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                          🔍 Aucun résultat pour cette recherche
                        </td>
                      </tr>
                    ) : (
                      prixFiltres.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          style={styles.tr}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ background: '#f9fafb' }}
                        >
                          {/* PRODUIT */}
                          <td style={styles.td}>
                            <span style={styles.produitNom}>{p.produit}</span>
                          </td>

                          {/* CATÉGORIE */}
                          <td style={styles.td}>
                            <span style={styles.catBadge}>{p.categorie}</span>
                          </td>

                          {/* VILLE */}
                          <td style={styles.td}>
                            <div style={styles.villeWrap}>
                              <MapPin size={13} color="#6b7280" />
                              {p.ville}
                            </div>
                          </td>

                          {/* PRIX */}
                          <td style={styles.td}>
                            <strong style={styles.prixValue}>
                              {p.prix.toLocaleString('fr-FR')} FCFA
                            </strong>
                          </td>

                          {/* VARIATION */}
                          <td style={styles.td}>
                            <span style={{
                              ...styles.variationBadge,
                              background: p.variation > 0 ? '#dcfce7' : p.variation < 0 ? '#fee2e2' : '#f3f4f6',
                              color:      p.variation > 0 ? '#16a34a' : p.variation < 0 ? '#dc2626' : '#6b7280',
                            }}>
                              {p.variation > 0
                                ? <TrendingUp   size={13} />
                                : p.variation < 0
                                ? <TrendingDown size={13} />
                                : <Minus        size={13} />
                              }
                              {p.variation > 0 ? '+' : ''}{p.variation}%
                            </span>
                          </td>

                          {/* MIN */}
                          <td style={{ ...styles.td, color: '#dc2626', fontSize: '0.85rem' }}>
                            {p.min.toLocaleString('fr-FR')}
                          </td>

                          {/* MAX */}
                          <td style={{ ...styles.td, color: '#16a34a', fontSize: '0.85rem' }}>
                            {p.max.toLocaleString('fr-FR')}
                          </td>

                          {/* DATE */}
                          <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {p.date}
                            </div>
                          </td>

                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

          </div>
        </motion.div>

        {/* ===== ALERTE PRIX ===== */}
        <motion.div
          className="mt-4"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
        >
          <div style={styles.alertCard}>
            <div style={styles.alertLeft}>
              <div style={styles.alertIcon}>🔔</div>
              <div>
                <h4 style={styles.alertTitle}>Recevez les alertes prix</h4>
                <p style={styles.alertDesc}>
                  Soyez notifié dès que le prix d'un produit change significativement
                </p>
              </div>
            </div>
            <div style={styles.alertRight}>
              <input
                type="email"
                placeholder="votre@email.com"
                style={styles.alertInput}
              />
              <motion.button
                style={styles.alertBtn}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                S'abonner
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  // HERO
  hero: {
    background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)',
    padding: '3rem 0 2rem',
  },
  heroBreadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' },
  breadLink:      { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle:      { color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '0.4rem' },
  heroSub:        { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.8rem' },
  lastUpdate:     { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '500' },

  // STATS
  statCard:   { background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #f0f0f0', textAlign: 'center' },
  statIcon:   { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.7rem' },
  statValue:  { fontSize: '1.3rem', fontWeight: '800', marginBottom: '2px' },
  statLabel:  { fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' },
  statSuffix: { fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' },

  // CARD
  card:       { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #e5e7eb' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  resultBadge:{ background: '#f0fdf4', color: '#1a5c2a', fontSize: '0.75rem', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' },

  // FILTRES
  filtersBar:  { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb' },
  searchWrap:  { position: 'relative', display: 'flex', alignItems: 'center', flex: '1', minWidth: '180px' },
  searchInput: { width: '100%', padding: '0.55rem 2rem 0.55rem 2.2rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.87rem', outline: 'none', background: '#fafafa' },
  clearBtn:    { position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  catsWrap:    { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  catBtn:      { padding: '0.38rem 0.9rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  villeSelect: { padding: '0.5rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', background: 'white', cursor: 'pointer' },

  // TABLEAU
  table:  { width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' },
  thead:  { background: '#f9fafb' },
  th:     { padding: '0.75rem 1rem', textAlign: 'left', color: '#374151', fontWeight: '700', fontSize: '0.8rem', borderBottom: '2px solid #e5e7eb', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' },
  thInner:{ display: 'flex', alignItems: 'center', gap: '4px' },
  tr:     { borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' },
  td:     { padding: '0.85rem 1rem', color: '#374151', whiteSpace: 'nowrap', verticalAlign: 'middle' },

  // CONTENU TABLEAU
  produitNom:      { fontWeight: '700', color: '#1a2e10' },
  catBadge:        { background: '#f0fdf4', color: '#1a5c2a', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  villeWrap:       { display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.85rem' },
  prixValue:       { color: '#1a5c2a', fontSize: '0.95rem' },
  variationBadge:  { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' },

  // ALERTE
  alertCard:  { background: 'linear-gradient(135deg, #1a5c2a, #2d8c47)', borderRadius: '16px', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' },
  alertLeft:  { display: 'flex', alignItems: 'center', gap: '16px' },
  alertIcon:  { fontSize: '2rem' },
  alertTitle: { color: 'white', fontWeight: '800', fontSize: '1.05rem', margin: '0 0 4px' },
  alertDesc:  { color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', margin: 0 },
  alertRight: { display: 'flex', gap: '10px', alignItems: 'center' },
  alertInput: { padding: '0.6rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.88rem', outline: 'none', minWidth: '220px' },
  alertBtn:   { background: '#f0c040', color: '#1a2e10', border: 'none', borderRadius: '10px', padding: '0.6rem 1.4rem', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap' },
};