import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, MapPin, Star,
  ShoppingCart, Heart, ChevronDown, X,
  Wheat, Filter, ArrowUpRight, Eye
} from 'lucide-react';
import ProductService from '../../services/product.service';

// ===== MOCK DATA =====
const produits = [
  { id: 1,  nom: 'Maïs blanc 2t',   categorie: 'Maïs',  localisation: 'Bankoura',    prix: 1000000, note: 4.8, vendeur: 'Moussa K.', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',  dispo: true  },
  { id: 2,  nom: 'Riz local 3t',    categorie: 'Riz',   localisation: 'Parakou',     prix: 1160000, note: 4.5, vendeur: 'Kofi A.',   image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',  dispo: true  },
  { id: 3,  nom: 'Soja certifié 1t',categorie: 'Soja',  localisation: 'Nikki',       prix: 670000,  note: 4.7, vendeur: 'Sèna B.',   image: 'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=400&q=80',  dispo: true  },
  { id: 4,  nom: 'Mil rouge 2t',    categorie: 'Mil',   localisation: 'Natitingou',  prix: 800000,  note: 4.3, vendeur: 'Yao D.',    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',  dispo: false },
  { id: 5,  nom: 'Maïs jaune 5t',   categorie: 'Maïs',  localisation: 'Cotonou',     prix: 2500000, note: 4.9, vendeur: 'Afi K.',    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',  dispo: true  },
  { id: 6,  nom: 'Riz parfumé 2t',  categorie: 'Riz',   localisation: 'Abomey',      prix: 900000,  note: 4.6, vendeur: 'Moussa K.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',  dispo: true  },
  { id: 7,  nom: 'Soja bio 500kg',  categorie: 'Soja',  localisation: 'Kandi',       prix: 350000,  note: 4.4, vendeur: 'Kofi A.',   image: 'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=400&q=80',  dispo: true  },
  { id: 8,  nom: 'Mil blanc 3t',    categorie: 'Mil',   localisation: 'Djougou',     prix: 1200000, note: 4.2, vendeur: 'Sèna B.',   image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',  dispo: true  },
  { id: 9,  nom: 'Maïs doux 1t',    categorie: 'Maïs',  localisation: 'Ouidah',      prix: 500000,  note: 4.7, vendeur: 'Yao D.',    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',  dispo: true  },
];

const categories  = ['Tous', 'Maïs', 'Riz', 'Soja', 'Mil'];
const villes      = ['Toutes', 'Bankoura', 'Parakou', 'Nikki', 'Natitingou', 'Cotonou', 'Abomey', 'Kandi', 'Djougou', 'Ouidah'];
const tris        = [
  { label: 'Plus récents',      value: 'recent'    },
  { label: 'Prix croissant',    value: 'prix_asc'  },
  { label: 'Prix décroissant',  value: 'prix_desc' },
  { label: 'Mieux notés',       value: 'note'      },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1  },
};

export default function Products() {
  const [search,      setSearch]      = useState('');
  const [categorie,   setCategorie]   = useState('Tous');
  const [ville,       setVille]       = useState('Toutes');
  const [tri,         setTri]         = useState('recent');
  const [prixMax,     setPrixMax]     = useState(3000000);
  const [dispoOnly,   setDispoOnly]   = useState(false);
  const [favoris,     setFavoris]     = useState([]);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [vue,         setVue]         = useState('grille'); // grille | liste
  const [produitsData, setProduitsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState(['Tous']);
  const [villesData, setVillesData] = useState(['Toutes']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [productsResponse, categoriesResponse] = await Promise.all([
          ProductService.getAll({ search }),
          ProductService.getCategories(),
        ]);

        if (!active) return;

        const productItems = productsResponse.results || productsResponse;
        const categoryItems = categoriesResponse.results || categoriesResponse;
        const mappedProducts = productItems.map((item) => ({
          id: item.id,
          nom: item.nom,
          categorie: item.categorie_nom || 'Autre',
          localisation: item.ville || item.localisation || 'Benin',
          prix: Number(item.prix || 0),
          note: Number(item.note_moyenne || 0),
          vendeur: item.vendeur_nom || 'Vendeur',
          image: item.images?.find((img) => img.est_principale)?.image || item.images?.[0]?.image || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
          dispo: item.est_disponible,
        }));

        setProduitsData(mappedProducts);
        setCategoriesData(['Tous', ...categoryItems.map((cat) => cat.nom)]);
        setVillesData(['Toutes', ...Array.from(new Set(mappedProducts.map((p) => p.localisation).filter(Boolean)))]);
      } catch {
        if (active) {
          setError('Impossible de charger les produits depuis le backend.');
          setProduitsData([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [search]);

  const toggleFavori = (id) => {
    setFavoris((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // FILTRAGE + TRI
  const produitsFiltres = useMemo(() => {
    let result = [...produitsData];

    if (search)              result = result.filter((p) => p.nom.toLowerCase().includes(search.toLowerCase()) || p.localisation.toLowerCase().includes(search.toLowerCase()));
    if (categorie !== 'Tous') result = result.filter((p) => p.categorie === categorie);
    if (ville !== 'Toutes')   result = result.filter((p) => p.localisation === ville);
    if (dispoOnly)            result = result.filter((p) => p.dispo);
    result = result.filter((p) => p.prix <= prixMax);

    if (tri === 'prix_asc')  result.sort((a, b) => a.prix - b.prix);
    if (tri === 'prix_desc') result.sort((a, b) => b.prix - a.prix);
    if (tri === 'note')      result.sort((a, b) => b.note - a.note);

    return result;
  }, [produitsData, search, categorie, ville, dispoOnly, prixMax, tri]);

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
              <span style={{ color: 'white' }}>Céréales</span>
            </div>
            <h1 style={styles.heroTitle}>
              🌽 Céréales disponibles
            </h1>
            <p style={styles.heroSub}>
              {produitsFiltres.length} produits trouvés au Bénin
            </p>

            {/* BARRE DE RECHERCHE HERO */}
            <div style={styles.heroSearch}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher un produit, une ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.heroSearchInput}
              />
              {search && (
                <button onClick={() => setSearch('')} style={styles.clearBtn}>
                  <X size={16} color="#9ca3af" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-4">
        <div className="row g-4">

          {/* ===== SIDEBAR FILTRES — DESKTOP ===== */}
          <div className="col-lg-3 d-none d-lg-block">
            <motion.div
              style={styles.filterCard}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div style={styles.filterHeader}>
                <h3 style={styles.filterTitle}>
                  <Filter size={16} color="#1a5c2a" /> Filtres
                </h3>
                <button
                  style={styles.resetBtn}
                  onClick={() => {
                    setCategorie('Tous');
                    setVille('Toutes');
                    setPrixMax(3000000);
                    setDispoOnly(false);
                  }}
                >
                  Réinitialiser
                </button>
              </div>

              {/* CATÉGORIES */}
              <div style={styles.filterSection}>
                <p style={styles.filterSectionTitle}>Catégorie</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {categoriesData.map((c) => (
                    <motion.button
                      key={c}
                      style={{
                        ...styles.filterOption,
                        background:  categorie === c ? '#f0fdf4' : 'transparent',
                        color:       categorie === c ? '#1a5c2a' : '#374151',
                        fontWeight:  categorie === c ? '700'     : '400',
                        borderColor: categorie === c ? '#86efac' : '#e5e7eb',
                      }}
                      onClick={() => setCategorie(c)}
                      whileHover={{ x: 3 }}
                    >
                      {c}
                      {categorie === c && (
                        <span style={styles.filterCheck}>✓</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* VILLE */}
              <div style={styles.filterSection}>
                <p style={styles.filterSectionTitle}>Ville</p>
                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  style={styles.filterSelect}
                >
                  {villesData.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* PRIX MAX */}
              <div style={styles.filterSection}>
                <p style={styles.filterSectionTitle}>
                  Prix maximum
                  <span style={styles.prixLabel}>
                    {prixMax.toLocaleString('fr-FR')} FCFA
                  </span>
                </p>
                <input
                  type="range"
                  min={100000}
                  max={3000000}
                  step={100000}
                  value={prixMax}
                  onChange={(e) => setPrixMax(Number(e.target.value))}
                  style={styles.rangeInput}
                />
                <div style={styles.rangeLabels}>
                  <span>100k</span>
                  <span>3 000k</span>
                </div>
              </div>

              {/* DISPONIBILITÉ */}
              <div style={styles.filterSection}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={dispoOnly}
                    onChange={(e) => setDispoOnly(e.target.checked)}
                    style={{ accentColor: '#1a5c2a', width: '16px', height: '16px' }}
                  />
                  Disponibles uniquement
                </label>
              </div>

            </motion.div>
          </div>

          {/* ===== CONTENU PRINCIPAL ===== */}
          <div className="col-12 col-lg-9">

            {/* BARRE OUTILS */}
            <div style={styles.toolbar}>
              <span style={styles.resultCount}>
                <strong>{produitsFiltres.length}</strong> produits trouvés
              </span>

              <div style={styles.toolbarRight}>
                {/* FILTRE MOBILE */}
                <motion.button
                  style={styles.filterMobileBtn}
                  className="d-lg-none"
                  onClick={() => setFilterOpen(true)}
                  whileHover={{ scale: 1.02 }}
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                </motion.button>

                {/* TRI */}
                <div style={styles.triWrap}>
                  <ChevronDown size={14} color="#6b7280" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
                  <select
                    value={tri}
                    onChange={(e) => setTri(e.target.value)}
                    style={styles.triSelect}
                  >
                    {tris.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* VUE GRILLE / LISTE */}
                <div style={styles.vueSwitch}>
                  {['grille', 'liste'].map((v) => (
                    <motion.button
                      key={v}
                      style={{
                        ...styles.vueBtn,
                        background: vue === v ? '#1a5c2a' : 'transparent',
                        color:      vue === v ? 'white'   : '#6b7280',
                      }}
                      onClick={() => setVue(v)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {v === 'grille' ? '⊞' : '≡'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* CATÉGORIES RAPIDES */}
            <div style={styles.quickCats}>
              {categoriesData.map((c) => (
                <motion.button
                  key={c}
                  style={{
                    ...styles.quickCatBtn,
                    background:  categorie === c ? '#1a5c2a' : 'white',
                    color:       categorie === c ? 'white'   : '#374151',
                    borderColor: categorie === c ? '#1a5c2a' : '#e5e7eb',
                  }}
                  onClick={() => setCategorie(c)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {c === 'Tous' ? '🌾' : c === 'Maïs' ? '🌽' : c === 'Riz' ? '🍚' : c === 'Soja' ? '🫘' : '🌾'}
                  {c}
                </motion.button>
              ))}
            </div>

            {/* GRILLE PRODUITS */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  style={styles.emptyState}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>Chargement des produits...</h3>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  style={styles.emptyState}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>{error}</h3>
                </motion.div>
              ) : produitsFiltres.length === 0 ? (
                <motion.div
                  key="empty"
                  style={styles.emptyState}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{ fontSize: '3rem' }}>🔍</div>
                  <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>Aucun produit trouvé</h3>
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
                      className={vue === 'grille' ? 'col-12 col-sm-6 col-xl-4' : ''}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.06 }}
                    >
                      {vue === 'grille'
                        ? <ProductCardGrille p={p} favoris={favoris} toggleFavori={toggleFavori} />
                        : <ProductCardListe  p={p} favoris={favoris} toggleFavori={toggleFavori} />
                      }
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* ===== FILTRE MOBILE (DRAWER) ===== */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              style={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              style={styles.mobileDrawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.filterHeader}>
                <h3 style={styles.filterTitle}>
                  <Filter size={16} /> Filtres
                </h3>
                <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} color="#374151" />
                </button>
              </div>

              {/* Même contenu que sidebar desktop */}
              <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
                <div style={styles.filterSection}>
                  <p style={styles.filterSectionTitle}>Catégorie</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {categoriesData.map((c) => (
                      <button
                        key={c}
                        style={{
                          ...styles.quickCatBtn,
                          background:  categorie === c ? '#1a5c2a' : 'white',
                          color:       categorie === c ? 'white'   : '#374151',
                          borderColor: categorie === c ? '#1a5c2a' : '#e5e7eb',
                        }}
                        onClick={() => setCategorie(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.filterSection}>
                  <p style={styles.filterSectionTitle}>Ville</p>
                  <select value={ville} onChange={(e) => setVille(e.target.value)} style={styles.filterSelect}>
                    {villesData.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>

                <div style={styles.filterSection}>
                  <p style={styles.filterSectionTitle}>
                    Prix max : {prixMax.toLocaleString('fr-FR')} FCFA
                  </p>
                  <input
                    type="range" min={100000} max={3000000} step={100000}
                    value={prixMax} onChange={(e) => setPrixMax(Number(e.target.value))}
                    style={styles.rangeInput}
                  />
                </div>

                <div style={styles.filterSection}>
                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={dispoOnly}
                      onChange={(e) => setDispoOnly(e.target.checked)}
                      style={{ accentColor: '#1a5c2a' }}
                    />
                    Disponibles uniquement
                  </label>
                </div>
              </div>

              <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <motion.button
                  style={styles.applyBtn}
                  onClick={() => setFilterOpen(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Appliquer les filtres ({produitsFiltres.length} résultats)
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// ===== CARTE GRILLE =====
function ProductCardGrille({ p, favoris, toggleFavori }) {
  return (
    <motion.div
      style={styles.card}
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
    >
      {/* IMAGE */}
      <div style={styles.cardImgWrap}>
        <img
          src={p.image}
          alt={p.nom}
          style={styles.cardImg}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x180?text=Produit'; }}
        />
        {/* BADGES */}
        <div style={styles.cardBadges}>
          <span style={{
            ...styles.dispoBadge,
            background: p.dispo ? '#dcfce7' : '#fee2e2',
            color:      p.dispo ? '#16a34a' : '#dc2626',
          }}>
            {p.dispo ? '✓ Disponible' : '✗ Indisponible'}
          </span>
        </div>
        {/* FAVORI */}
        <motion.button
          style={styles.favoriBtn}
          onClick={() => toggleFavori(p.id)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            size={18}
            color={favoris.includes(p.id) ? '#ef4444' : 'white'}
            fill={favoris.includes(p.id) ? '#ef4444' : 'transparent'}
          />
        </motion.button>
      </div>

      {/* INFOS */}
      <div style={{ padding: '1rem' }}>
        <div style={styles.cardCategorie}>{p.categorie}</div>
        <h3 style={styles.cardNom}>{p.nom}</h3>

        <div style={styles.cardMeta}>
          <div style={styles.cardLoc}>
            <MapPin size={13} color="#6b7280" />
            {p.localisation}
          </div>
          <div style={styles.cardNote}>
            <Star size={13} color="#f0c040" fill="#f0c040" />
            {p.note}
          </div>
        </div>

        <div style={styles.cardVendeur}>
          par <strong>{p.vendeur}</strong>
        </div>

        <div style={styles.cardFooter}>
          <div style={styles.cardPrix}>
            {p.prix.toLocaleString('fr-FR')} <span style={{ fontSize: '0.75rem' }}>FCFA</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <motion.button style={styles.btnVoir} whileHover={{ scale: 1.05 }}>
              <Eye size={14} />
            </motion.button>
            <motion.button
              style={{
                ...styles.btnAcheter,
                opacity: p.dispo ? 1 : 0.5,
                cursor:  p.dispo ? 'pointer' : 'not-allowed',
              }}
              whileHover={{ scale: p.dispo ? 1.05 : 1 }}
              whileTap={{ scale: p.dispo ? 0.95 : 1 }}
              disabled={!p.dispo}
            >
              <ShoppingCart size={14} />
              Commander
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===== CARTE LISTE =====
function ProductCardListe({ p, favoris, toggleFavori }) {
  return (
    <motion.div
      style={styles.listCard}
      whileHover={{ x: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
    >
      <img
        src={p.image}
        alt={p.nom}
        style={styles.listImg}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/120x90?text=Produit'; }}
      />
      <div style={{ flex: 1 }}>
        <div style={styles.cardCategorie}>{p.categorie}</div>
        <h3 style={{ ...styles.cardNom, marginBottom: '4px' }}>{p.nom}</h3>
        <div style={styles.cardMeta}>
          <div style={styles.cardLoc}><MapPin size={13} color="#6b7280" />{p.localisation}</div>
          <div style={styles.cardNote}><Star size={13} color="#f0c040" fill="#f0c040" />{p.note}</div>
        </div>
        <div style={styles.cardVendeur}>par <strong>{p.vendeur}</strong></div>
      </div>
      <div style={styles.listRight}>
        <div style={styles.cardPrix}>
          {p.prix.toLocaleString('fr-FR')}
          <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>FCFA</span>
        </div>
        <span style={{
          ...styles.dispoBadge,
          background: p.dispo ? '#dcfce7' : '#fee2e2',
          color:      p.dispo ? '#16a34a' : '#dc2626',
        }}>
          {p.dispo ? '✓ Dispo' : '✗ Indispo'}
        </span>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <motion.button style={styles.btnVoir} whileHover={{ scale: 1.05 }}>
            <Eye size={14} />
          </motion.button>
          <motion.button
            style={{ ...styles.btnAcheter, opacity: p.dispo ? 1 : 0.5 }}
            disabled={!p.dispo}
            whileHover={{ scale: p.dispo ? 1.05 : 1 }}
          >
            <ShoppingCart size={14} />
            Commander
          </motion.button>
        </div>
        <motion.button
          style={styles.favoriListBtn}
          onClick={() => toggleFavori(p.id)}
          whileHover={{ scale: 1.1 }}
        >
          <Heart
            size={16}
            color={favoris.includes(p.id) ? '#ef4444' : '#9ca3af'}
            fill={favoris.includes(p.id) ? '#ef4444' : 'transparent'}
          />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ===== STYLES =====
const styles = {
  // HERO
  hero: {
    background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)',
    padding: '3rem 0 2rem',
    marginBottom: '0',
  },
  heroBreadcrumb: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '0.82rem', marginBottom: '1rem',
    color: 'rgba(255,255,255,0.6)',
  },
  breadLink: { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle: { color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '0.4rem' },
  heroSub:   { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  heroSearch: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'white', borderRadius: '14px',
    padding: '0.75rem 1.2rem', maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  heroSearchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1a2e10', background: 'transparent' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' },

  // FILTRES
  filterCard:    { background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid #e5e7eb', position: 'sticky', top: '80px' },
  filterHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' },
  filterTitle:   { fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 },
  resetBtn:      { fontSize: '0.78rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' },
  filterSection: { marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' },
  filterSectionTitle: { fontSize: '0.82rem', fontWeight: '700', color: '#374151', marginBottom: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  filterOption:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '0.87rem', width: '100%', transition: 'all 0.2s', background: 'none' },
  filterCheck:   { color: '#1a5c2a', fontWeight: '700' },
  filterSelect:  { width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.87rem', outline: 'none', background: '#fafafa', cursor: 'pointer' },
  prixLabel:     { color: '#1a5c2a', fontWeight: '700', fontSize: '0.8rem' },
  rangeInput:    { width: '100%', accentColor: '#1a5c2a', cursor: 'pointer' },
  rangeLabels:   { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' },
  checkLabel:    { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.87rem', color: '#374151', cursor: 'pointer', fontWeight: '500' },

  // TOOLBAR
  toolbar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' },
  resultCount:  { fontSize: '0.87rem', color: '#6b7280' },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  filterMobileBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', color: '#374151' },
  triWrap:    { position: 'relative', display: 'flex', alignItems: 'center' },
  triSelect:  { padding: '0.5rem 2rem 0.5rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', background: 'white', cursor: 'pointer', appearance: 'none' },
  vueSwitch:  { display: 'flex', background: '#f4f6f4', borderRadius: '8px', padding: '3px' },
  vueBtn:     { border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' },

  // CATÉGORIES RAPIDES
  quickCats:   { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.2rem' },
  quickCatBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },

  // CARTE GRILLE
  card:         { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer' },
  cardImgWrap:  { position: 'relative', height: '170px', overflow: 'hidden' },
  cardImg:      { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  cardBadges:   { position: 'absolute', top: '10px', left: '10px' },
  dispoBadge:   { fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', display: 'inline-block' },
  favoriBtn:    { position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' },
  cardCategorie:{ fontSize: '0.72rem', fontWeight: '700', color: '#1a5c2a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '6px' },
  cardNom:      { fontSize: '1rem', fontWeight: '700', color: '#1a2e10', marginBottom: '8px', lineHeight: 1.3 },
  cardMeta:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' },
  cardLoc:      { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#6b7280' },
  cardNote:     { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#d97706', fontWeight: '700' },
  cardVendeur:  { fontSize: '0.78rem', color: '#6b7280', marginBottom: '10px' },
  cardFooter:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardPrix:     { fontSize: '1rem', fontWeight: '800', color: '#1a5c2a' },
  btnVoir:      { background: '#f4f6f4', border: 'none', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' },
  btnAcheter:   { background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },

  // CARTE LISTE
  listCard:     { background: 'white', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' },
  listImg:      { width: '110px', height: '85px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  listRight:    { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 },
  favoriListBtn:{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginTop: '4px' },

  // EMPTY STATE
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' },

  // MOBILE DRAWER
  mobileOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 },
  mobileDrawer:  { position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', background: 'white', zIndex: 200, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' },
  applyBtn:      { width: '100%', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' },
};
