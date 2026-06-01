import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Calendar, ExternalLink,
  ArrowRight, Clock, X, RefreshCw, Rss
} from 'lucide-react';
import api from '../../services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80';

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <div style={{ height: '180px', background: '#f3f4f6' }} />
      <div style={{ padding: '1rem' }}>
        <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '6px', marginBottom: '8px', width: '60%' }} />
        <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '6px', marginBottom: '6px' }} />
        <div style={{ height: '16px', background: '#f3f4f6', borderRadius: '6px', width: '80%' }} />
      </div>
    </div>
  );
}

export default function News() {
  const [articles,   setArticles]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [source,     setSource]     = useState('Toutes');
  const [refreshing, setRefreshing] = useState(false);

  const charger = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      const params = forceRefresh ? { refresh: '1' } : {};
      const { data } = await api.get('/news/external/', { params });
      setArticles(data.articles || []);
    } catch (err) {
      setError(
        !err.response
          ? 'Serveur inaccessible. Démarrez le backend Django.'
          : 'Impossible de charger les actualités.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    charger(true);
  };

  // Sources uniques pour le filtre
  const sources = useMemo(() => {
    const uniques = [...new Set(articles.map((a) => a.source).filter(Boolean))];
    return ['Toutes', ...uniques];
  }, [articles]);

  const filtres = useMemo(() => {
    let result = [...articles];
    if (search)           result = result.filter((a) => a.titre.toLowerCase().includes(search.toLowerCase()) || a.extrait?.toLowerCase().includes(search.toLowerCase()));
    if (source !== 'Toutes') result = result.filter((a) => a.source === source);
    return result;
  }, [articles, search, source]);

  const vedette  = filtres[0] || null;
  const reste    = filtres.slice(1);

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* ══ HERO ══ */}
      <div style={{ background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)', padding: '3rem 0 2rem' }}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Accueil</Link>
              <span>/</span>
              <span style={{ color: 'white' }}>Actualités</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Rss size={28} color="#f0c040" />
                  Actualités agricoles
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                  {loading ? 'Chargement des flux RSS…' : `${filtres.length} articles · RFI, FAO, Jeune Afrique, médias béninois`}
                </p>
              </div>

              <motion.button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '10px', padding: '8px 16px', color: 'white', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                whileHover={{ background: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.96 }}
              >
                <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                  <RefreshCw size={15} />
                </motion.div>
                Actualiser
              </motion.button>
            </div>

            {/* Barre de recherche */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '14px', padding: '0.75rem 1.2rem', maxWidth: '520px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginTop: '1.5rem' }}>
              <Search size={18} color="#9ca3af" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1a2e10', background: 'transparent' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}><X size={16} color="#9ca3af" /></button>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-4">

        {/* Filtre sources */}
        {!loading && sources.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {sources.map((s) => (
              <motion.button
                key={s}
                onClick={() => setSource(s)}
                style={{
                  padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', border: '1.5px solid',
                  background: source === s ? '#1a5c2a' : 'white',
                  color:      source === s ? 'white'   : '#374151',
                  borderColor: source === s ? '#1a5c2a' : '#e5e7eb',
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem 1.5rem', color: '#dc2626', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="row g-4">
            {[1,2,3,4,5,6].map((n) => <div key={n} className="col-12 col-md-6 col-lg-4"><SkeletonCard /></div>)}
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && !error && filtres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1.5px dashed #e5e7eb' }}>
            <Rss size={48} color="#d1d5db" />
            <h3 style={{ color: '#1a2e10', marginTop: '1rem' }}>Aucun article trouvé</h3>
            <p style={{ color: '#6b7280' }}>Essayez de modifier votre recherche ou actualiser les flux.</p>
            <motion.button onClick={handleRefresh} style={{ marginTop: '1rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: '600', cursor: 'pointer' }} whileHover={{ scale: 1.04 }}>
              <RefreshCw size={14} style={{ marginRight: '6px' }} /> Actualiser
            </motion.button>
          </div>
        )}

        {/* Article vedette */}
        {!loading && vedette && (
          <motion.a
            href={vedette.lien}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none', marginBottom: '2rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: '0 0 0 2px #1a5c2a, 0 16px 40px rgba(0,0,0,0.14)' }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'row', minHeight: '240px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} className="flex-column flex-md-row">
              <div style={{ flex: '0 0 42%', minHeight: '220px', position: 'relative', overflow: 'hidden' }} className="w-100">
                <img
                  src={vedette.image || FALLBACK_IMAGE}
                  alt={vedette.titre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '220px' }}
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#f0c040', color: '#1a2e10', fontSize: '0.72rem', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  À la une
                </span>
              </div>
              <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                <SourceBadge source={vedette.source} color={vedette.source_color} />
                <h2 style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: '800', color: '#1a2e10', lineHeight: 1.3, margin: 0 }}>{vedette.titre}</h2>
                <p style={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{vedette.extrait?.substring(0, 200)}{vedette.extrait?.length > 200 ? '…' : ''}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: '#9ca3af', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} />{vedette.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1a5c2a', fontWeight: '600' }}><ExternalLink size={13} />Lire l'article</span>
                </div>
              </div>
            </div>
          </motion.a>
        )}

        {/* Grille articles */}
        {!loading && reste.length > 0 && (
          <div className="row g-4">
            {reste.map((article, i) => (
              <motion.div
                key={article.id}
                className="col-12 col-sm-6 col-lg-4"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <motion.a
                  href={article.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', textDecoration: 'none', height: '100%' }}
                  whileHover={{ y: -5, boxShadow: '0 0 0 2px #1a5c2a, 0 12px 32px rgba(26,92,42,0.15)' }}
                  transition={{ duration: 0.15 }}
                >
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
                    {/* Image */}
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={article.image || FALLBACK_IMAGE}
                        alt={article.titre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                      />
                    </div>

                    {/* Contenu */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SourceBadge source={article.source} color={article.source_color} />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', lineHeight: 1.4, margin: 0, flex: 1 }}>
                        {article.titre.length > 90 ? article.titre.substring(0, 90) + '…' : article.titre}
                      </h3>
                      <p style={{ fontSize: '0.80rem', color: '#6b7280', lineHeight: 1.5, margin: 0 }}>
                        {article.extrait?.substring(0, 120)}{article.extrait?.length > 120 ? '…' : ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9ca3af' }}>
                          <Calendar size={12} />{article.date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#1a5c2a', fontWeight: '600' }}>
                          Lire <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function SourceBadge({ source, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: (color || '#1a5c2a') + '15',
      color:      color || '#1a5c2a',
      fontSize:   '0.70rem', fontWeight: '700',
      padding:    '3px 9px', borderRadius: '20px',
      border:     `1px solid ${(color || '#1a5c2a')}30`,
      width: 'fit-content',
    }}>
      <Rss size={10} />
      {source}
    </span>
  );
}
