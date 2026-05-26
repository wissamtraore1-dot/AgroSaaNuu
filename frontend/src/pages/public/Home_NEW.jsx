import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight, Search,
  Truck, User, Users, Shield, TrendingUp,
  Newspaper, MapPin, Star, ArrowUpRight, Loader
} from 'lucide-react';

// Services
import NewsService from '../../services/news.service';
import ProductService from '../../services/product.service';
import TransportService from '../../services/transport.service';

// ===== MOCK SLIDES (news will be loaded from API) =====
const defaultSlides = [
  {
    id: 1,
    titre: 'Le Bénin améliore la production céréalière',
    extrait: 'Découvrez les facteurs qui influencent le marché céréalier au Bénin.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(10,40,15,0.88) 0%, rgba(26,92,42,0.72) 100%)',
  },
  {
    id: 2,
    titre: 'Produits agricoles de qualité directement des coopératives',
    extrait: 'Maïs, riz, soja — achetez en direct auprès des producteurs locaux.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(30,20,5,0.88) 0%, rgba(120,80,10,0.72) 100%)',
  },
  {
    id: 3,
    titre: 'Transport agricole fiable et sécurisé',
    extrait: 'Réseau de transporteurs vérifiés disponibles dans tout le Bénin.',
    image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(5,20,40,0.88) 0%, rgba(10,60,100,0.72) 100%)',
  },
];

const features = [
  { icon: Truck, label: 'Livraison rurale', to: '/transporters', desc: "Bénéficiez d'un transport adapté à vos marchandises", color: '#1a5c2a' },
  { icon: User, label: 'Mon AgroCompte', to: '/login', desc: "Gérez vos offres et commandes en un clic", color: '#2563eb' },
  { icon: Users, label: 'Coopératives', to: '/sellers', desc: "Localisez les partenaires agricoles proches", color: '#7c3aed' },
  { icon: Shield, label: 'Paiements', to: '/finance/wallet', desc: "MTN, Moov, Celtis — paiement 100% sécurisé", color: '#d97706' },
  { icon: TrendingUp, label: 'Prix du marché', to: '/market-prices', desc: "Consultez les prix du marché en temps réel", color: '#dc2626' },
  { icon: Newspaper, label: 'Actualités', to: '/news', desc: "Découvrez les dernières tendances du secteur", color: '#0891b2' },
];

// ===== VARIANTS =====
const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

// ===== COMPOSANT PRINCIPAL =====
export default function Home() {
  const navigate = useNavigate();
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused,    setPaused]    = useState(false);
  const [slides,    setSlides]    = useState(defaultSlides);
  const [products,  setProducts]  = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % Math.max(slides.length, 1));
    }, 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  // Load news
  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await NewsService.getAll({ page: 1 });
        if (news.results && news.results.length > 0) {
          const newsSlides = news.results.slice(0, 3).map(n => ({
            id: n.id,
            titre: n.titre,
            extrait: n.extrait,
            image: n.image || defaultSlides[0].image,
            bg: 'linear-gradient(135deg, rgba(10,40,15,0.88) 0%, rgba(26,92,42,0.72) 100%)',
          }));
          setSlides(newsSlides.length > 0 ? newsSlides : defaultSlides);
        }
      } catch (err) {
        console.log('News loading failed, using defaults');
      }
    };
    loadNews();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await ProductService.liste({ limit: 6 });
        setProducts(data.results || data || []);
      } catch (err) {
        console.log('Products loading failed');
      }
    };
    loadProducts();
  }, []);

  // Load transporters
  useEffect(() => {
    const loadTransporters = async () => {
      try {
        const data = await TransportService.getTransporters();
        setTransporters(data.results || data || []);
      } catch (err) {
        console.log('Transporters loading failed');
      }
    };
    loadTransporters();
  }, []);

  // Handle search
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await ProductService.liste({ search: query, limit: 10 });
      setSearchResults(data.results || data || []);
    } catch (err) {
      console.log('Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const goTo = (i) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000);
  };

  const slide = slides[current] || defaultSlides[0];
  const productsToShow = products.length > 0 ? products : [];
  const transportersToShow = transporters.length > 0 ? transporters : [];

  return (
    <div style={{ background: '#f8f9f4' }}>

      {/* ============================
          1. HERO SLIDER WITH NEWS
      ============================ */}
      <div
        style={styles.heroWrap}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* BACKGROUND */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            style={{
              ...styles.slideBg,
              backgroundImage: `${slide.bg}, url(${slide.image})`,
            }}
          />
        </AnimatePresence>

        {/* CONTENT */}
        <div style={styles.heroContent}>
          <div className="container-fluid px-4 px-lg-5 h-100 d-flex align-items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + '-text'}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0,  opacity: 1 }}
                exit={{   y: -30, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                style={{ maxWidth: '620px' }}
              >
                <h1 style={styles.heroTitle}>{slide.titre}</h1>
                <p  style={styles.heroDesc}>{slide.extrait}</p>

                <div className="d-flex gap-3 flex-wrap">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/news" style={styles.btnGold}>
                      Lire les actualités <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/auth/register" style={styles.btnGhost}>
                      Créer un compte
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ARROWS */}
        {slides.length > 1 && [-1, 1].map((dir) => (
          <motion.button
            key={dir}
            style={{
              ...styles.arrow,
              [dir === -1 ? 'left' : 'right']: '1.2rem',
            }}
            onClick={dir === -1
              ? () => goTo(current === 0 ? slides.length - 1 : current - 1)
              : () => goTo(current === slides.length - 1 ? 0 : current + 1)
            }
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.3)' }}
            whileTap={{ scale: 0.92 }}
          >
            {dir === -1 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </motion.button>
        ))}

        {/* DOTS */}
        {slides.length > 1 && (
          <div style={styles.dotsWrap}>
            {slides.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i)}
                animate={{
                  width:      i === current ? '30px' : '10px',
                  background: i === current ? '#f0c040' : 'rgba(255,255,255,0.4)',
                }}
                transition={{ duration: 0.3 }}
                style={styles.dot}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============================
          2. SEARCH BAR
      ============================ */}
      <div style={styles.searchSection}>
        <div className="container-fluid px-4 px-lg-5">
          <div style={styles.searchWrap}>
            <Search size={18} color="#6b7280" />
            <input
              type="text"
              placeholder="Rechercher des produits (maïs, riz, soja, etc.)"
              value={searchQuery}
              onChange={handleSearch}
              style={styles.searchInput}
            />
            {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={styles.searchResults}>
              <p style={styles.resultsLabel}>{searchResults.length} résultat(s) trouvé(s)</p>
              <div className="row g-3">
                {searchResults.slice(0, 6).map((p) => (
                  <div key={p.id} className="col-12 col-sm-6 col-md-4">
                    <motion.div
                      style={styles.productCard}
                      whileHover={{ y: -5 }}
                    >
                      <img src={p.image || 'https://via.placeholder.com/300x180'} alt={p.nom} style={styles.productImg} />
                      <div style={{ padding: '1rem' }}>
                        <h4 style={styles.productName}>{p.nom}</h4>
                        <p style={styles.productPrice}>{(p.prix || 0).toLocaleString('fr-FR')} FCFA</p>
                        <Link to={`/products/${p.id}`} style={styles.btnSmall}>Voir détails</Link>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================
          3. FEATURES CARDS
      ============================ */}
      <div style={styles.featSection}>
        <div className="container-fluid px-4 px-lg-5">
          <div className="row g-3 justify-content-center">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  className="col-6 col-md-4 col-lg-2"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <Link to={f.to} style={{ textDecoration: 'none' }}>
                    <motion.div
                      style={styles.featCard}
                      whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                    >
                      <div style={{ ...styles.featIcon, background: f.color + '18' }}>
                        <Icon size={26} color={f.color} strokeWidth={1.8} />
                      </div>
                      <p style={styles.featLabel}>{f.label}</p>
                      <p style={styles.featDesc}>{f.desc}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================
          4. PRODUCTS + TRANSPORTERS
      ============================ */}
      <div className="container-fluid px-4 px-lg-5 py-5">
        <div className="row g-4">

          {/* ---- PRODUCTS ---- */}
          <div className="col-lg-8">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Produits disponibles</h2>
              <Link to="/products" style={styles.voirTout}>
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>

            {productsToShow.length > 0 ? (
              <div className="row g-3">
                {productsToShow.map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="col-12 col-sm-6 col-md-4"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.div
                      style={styles.productCard}
                      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.13)' }}
                    >
                      <div style={styles.productImgWrap}>
                        <img
                          src={p.image || 'https://via.placeholder.com/300x180?text=Produit'}
                          alt={p.nom}
                          style={styles.productImg}
                        />
                        <span style={styles.productBadge}>Disponible</span>
                      </div>

                      <div style={{ padding: '1rem' }}>
                        <h3 style={styles.productName}>{p.nom}</h3>
                        <div style={styles.productLoc}>
                          <MapPin size={13} color="#6b7280" />
                          <span>{p.ville || p.localisation}</span>
                        </div>
                        <div style={styles.productFooter}>
                          <span style={styles.productPrice}>
                            {(p.prix || 0).toLocaleString('fr-FR')} FCFA
                          </span>
                          <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                            <motion.button
                              style={styles.btnAcheter}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Acheter
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement des produits...</p>
            )}
          </div>

          {/* ---- TRANSPORTERS ---- */}
          <div className="col-lg-4">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Transporteurs disponibles</h2>
              <Link to="/transporters" style={styles.voirTout}>
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>

            {transportersToShow.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transportersToShow.slice(0, 3).map((t, i) => (
                  <motion.div
                    key={t.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.div
                      style={styles.transportCard}
                      whileHover={{ x: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                    >
                      <img src={t.photo || 'https://via.placeholder.com/50'} alt={t.nom_complet || t.nom} style={styles.avatar} />

                      <div style={{ flex: 1 }}>
                        <div style={styles.transportName}>{t.nom_complet || t.nom}</div>
                        <div style={styles.transportInfo}>{t.immatriculation || t.vehicule}</div>
                        <div style={styles.transportLoc}>
                          <MapPin size={11} color="#6b7280" />
                          <span>{t.ville || t.localisation}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={styles.statutBadge}>
                          <span style={styles.statutDot} />
                          Disponible
                        </span>
                        <Link to={`/transporters/${t.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
                          <motion.button
                            style={styles.btnContacter}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Contacter
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement des transporteurs...</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

// ===== STYLES =====
const styles = {
  // HERO
  heroWrap: {
    position: 'relative',
    height: '500px',
    overflow: 'hidden',
    marginBottom: '3rem',
  },
  slideBg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    color: 'white',
  },
  heroTitle: {
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: '900',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  heroDesc: {
    fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
    lineHeight: 1.6,
    marginBottom: '2rem',
    opacity: 0.95,
  },
  btnGold: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f0c040',
    color: '#1a2e10',
    padding: '1rem 1.8rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'all 0.3s',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: '1rem 1.8rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    border: '1.5px solid rgba(255,255,255,0.3)',
    transition: 'all 0.3s',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dotsWrap: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
  },
  dot: {
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    height: '8px',
    transition: 'all 0.3s',
  },

  // SEARCH
  searchSection: {
    background: 'white',
    padding: '2rem 0',
    marginBottom: '3rem',
    borderBottom: '1px solid #e5e7eb',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#f3f4f6',
    padding: '0.75rem 1.2rem',
    borderRadius: '50px',
    border: '1.5px solid #e5e7eb',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '0.95rem',
    color: '#1a2e10',
  },
  searchResults: {
    marginTop: '1.5rem',
  },
  resultsLabel: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },

  // FEATURES
  featSection: {
    background: 'white',
    padding: '3rem 0',
    marginBottom: '2rem',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
  },
  featCard: {
    background: 'white',
    border: '1.5px solid #e5e7eb',
    borderRadius: '16px',
    padding: '1.5rem 1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  featIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  featLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#1a2e10',
    margin: '0.5rem 0',
  },
  featDesc: {
    fontSize: '0.8rem',
    color: '#6b7280',
    margin: '0.5rem 0 0',
  },

  // SECTION
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1a2e10',
  },
  voirTout: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  },

  // PRODUCTS
  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  productImgWrap: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
    background: '#f3f4f6',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#1a5c2a',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  productName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1a2e10',
    margin: '0 0 0.5rem',
  },
  productLoc: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.8rem',
  },
  productFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#1a5c2a',
  },
  btnAcheter: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSmall: {
    display: 'inline-block',
    background: '#2563eb',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textDecoration: 'none',
  },

  // TRANSPORTERS
  transportCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  transportName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#1a2e10',
  },
  transportInfo: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  transportLoc: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  statutBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#10b981',
  },
  statutDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
  },
  btnContacter: {
    display: 'block',
    width: '100%',
    marginTop: '0.5rem',
    background: '#1a5c2a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
