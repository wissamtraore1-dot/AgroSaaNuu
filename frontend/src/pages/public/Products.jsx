import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, ShoppingCart, X, ChevronDown, Leaf, AlertTriangle } from 'lucide-react';
import ProductService from '../../services/product.service';

const CATEGORIES_CEREALES = [
  'Riz', 'Maïs', 'Mil', 'Sorgho', 'Arachides', 'Fonio',
  'Blé', 'Orge', 'Haricots', 'Lentilles', 'Pois chiches', 'Niébé',
];

const VILLES_BENIN = [
  'Toutes', 'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Ouidah',
  'Bohicon', 'Abomey', 'Lokossa', 'Natitingou', 'Djougou',
  'Kandi', 'Parakou', 'Savè', 'Bembèrèkè', 'Nikki', 'Malanville',
  'Borgou', 'Atacora', 'Djougou',
];

const TRIS = [
  { label: 'Plus récents',     value: 'recent'   },
  { label: 'Prix croissant',   value: 'prix_asc' },
  { label: 'Prix décroissant', value: 'prix_desc'},
  { label: 'Mieux notés',      value: 'note'     },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [search,       setSearch]       = useState(searchParams.get('search') || '');
  const [categorie,    setCategorie]    = useState('Tous');
  const [ville,        setVille]        = useState('Toutes');
  const [tri,          setTri]          = useState('recent');
  const [vue,          setVue]          = useState('grille');
  const [produitsData, setProduitsData] = useState([]);
  const [categories,   setCategories]   = useState(['Tous']);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Synchronise l'état local quand l'URL change (ex: recherche depuis le header)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [prodRes, catRes] = await Promise.all([
          ProductService.liste({ search }),
          ProductService.categories(),
        ]);
        if (!active) return;

        const items    = prodRes.results || prodRes;
        const catItems = catRes.results  || catRes;

        setProduitsData(items.map(item => ({
          id:           item.id,
          nom:          item.nom,
          categorie:    item.categorie_nom || 'Autre',
          localisation: item.ville || item.localisation || 'Bénin',
          prix:         Number(item.prix || 0),
          unite:        item.unite || 'kg',
          note:         Number(item.note_moyenne || 0),
          vendeur:      item.vendeur_nom || 'Vendeur',
          image:        item.images?.find(i => i.est_principale)?.image
                        || item.images?.[0]?.image
                        || null,
          dispo:        item.est_disponible,
        })));
        setCategories(['Tous', ...catItems.map(c => c.nom)]);
      } catch {
        if (active) setError('Serveur inaccessible. Démarrez le backend Django.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [search]);

  const produitsFiltres = useMemo(() => {
    let r = [...produitsData];
    if (categorie !== 'Tous')  r = r.filter(p => p.categorie === categorie);
    if (ville !== 'Toutes')    r = r.filter(p => p.localisation.toLowerCase() === ville.toLowerCase());
    if (tri === 'prix_asc')    r.sort((a, b) => a.prix - b.prix);
    if (tri === 'prix_desc')   r.sort((a, b) => b.prix - a.prix);
    if (tri === 'note')        r.sort((a, b) => b.note - a.note);
    return r;
  }, [produitsData, categorie, ville, tri]);

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={s.breadcrumb}>
              <Link to="/" style={s.breadLink}>Accueil</Link>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
              <span style={{ color: 'white' }}>Céréales</span>
            </div>

            <h1 style={{ ...s.heroTitle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Leaf size={28} /> Céréales disponibles</h1>
            <p style={s.heroSub}>
              {loading ? '...' : `${produitsFiltres.length} types de produits trouvés au Bénin`}
            </p>

            {/* BARRE DE RECHERCHE */}
            <div style={s.searchWrap}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher une céréale..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={s.searchInput}
              />
              {search && (
                <button onClick={() => setSearch('')} style={s.clearBtn}>
                  <X size={15} color="#9ca3af" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── BARRE FILTRES ── */}
      <div style={s.filterBar}>
        <div className="container-fluid px-4 px-lg-5">
          <div style={s.filterRow}>

            {/* Catégorie */}
            <div style={s.filterDropWrap}>
              <select
                value={categorie}
                onChange={e => setCategorie(e.target.value)}
                style={s.filterDrop}
              >
                <option value="Tous">Catégorie</option>
                {CATEGORIES_CEREALES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} color="#6b7280" style={s.dropIcon} />
            </div>

            {/* Ville */}
            <div style={s.filterDropWrap}>
              <select
                value={ville}
                onChange={e => setVille(e.target.value)}
                style={s.filterDrop}
              >
                <option value="Toutes">Ville</option>
                {VILLES_BENIN.filter(v => v !== 'Toutes').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={14} color="#6b7280" style={s.dropIcon} />
            </div>

            <span style={s.resultCount}>
              {produitsFiltres.length} types de produits trouvés au Bénin
            </span>

            {/* Tri + Vue */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
              <div style={s.filterDropWrap}>
                <select value={tri} onChange={e => setTri(e.target.value)} style={s.filterDrop}>
                  {TRIS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={14} color="#6b7280" style={s.dropIcon} />
              </div>
              <div style={s.vueSwitch}>
                {['grille', 'liste'].map(v => (
                  <button
                    key={v}
                    style={{ ...s.vueBtn, background: vue === v ? '#1a5c2a' : 'transparent', color: vue === v ? 'white' : '#6b7280' }}
                    onClick={() => setVue(v)}
                  >
                    {v === 'grille' ? '⊞' : '≡'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRILLE ── */}
      <div className="container-fluid px-4 px-lg-5 py-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" style={s.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: '#6b7280' }}>Chargement des produits...</p>
            </motion.div>
          ) : error ? (
            <motion.div key="error" style={s.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><AlertTriangle size={32} color="#F59E0B" /></div>
              <p style={{ color: '#dc2626', marginTop: '0.5rem' }}>{error}</p>
            </motion.div>
          ) : produitsFiltres.length === 0 ? (
            <motion.div key="empty" style={s.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Search size={48} color="#d1d5db" /></div>
              <h3 style={{ color: '#1a2e10', margin: '0.5rem 0' }}>Aucun produit trouvé</h3>
              <p style={{ color: '#6b7280' }}>Essayez de modifier vos filtres</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className={vue === 'grille' ? 'row g-3' : ''}
              style={vue === 'liste' ? { display: 'flex', flexDirection: 'column', gap: '12px' } : {}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {produitsFiltres.map((p, i) => (
                <motion.div
                  key={p.id}
                  className={vue === 'grille' ? 'col-6 col-sm-4 col-md-3 col-xl-2' : ''}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0,  opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {vue === 'grille'
                    ? <CarteGrille p={p} />
                    : <CarteListe  p={p} />
                  }
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CarteGrille({ p }) {
  return (
    <motion.div style={s.card} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
      <div style={s.imgWrap}>
        {p.image ? (
          <img src={p.image} alt={p.nom} style={s.img} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            <Leaf size={32} color="#d1d5db" />
          </div>
        )}
        {!p.dispo && (
          <div style={s.indispoBadge}>Indisponible</div>
        )}
      </div>
      <div style={s.cardBody}>
        <h3 style={s.cardNom}>{p.nom}</h3>
        <div style={s.cardLoc}>
          <MapPin size={12} color="#6b7280" />
          <span>{p.localisation}, Bénin</span>
        </div>
        <div style={s.cardPrix}>
          {p.prix.toLocaleString('fr-FR')} FCFA/{p.unite}
        </div>
        <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
          <motion.button
            style={{ ...s.btnOffre, opacity: p.dispo ? 1 : 0.5 }}
            whileHover={{ scale: p.dispo ? 1.02 : 1 }}
            whileTap={{ scale: 0.97 }}
          >
            Voir l'offre
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

function CarteListe({ p }) {
  return (
    <motion.div style={s.listCard} whileHover={{ x: 4 }}>
      {p.image ? (
        <img src={p.image} alt={p.nom} style={s.listImg} />
      ) : (
        <div style={{ ...s.listImg, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf size={24} color="#d1d5db" />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <h3 style={s.cardNom}>{p.nom}</h3>
        <div style={s.cardLoc}><MapPin size={12} color="#6b7280" />{p.localisation}, Bénin</div>
        <div style={s.cardPrix}>{p.prix.toLocaleString('fr-FR')} FCFA/{p.unite}</div>
      </div>
      <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
        <motion.button style={s.btnOffre} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          Voir l'offre
        </motion.button>
      </Link>
    </motion.div>
  );
}

const s = {
  // HERO
  hero: {
    background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)',
    padding: '2.5rem 0 2rem',
  },
  breadcrumb: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', fontSize: '0.82rem', marginBottom: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
  },
  breadLink:  { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle:  { color: 'white', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: '800', margin: '0 0 0.3rem' },
  heroSub:    { color: 'rgba(255,255,255,0.75)', fontSize: '0.92rem', margin: '0 0 1.4rem' },

  // SEARCH
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'white', borderRadius: '14px',
    padding: '0.8rem 1.4rem', maxWidth: '520px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: '#1a2e10', background: 'transparent' },
  clearBtn:    { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' },

  // FILTER BAR
  filterBar:  { background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' },
  filterRow:  { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  filterDropWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  filterDrop: {
    padding: '0.5rem 2rem 0.5rem 0.9rem',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.85rem', fontWeight: '600', color: '#374151',
    background: 'white', cursor: 'pointer', outline: 'none', appearance: 'none',
  },
  dropIcon:    { position: 'absolute', right: '8px', pointerEvents: 'none' },
  resultCount: { fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'nowrap' },
  vueSwitch:   { display: 'flex', background: '#f4f6f4', borderRadius: '8px', padding: '3px' },
  vueBtn:      { border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' },

  // CARTE GRILLE
  card:     { background: 'white', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '100%' },
  imgWrap:  { position: 'relative', height: '150px', overflow: 'hidden' },
  img:      { width: '100%', height: '100%', objectFit: 'cover' },
  indispoBadge: {
    position: 'absolute', bottom: '6px', left: '6px',
    background: 'rgba(220,38,38,0.85)', color: 'white',
    fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
  },
  cardBody: { padding: '0.75rem' },
  cardNom:  { fontSize: '0.88rem', fontWeight: '700', color: '#1a2e10', margin: '0 0 4px', lineHeight: 1.3 },
  cardLoc:  { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px' },
  cardPrix: { fontSize: '0.88rem', fontWeight: '800', color: '#1a5c2a', margin: '0 0 10px' },
  btnOffre: {
    width: '100%', padding: '0.5rem', background: '#1a5c2a', color: 'white',
    border: 'none', borderRadius: '8px', fontWeight: '700',
    fontSize: '0.82rem', cursor: 'pointer',
  },

  // CARTE LISTE
  listCard: {
    background: 'white', borderRadius: '14px', padding: '1rem',
    display: 'flex', alignItems: 'center', gap: '16px',
    border: '1px solid #e5e7eb',
  },
  listImg: { width: '100px', height: '80px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },

  // EMPTY
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' },
};
