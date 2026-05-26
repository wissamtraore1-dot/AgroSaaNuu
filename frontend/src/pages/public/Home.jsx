import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Truck, User, Users, Shield, TrendingUp,
  Newspaper, MapPin, Star, ArrowUpRight
} from 'lucide-react';

// ===== MOCK DATA =====
const slides = [
  {
    id: 1,
    title: 'Le Bénin dpci explique les raisons de la hausse des prix des céréales',
    description: 'Découvrez les facteurs qui influencent le marché céréalier au Bénin.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(10,40,15,0.88) 0%, rgba(26,92,42,0.72) 100%)',
    cta: "Lire l'article", ctaLink: '/news',
  },
  {
    id: 2,
    title: 'Des céréales de qualité directement des coopératives du Bénin',
    description: 'Maïs, riz, soja — achetez en direct auprès des producteurs locaux.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(30,20,5,0.88) 0%, rgba(120,80,10,0.72) 100%)',
    cta: "lire l'article", ctaLink: '/products',
  },
  {
    id: 3,
    title: "l'evolution du transport routier   pour la  livraison agricole",
    description: 'Réseau de transporteurs vérifiés disponibles dans tout le Bénin.',
    image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(5,20,40,0.88) 0%, rgba(10,60,100,0.72) 100%)',
    cta: "Lire l'article", ctaLink: '/transporters',
  },
];

const features = [
    { icon: Truck, label: 'Livraison rurale', to: '/transporters', desc: "Bénéficiez d'un transport adapté à vos marchandises", color: '#1a5c2a' },
    { icon: User, label: 'Mon AgroCompte', to: '/login', desc: "Gérez vos offres et commandes en un clic", color: '#2563eb' },
    { icon: Users, label: 'Coopératives', to: '/cooperatives', desc: "Localisez les partenaires agricoles proches", color: '#7c3aed' },
    { icon: Shield, label: 'Paiements', to: '/payments', desc: "MTN, Moov, Celtis — paiement 100% sécurisé", color: '#d97706' },
    { icon: TrendingUp, label: 'Prix', to: '/market-prices', desc: "Consultez les prix du marché en temps réel", color: '#dc2626' },
    { icon: Newspaper, label: 'Actualités', to: '/news', desc: "Découvrez les dernières tendances du secteur", color: '#0891b2' },
  ];

const products = [
  { id: 1, nom: 'Maïs 2t',  localisation: 'Bankoura', prix: 1000000, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80' },
  { id: 2, nom: 'Riz 3t',   localisation: 'Parakou',  prix: 1160000, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
  { id: 3, nom: 'Soja 1t',  localisation: 'Nikki',    prix: 67000,   image: 'https://triomphemag.com/wp-content/uploads/2023/09/soja-1.jpg' },
];

// ===== TRANSPORTEURS (CORRIGÉ + AVATARS AFRICAINS) =====
const transporteurs = [
    {
      id: 1,
      nom: "Moussa T.",
      image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=200&q=80",
      vehicule: "Camion 10t",
      localisation: "Banikora",
      statut: "Disponible",
    },
    {
      id: 2,
      nom: "Kofi A.",
      image: "https://img.magnific.com/photos-premium/portrait-conducteur-professionnel-noir-regardant-camera-fond-camion-bokeh_1104566-200.jpg",
      vehicule: "Camion 8t",
      localisation: "Parakou",
      statut: "Disponible",
    },
    {
      id: 3,
      nom: "Sèna B.",
      image: "https://auto-escola.cfcnovaferrari.com.br/blog/doutor/uploads/6/blog/2024/12/blog-cnh-categoria-d-preco-tudo-que-voce-precisa-saber-e2f7dc00a0.png",
      vehicule: "Camion 5t",
      localisation: "Cotonou",
      statut: "Disponible",
    },
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
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused,    setPaused]    = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, current]);

  const goTo = (i) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000);
  };

  const slide = slides[current];

  return (
    <div style={{ background: '#f8f9f4' }}>

      {/* ============================
          1. HERO SLIDER
      ============================ */}
      <div
        style={styles.heroWrap}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* FOND */}
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

        {/* CONTENU */}
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

                <h1 style={styles.heroTitle}>{slide.title}</h1>
                <p  style={styles.heroDesc}>{slide.description}</p>

                <div className="d-flex gap-3 flex-wrap">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to={slide.ctaLink} style={styles.btnGold}>
                      {slide.cta} <ArrowRight size={16} />
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

        {/* FLÈCHES */}
        {[-1, 1].map((dir) => (
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

        {/* PROGRESS */}
        <div style={styles.progressTrack}>
          <motion.div
            key={current + '-bar'}
            style={styles.progressFill}
            initial={{ width: '0%' }}
            animate={{ width: paused ? undefined : '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>
      </div>

      {/* ============================
          2. SECTION FONCTIONNALITÉS
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
                 <Link to="/auth/login" style={{ textDecoration: 'none' }}>
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
          3. PRODUITS + TRANSPORTEURS
      ============================ */}
      <div className="container-fluid px-4 px-lg-5 py-5">
        <div className="row g-4">

          {/* ---- PRODUITS ---- */}
          <div className="col-lg-8">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Produits disponibles</h2>
              <Link to="/products" style={styles.voirTout}>
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="row g-3">
              {products.map((p, i) => (
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
                    {/* IMAGE */}
                    <div style={styles.productImgWrap}>
                      <img
                        src={p.image}
                        alt={p.nom}
                        style={styles.productImg}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x180?text=Produit'; }}
                      />
                      <span style={styles.productBadge}>Disponible</span>
                    </div>

                    {/* INFOS */}
                    <div style={{ padding: '1rem' }}>
                      <h3 style={styles.productName}>{p.nom}</h3>
                      <div style={styles.productLoc}>
                        <MapPin size={13} color="#6b7280" />
                        <span>Localisation : {p.localisation}</span>
                      </div>
                      <div style={styles.productFooter}>
                        <span style={styles.productPrice}>
                          {p.prix.toLocaleString('fr-FR')} FCFA
                        </span>
                        <Link to="/auth/login" style={{ textDecoration: 'none' }}>
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
          </div>

          {/* ---- TRANSPORTEURS ---- */}
          <div className="col-lg-4">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Transporteurs disponibles</h2>
              <Link to="/transporters" style={styles.voirTout}>
                Voir tout <ArrowUpRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transporteurs.map((t, i) => (
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
                    {/* AVATAR */}
                    <img src={t.image} alt={t.nom} style={styles.avatar} />

                    {/* INFOS */}
                    <div style={{ flex: 1 }}>
                      <div style={styles.transportName}>{t.nom}</div>
                      <div style={styles.transportInfo}>{t.vehicule}</div>
                      <div style={styles.transportLoc}>
                        <MapPin size={11} color="#6b7280" />
                        <span>{t.localisation}</span>
                      </div>
                    </div>

                    {/* STATUT */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={styles.statutBadge}>
                        <span style={styles.statutDot} />
                        {t.statut}
                      </span>
                      <Link to="/auth/login" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
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
    background: '#0e2010',
  },
  slideBg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroContent: {
    position: 'absolute',
    inset: 0,
    zIndex: 2,
  },
  tag: {
    display: 'inline-block',
    background: 'rgba(240,192,64,0.18)',
    border: '1px solid #f0c040',
    color: '#f0c040',
    padding: '0.28rem 1rem',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  heroTitle: {
    color: 'white',
    fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
    fontWeight: '800',
    lineHeight: 1.2,
    marginBottom: '1rem',
    textShadow: '0 2px 16px rgba(0,0,0,0.5)',
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.98rem',
    marginBottom: '1.8rem',
    lineHeight: 1.6,
    maxWidth: '480px',
  },
  btnGold: {
    background: '#f0c040',
    color: '#1a2e10',
    padding: '0.7rem 1.7rem',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 18px rgba(240,192,64,0.4)',
  },
  btnGhost: {
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    padding: '0.7rem 1.7rem',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: '1.5px solid rgba(255,255,255,0.45)',
    display: 'flex',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.4)',
    color: 'white',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 3,
    backdropFilter: 'blur(6px)',
  },
  dotsWrap: {
    position: 'absolute',
    bottom: '1.8rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 3,
  },
  dot: {
    height: '10px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '4px',
    background: 'rgba(255,255,255,0.2)',
    zIndex: 3,
  },
  progressFill: {
    height: '100%',
    background: '#f0c040',
  },

  // FEATURES
  featSection: {
    background: 'white',
    padding: '2rem 0',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  featCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.2rem 1rem',
    textAlign: 'center',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    height: '100%',
  },
  featIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.8rem',
  },
  featLabel: {
    fontWeight: '700',
    fontSize: '0.82rem',
    color: '#1a2e10',
    marginBottom: '0.4rem',
    lineHeight: 1.3,
  },
  featDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
    lineHeight: 1.4,
    margin: 0,
  },

  // SECTIONS
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.2rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#1a2e10',
    margin: 0,
  },
  voirTout: {
    fontSize: '0.85rem',
    color: '#1a5c2a',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  // PRODUITS
  productCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  productImgWrap: {
    position: 'relative',
    height: '160px',
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  productBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#dcfce7',
    color: '#166534',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  productName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a2e10',
    marginBottom: '0.4rem',
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
    fontSize: '0.92rem',
    fontWeight: '800',
    color: '#1a5c2a',
  },
  btnAcheter: {
    background: '#1a5c2a',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '0.35rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // TRANSPORTEURS
  transportCard: {
    background: 'white',
    borderRadius: '14px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #f0c040',
    flexShrink: 0,
  },
  transportName: {
    fontWeight: '700',
    fontSize: '0.92rem',
    color: '#1a2e10',
  },
  transportInfo: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  transportLoc: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '2px',
  },
  statutBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: '#dcfce7',
    color: '#166534',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '6px',
    whiteSpace: 'nowrap',
  },
  statutDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#16a34a',
    display: 'inline-block',
  },
  btnContacter: {
    background: 'transparent',
    color: '#1a5c2a',
    border: '1.5px solid #1a5c2a',
    borderRadius: '20px',
    padding: '0.28rem 0.8rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
  },
};