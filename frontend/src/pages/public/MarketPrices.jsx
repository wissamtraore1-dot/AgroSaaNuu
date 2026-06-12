import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus,
  Search, MapPin, RefreshCw, BarChart2,
  ChevronUp, ChevronDown, X, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../services/api';

const COULEURS_PRODUITS = {
  'Maïs blanc':     '#f59e0b',
  'Maïs jaune':     '#f97316',
  'Riz local':      '#3b82f6',
  'Riz importé':    '#6366f1',
  'Soja certifié':  '#10b981',
  'Soja bio':       '#059669',
  'Mil rouge':      '#ef4444',
  'Mil blanc':      '#f87171',
  'Sorgho rouge':   '#8b5cf6',
  'Niébé blanc':    '#ec4899',
  'Arachide coque': '#d97706',
};

const CHART_PRODUITS = [
  { key: 'Maïs blanc',    color: '#f59e0b' },
  { key: 'Riz local',     color: '#3b82f6' },
  { key: 'Soja certifié', color: '#10b981' },
  { key: 'Mil rouge',     color: '#ef4444' },
  { key: 'Niébé blanc',   color: '#ec4899' },
];

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const fmt = (n) => Number(n).toLocaleString('fr-FR');

function VariationBadge({ v }) {
  const val = Number(v);
  if (val > 0)  return <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={13} />+{val.toFixed(1)}%</span>;
  if (val < 0)  return <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingDown size={13} />{val.toFixed(1)}%</span>;
  return <span style={{ color: '#6b7280', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}><Minus size={13} />0%</span>;
}

export default function MarketPrices() {
  const [prixData,    setPrixData]    = useState([]);
  const [histData,    setHistData]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [lastUpdate,  setLastUpdate]  = useState('');
  const [search,      setSearch]      = useState('');
  const [categorie,   setCategorie]   = useState('Tous');
  const [ville,       setVille]       = useState('Toutes');
  const [sortField,   setSortField]   = useState('produit');
  const [sortDir,     setSortDir]     = useState('asc');
  const [refreshing,  setRefreshing]  = useState(false);

  const charger = async () => {
    try {
      setLoading(true); setError('');
      const [prixRes, histRes] = await Promise.all([
        api.get('/market-prices/'),
        api.get('/market-prices/historique/', { params: { produit: 'Maïs blanc', ville: 'Cotonou' } }),
      ]);

      const items = prixRes.data.results || prixRes.data || [];
      setPrixData(items.map(p => ({
        id:        p.id,
        produit:   p.produit,
        categorie: p.categorie,
        ville:     p.ville,
        prix:      Number(p.prix),
        prix_min:  Number(p.prix_min),
        prix_max:  Number(p.prix_max),
        unite:     p.unite,
        variation: Number(p.variation),
        date:      p.date_marche,
        source:    p.source,
      })));

      // Construire les données du graphique depuis l'historique
      const hist = histRes.data?.historique || [];
      if (hist.length > 0) {
        const chartData = hist.map(h => ({
          date:  MOIS[new Date(h.date_marche).getMonth()],
          prix:  Number(h.prix),
        }));
        setHistData(chartData);
      }

      if (items.length > 0) {
        const d = new Date(items[0].date_marche || items[0].created_at);
        setLastUpdate(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
      }
    } catch (err) {
      setError(!err.response ? 'Serveur inaccessible. Démarrez le backend Django.' : 'Impossible de charger les prix.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleRefresh = () => { setRefreshing(true); charger(); };
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Valeurs uniques pour les filtres
  const categories = useMemo(() => ['Tous',    ...new Set(prixData.map(p => p.categorie))], [prixData]);
  const villes     = useMemo(() => ['Toutes', ...new Set(prixData.map(p => p.ville))],     [prixData]);

  const prixFiltres = useMemo(() => {
    let r = [...prixData];
    if (search)               r = r.filter(p => p.produit.toLowerCase().includes(search.toLowerCase()) || p.ville.toLowerCase().includes(search.toLowerCase()));
    if (categorie !== 'Tous') r = r.filter(p => p.categorie === categorie);
    if (ville !== 'Toutes')   r = r.filter(p => p.ville === ville);
    r.sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      return sortDir === 'asc' ? (typeof va === 'string' ? va.localeCompare(vb) : va - vb) : (typeof va === 'string' ? vb.localeCompare(va) : vb - va);
    });
    return r;
  }, [prixData, search, categorie, ville, sortField, sortDir]);

  // Stats rapides
  const hausses  = prixData.filter(p => p.variation > 0).length;
  const baisses  = prixData.filter(p => p.variation < 0).length;
  const stables  = prixData.filter(p => p.variation === 0).length;
  const maxHausse = [...prixData].sort((a,b) => b.variation - a.variation)[0];
  const maxBaisse = [...prixData].sort((a,b) => a.variation - b.variation)[0];

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={13} color="#d1d5db" />;
    return sortDir === 'asc' ? <ChevronUp size={13} color="#1a5c2a" /> : <ChevronDown size={13} color="#1a5c2a" />;
  };

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)', padding: '2.5rem 0 2rem' }}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div style={{ textAlign: 'center' }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Accueil</Link>
            <span>/</span><span style={{ color: 'white' }}>Prix du marché</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '800', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <BarChart2 size={26} color="#f0c040" /> Prix du marché
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
            {lastUpdate ? `Mise à jour : ${lastUpdate} · Source : MAEP / ONASA Bénin` : 'Chargement…'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <motion.button onClick={handleRefresh} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', padding: '8px 16px', color: 'white', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.96 }}>
              <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}><RefreshCw size={15} /></motion.div>
              Actualiser
            </motion.button>
          </div>

          {/* Stats rapides */}
          {!loading && prixData.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'En hausse', value: hausses, color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
                { label: 'En baisse', value: baisses, color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
                { label: 'Stables',   value: stables, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
                { label: 'Produits',  value: prixData.length, color: '#f0c040', bg: 'rgba(240,192,64,0.15)' },
              ].map((s) => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: s.color, fontWeight: '800', fontSize: '1.1rem' }}>{s.value}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{s.label}</span>
                </div>
              ))}
              {maxHausse && <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                Plus forte hausse : <strong style={{ color: '#4ade80' }}>{maxHausse.produit} +{Number(maxHausse.variation).toFixed(1)}%</strong>
              </div>}
            </div>
          )}
          </motion.div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-4">

        {/* Erreur */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem 1.5rem', color: '#dc2626', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Graphique historique */}
        {!loading && histData.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#1a5c2a" /> Évolution Maïs blanc — Cotonou (6 mois)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={histData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`${fmt(v)} FCFA`, 'Prix/tonne']} />
                <Line type="monotone" dataKey="prix" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Recherche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', borderRadius: '10px', padding: '0.5rem 1rem', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="#9ca3af" />
            <input type="text" placeholder="Rechercher un produit, une ville..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.88rem', flex: 1 }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={15} color="#9ca3af" /></button>}
          </div>
          {/* Catégorie */}
          <select value={categorie} onChange={e => setCategorie(e.target.value)} style={{ padding: '0.5rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', background: 'white', cursor: 'pointer' }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          {/* Ville */}
          <select value={ville} onChange={e => setVille(e.target.value)} style={{ padding: '0.5rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', background: 'white', cursor: 'pointer' }}>
            {villes.map(v => <option key={v}>{v}</option>)}
          </select>
          <span style={{ fontSize: '0.82rem', color: '#9ca3af', marginLeft: 'auto' }}>
            {loading ? 'Chargement…' : `${prixFiltres.length} résultat${prixFiltres.length > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Tableau */}
        {loading ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-flex' }}>
              <RefreshCw size={32} color="#1a5c2a" />
            </motion.div>
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Chargement des prix du marché…</p>
          </div>
        ) : prixFiltres.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1.5px dashed #e5e7eb' }}>
            <BarChart2 size={48} color="#d1d5db" />
            <p style={{ color: '#6b7280', marginTop: '1rem', fontWeight: '600' }}>Aucun prix trouvé</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {[
                      { label: 'Produit',    field: 'produit'    },
                      { label: 'Catégorie',  field: 'categorie'  },
                      { label: 'Ville',      field: 'ville'      },
                      { label: 'Prix/tonne', field: 'prix'       },
                      { label: 'Min',        field: 'prix_min'   },
                      { label: 'Max',        field: 'prix_max'   },
                      { label: 'Variation',  field: 'variation'  },
                    ].map(({ label, field }) => (
                      <th key={field} onClick={() => handleSort(field)} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {label} <SortIcon field={field} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prixFiltres.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fdf9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1a2e10', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: COULEURS_PRODUITS[p.produit] || '#1a5c2a', marginRight: '8px' }} />
                        {p.produit}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        <span style={{ background: '#f0fdf4', color: '#1a5c2a', padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' }}>{p.categorie}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#374151', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="#9ca3af" />{p.ville}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#1a5c2a', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                        {fmt(p.prix)} <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: '500' }}>FCFA</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(p.prix_min)}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{fmt(p.prix_max)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}><VariationBadge v={p.variation} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.8rem 1rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '0.78rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={13} />
              Source : MAEP / ONASA Bénin — Prix en FCFA par tonne
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
