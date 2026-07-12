import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowRight,
  Truck, User, Users, Shield, TrendingUp,
  Newspaper, MapPin, ArrowUpRight, Wheat, ExternalLink
} from 'lucide-react';
import ProductService from '../../services/product.service';
import TransportService from '../../services/transport.service';
import api from '../../services/api';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1400&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1400&q=80',
];

const FALLBACK_SLIDES = [
  {
    id: 'f1',
    title: 'Céréales de qualité directement des coopératives du Bénin',
    description: 'Maïs, riz, soja — achetez en direct auprès des producteurs locaux.',
    image: FALLBACK_IMAGES[0],
    bg: 'linear-gradient(135deg, rgba(10,40,15,0.88) 0%, rgba(26,92,42,0.72) 100%)',
    cta: 'Voir les produits', ctaLink: '/products', external: false,
  },
  {
    id: 'f2',
    title: 'Réseau de transporteurs vérifiés dans tout le Bénin',
    description: 'Livraison sécurisée de vos céréales — pick-up, camion 5t, 10t et plus.',
    image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=1400&q=80',
    bg: 'linear-gradient(135deg, rgba(8,30,14,0.90) 0%, rgba(20,75,35,0.75) 100%)',
    cta: 'Trouver un transporteur', ctaLink: '/transporters', external: false,
  },
];

function fallbackImg(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return FALLBACK_IMAGES[Math.abs(h) % FALLBACK_IMAGES.length];
}

const features = [
  { icon: Truck,      label: 'Livraison',    to: '/transporters',              desc: 'Transport adapté à vos marchandises',     color: '#1a5c2a' },
  { icon: User,       label: 'Mon espace',   to: '/auth/login',                desc: 'Gérez vos offres et commandes',           color: '#2d7a3a' },
  { icon: Users,      label: 'Coopératives', to: '/auth/register?role=SELLER', desc: 'Rejoignez ou créez une coopérative',      color: '#b8860b' },
  { icon: Shield,     label: 'Paiements',    to: '/finance/wallet',            desc: 'MTN, Moov, Celtis — paiement sécurisé',  color: '#d97706' },
  { icon: TrendingUp, label: 'Prix marché',  to: '/market-prices',             desc: 'Consultez les prix en temps réel',       color: '#dc2626' },
  { icon: Newspaper,  label: 'Actualités',   to: '/news',                      desc: 'Tendances du secteur agricole',          color: '#4a9e5c' },
];

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'TR';

export default function Home() {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused,    setPaused]    = useState(false);

  const [slides,        setSlides]        = useState(FALLBACK_SLIDES);
  const [products,      setProducts]      = useState([]);
  const [transporteurs, setTransporteurs] = useState([]);
  const [loadingData,   setLoadingData]   = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [prodRes, transpRes, newsRes] = await Promise.allSettled([
          ProductService.liste({ page_size: 3 }),
          TransportService.getTransporters({ page: 1 }),
          api.get('/news/external/'),
        ]);

        if (!active) return;

        if (prodRes.status === 'fulfilled') {
          const items = prodRes.value.results || prodRes.value || [];
          setProducts(items.slice(0, 3).map(p => ({
            id:           p.id,
            nom:          p.nom,
            localisation: p.ville || p.localisation || 'Bénin',
            prix:         Number(p.prix || 0),
            image:        p.images?.find(i => i.est_principale)?.image
                          || p.images?.[0]?.image
                          || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
            dispo: p.est_disponible,
          })));
        }

        if (transpRes.status === 'fulfilled') {
          const items = transpRes.value.transporteurs || transpRes.value.results || transpRes.value || [];
          setTransporteurs(items.slice(0, 3).map(u => ({
            id:           u.id,
            nom:          u.nom_complet || `${u.prenom} ${u.nom}`,
            localisation: u.ville || 'Bénin',
            statut:       u.transporter_profile?.est_disponible ? 'Disponible' : 'En mission',
            verifie:      u.transporter_profile?.est_certifie || false,
          })));
        }

        if (newsRes.status === 'fulfilled') {
          const articles = newsRes.value.data?.articles || [];
          const mapped = articles.slice(0, 5).map((a, idx) => ({
            id:          a.url || idx,
            title:       a.titre,
            description: a.extrait || '',
            image:       a.image || fallbackImg(a.titre || String(idx)),
            bg:          'linear-gradient(135deg, rgba(8,30,12,0.85) 0%, rgba(20,70,30,0.70) 100%)',
            source:      a.source || '',
            date:        a.date || '',
            cta:         "Lire l'article",
            ctaLink:     a.url || '/news',
            external:    !!a.url,
          }));
          if (mapped.length > 0) setSlides(mapped);
        }
      } finally {
        if (active) setLoadingData(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent(p => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [paused, current, slides.length]);

  const goTo = i => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000);
  };

  const slide = slides[Math.min(current, slides.length - 1)];

  return (
    <div style={{ background: '#f8f9f4', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── 1. HERO SLIDER ───────────────────────────────────── */}
      <div
        style={s.heroWrap}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            style={{ ...s.slideBg, backgroundImage: `${slide.bg}, url(${slide.image})` }}
          />
        </AnimatePresence>

        <div style={s.heroContent}>
          <div className="container-fluid px-4 px-lg-5 h-100 d-flex align-items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + '-text'}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0,  opacity: 1 }}
                exit={{   y: -30, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                style={{ maxWidth: '640px' }}
              >
                {slide.source && (
                  <div style={s.newsTag}>
                    <Newspaper size={13} />
                    {slide.source}
                    {slide.date && (
                      <span style={{ opacity: 0.7 }}>
                        {' '}· {new Date(slide.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                )}

                <h1 style={s.heroTitle}>{slide.title}</h1>

                {slide.description && (
                  <p style={s.heroDesc}>{slide.description}</p>
                )}

                <div className="d-flex gap-3 flex-wrap">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    {slide.external ? (
                      <a href={slide.ctaLink} target="_blank" rel="noopener noreferrer" style={s.btnGold}>
                        {slide.cta} <ExternalLink size={16} />
                      </a>
                    ) : (
                      <Link to={slide.ctaLink} style={s.btnGold}>
                        {slide.cta} <ArrowRight size={17} />
                      </Link>
                    )}
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/news" style={s.btnGhost}>Toutes les actualités</Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Flèches */}
        {[-1, 1].map(dir => (
          <motion.button
            key={dir}
            style={{ ...s.arrow, [dir === -1 ? 'left' : 'right']: '1.4rem' }}
            onClick={dir === -1
              ? () => goTo(current === 0 ? slides.length - 1 : current - 1)
              : () => goTo(current === slides.length - 1 ? 0 : current + 1)
            }
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.28)' }}
            whileTap={{ scale: 0.92 }}
          >
            {dir === -1 ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </motion.button>
        ))}

        {/* Dots */}
        <div style={s.dotsWrap}>
          {slides.map((_, i) => (
            <motion.button
              key={i} onClick={() => goTo(i)}
              animate={{ width: i === current ? '32px' : '10px', background: i === current ? '#f0c040' : 'rgba(255,255,255,0.4)' }}
              transition={{ duration: 0.3 }}
              style={s.dot}
            />
          ))}
        </div>

        {/* Barre de progression */}
        <div style={s.progressTrack}>
          <motion.div
            key={current + '-bar'} style={s.progressFill}
            initial={{ width: '0%' }}
            animate={{ width: paused ? undefined : '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>
      </div>

      {/* ── 2. FONCTIONNALITÉS ──────────────────────────────── */}
      <div style={s.featSection}>
        <div className="container-fluid px-4 px-lg-5">
          <div className="row g-3 justify-content-center">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i} className="col-6 col-md-4 col-lg-2"
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <Link to={f.to} style={{ textDecoration: 'none' }}>
                    <motion.div
                      style={s.featCard}
                      whileHover={{ y: -6, boxShadow: `0 0 0 2px ${f.color}, 0 12px 32px ${f.color}22` }}
                    >
                      <div style={{ ...s.featIcon, background: f.color + '15' }}>
                        <Icon size={28} color={f.color} strokeWidth={1.7} />
                      </div>
                      <p style={s.featLabel}>{f.label}</p>
                      <p style={s.featDesc}>{f.desc}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. PRODUITS + TRANSPORTEURS ─────────────────────── */}
      <div className="container-fluid px-4 px-lg-5 py-5">
        <div className="row g-5">

          {/* PRODUITS */}
          <div className="col-lg-8">
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>Produits disponibles</h2>
                <p style={s.sectionSubtitle}>Céréales fraîches directement des producteurs</p>
              </div>
              <Link to="/products" style={s.voirTout}>
                Voir tout <ArrowUpRight size={15} />
              </Link>
            </div>

            {loadingData ? (
              <div className="row g-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="col-12 col-sm-6 col-md-4">
                    <div style={{ ...s.productCard, height: '260px', background: '#f3f4f6' }} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={s.emptyState}>
                <Wheat size={44} color="#d1d5db" />
                <p style={s.emptyTitle}>Aucun produit pour le moment</p>
                <p style={s.emptyDesc}>Les vendeurs publient leurs céréales ici</p>
                <Link to="/auth/register?role=SELLER" style={s.btnEmptyAction}>
                  Devenir vendeur
                </Link>
              </div>
            ) : (
              <div className="row g-3">
                {products.map((p, i) => (
                  <motion.div
                    key={p.id} className="col-12 col-sm-6 col-md-4"
                    variants={fadeUp} initial="hidden" animate="show"
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.div
                      style={s.productCard}
                      whileHover={{ y: -6, boxShadow: '0 0 0 2px #1a5c2a, 0 16px 40px rgba(26,92,42,0.16)' }}
                    >
                      <div style={s.productImgWrap}>
                        <img
                          src={p.image} alt={p.nom} style={s.productImg}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80'; }}
                        />
                        {p.dispo && <span style={s.productBadge}>Disponible</span>}
                      </div>
                      <div style={{ padding: '1.1rem 1.2rem 1.2rem' }}>
                        <h3 style={s.productName}>{p.nom}</h3>
                        <div style={s.productLoc}>
                          <MapPin size={13} color="#6b7280" />
                          <span>{p.localisation}</span>
                        </div>
                        <div style={s.productFooter}>
                          <div>
                            <span style={s.productPrice}>
                              {p.prix.toLocaleString('fr-FR')} FCFA
                            </span>
                            <span style={s.productUnit}> / unité</span>
                          </div>
                          <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                            <motion.button style={s.btnAcheter} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              Voir l'offre
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* TRANSPORTEURS */}
          <div className="col-lg-4">
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>Transporteurs</h2>
                <p style={s.sectionSubtitle}>Vérifiés et disponibles dans tout le Bénin</p>
              </div>
              <Link to="/transporters" style={s.voirTout}>
                Voir tout <ArrowUpRight size={15} />
              </Link>
            </div>

            {loadingData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[1, 2, 3].map(n => (
                  <div key={n} style={{ ...s.transportCard, height: '90px', background: '#f3f4f6' }} />
                ))}
              </div>
            ) : transporteurs.length === 0 ? (
              <div style={s.emptyState}>
                <Truck size={40} color="#d1d5db" />
                <p style={s.emptyTitle}>Aucun transporteur inscrit</p>
                <p style={s.emptyDesc}>Les transporteurs rejoignent la plateforme ici</p>
                <Link to="/auth/register?role=TRANSPORTER" style={s.btnEmptyAction}>
                  Devenir transporteur
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {transporteurs.map((t, i) => (
                  <motion.div
                    key={t.id}
                    variants={fadeUp} initial="hidden" animate="show"
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.div
                      style={s.transportCard}
                      whileHover={{ x: 4, boxShadow: '0 0 0 2px #1a5c2a, 0 8px 24px rgba(26,92,42,0.14)' }}
                    >
                      <div style={s.initialsAvatar}>{getInitials(t.nom)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.transportName}>
                          {t.nom}
                          {t.verifie && (
                            <span style={s.verifiBadge}>Vérifié</span>
                          )}
                        </div>
                        <div style={s.transportLoc}>
                          <MapPin size={12} color="#6b7280" />
                          <span>{t.localisation}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{
                          ...s.statutBadge,
                          background: t.statut === 'Disponible' ? '#dcfce7' : '#fef9c3',
                          color:      t.statut === 'Disponible' ? '#166534' : '#854d0e',
                        }}>
                          <span style={{ ...s.statutDot, background: t.statut === 'Disponible' ? '#16a34a' : '#ca8a04' }} />
                          {t.statut}
                        </span>
                        <Link to="/transporters" style={{ textDecoration: 'none', display: 'block', marginTop: '6px' }}>
                          <motion.button style={s.btnContacter} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Contacter
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const s = {
  // HERO
  heroWrap: {
    position: 'relative', height: '540px',
    overflow: 'hidden', background: '#0e2010',
  },
  slideBg: {
    position: 'absolute', inset: 0,
    backgroundSize: 'cover', backgroundPosition: 'center',
  },
  heroContent: { position: 'absolute', inset: 0, zIndex: 2 },
  newsTag: {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    background: 'rgba(240,192,64,0.18)', border: '1px solid #f0c040',
    color: '#f0c040', padding: '0.35rem 1.1rem', borderRadius: '30px',
    fontSize: '0.82rem', fontWeight: '600', marginBottom: '1.1rem',
  },
  heroTitle: {
    color: 'white', fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
    fontWeight: '800', lineHeight: 1.22, marginBottom: '1.1rem',
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.87)', fontSize: '1.05rem',
    marginBottom: '2rem', lineHeight: 1.7, maxWidth: '500px',
  },
  btnGold: {
    background: '#f0c040', color: '#1a2e10',
    padding: '0.78rem 1.8rem', borderRadius: '30px',
    textDecoration: 'none', fontWeight: '700', fontSize: '0.97rem',
    display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 4px 20px rgba(240,192,64,0.4)',
  },
  btnGhost: {
    background: 'rgba(255,255,255,0.12)', color: 'white',
    padding: '0.78rem 1.8rem', borderRadius: '30px',
    textDecoration: 'none', fontWeight: '600', fontSize: '0.97rem',
    border: '1.5px solid rgba(255,255,255,0.45)',
    display: 'flex', alignItems: 'center',
  },
  arrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.13)', border: '1.5px solid rgba(255,255,255,0.35)',
    color: 'white', borderRadius: '50%', width: '50px', height: '50px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 3, backdropFilter: 'blur(6px)',
  },
  dotsWrap: {
    position: 'absolute', bottom: '2rem', left: '50%',
    transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 3,
  },
  dot: { height: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', padding: 0 },
  progressTrack: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '4px', background: 'rgba(255,255,255,0.18)', zIndex: 3,
  },
  progressFill: { height: '100%', background: '#f0c040' },

  // FONCTIONNALITÉS
  featSection: {
    background: 'white', padding: '2.4rem 0',
    borderBottom: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  featCard: {
    background: 'white', borderRadius: '18px', padding: '1.4rem 1.1rem',
    textAlign: 'center', border: '1px solid #efefef',
    cursor: 'pointer', transition: 'all 0.2s', height: '100%',
  },
  featIcon: {
    width: '62px', height: '62px', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  featLabel: {
    fontWeight: '700', fontSize: '0.9rem',
    color: '#1a2e10', marginBottom: '0.45rem', lineHeight: 1.3,
  },
  featDesc: {
    fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, margin: 0,
  },

  // EN-TÊTES DE SECTION
  sectionHeader: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: '1.6rem',
  },
  sectionTitle: {
    fontSize: '1.45rem', fontWeight: '800',
    color: '#1a2e10', margin: '0 0 4px',
  },
  sectionSubtitle: {
    fontSize: '0.88rem', color: '#6b7280', margin: 0, fontWeight: '400',
  },
  voirTout: {
    fontSize: '0.9rem', color: '#1a5c2a', textDecoration: 'none',
    fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
    whiteSpace: 'nowrap', marginTop: '4px',
  },

  // ÉTATS VIDES
  emptyState: {
    textAlign: 'center', padding: '3rem 1.5rem',
    background: 'white', borderRadius: '18px',
    border: '1.5px dashed #e5e7eb',
  },
  emptyTitle: { color: '#6b7280', fontWeight: '700', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.3rem' },
  emptyDesc:  { color: '#d1d5db', fontSize: '0.88rem', margin: 0 },
  btnEmptyAction: {
    display: 'inline-block', marginTop: '1.2rem',
    background: '#1a5c2a', color: 'white',
    padding: '0.6rem 1.6rem', borderRadius: '22px',
    textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600',
  },

  // CARTES PRODUITS
  productCard: {
    background: 'white', borderRadius: '18px',
    overflow: 'hidden', border: '1px solid #e5e7eb',
    cursor: 'pointer', transition: 'all 0.22s',
  },
  productImgWrap: { position: 'relative', height: '170px', overflow: 'hidden' },
  productImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  productBadge: {
    position: 'absolute', top: '10px', left: '10px',
    background: '#dcfce7', color: '#166534',
    fontSize: '0.76rem', fontWeight: '700',
    padding: '4px 11px', borderRadius: '20px',
  },
  productName: {
    fontSize: '1.05rem', fontWeight: '700',
    color: '#1a2e10', marginBottom: '0.5rem',
  },
  productLoc: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '0.84rem', color: '#6b7280', marginBottom: '1rem',
  },
  productFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: '1.05rem', fontWeight: '800', color: '#1a5c2a',
  },
  productUnit: {
    fontSize: '0.78rem', color: '#9ca3af', fontWeight: '400',
  },
  btnAcheter: {
    background: '#1a5c2a', color: 'white', border: 'none',
    borderRadius: '22px', padding: '0.45rem 1.1rem',
    fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer',
  },

  // CARTES TRANSPORTEURS
  transportCard: {
    background: 'white', borderRadius: '16px', padding: '1.1rem 1.2rem',
    display: 'flex', alignItems: 'center', gap: '14px',
    border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s',
  },
  initialsAvatar: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: '#eef7ef', color: '#1a5c2a',
    border: '2px solid #f0c040', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '800', fontSize: '0.95rem',
  },
  transportName: {
    fontWeight: '700', fontSize: '0.97rem',
    color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px',
  },
  verifiBadge: {
    fontSize: '0.72rem', color: '#16a34a',
    background: '#dcfce7', padding: '2px 7px', borderRadius: '10px',
    fontWeight: '600',
  },
  transportLoc: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '0.82rem', color: '#6b7280', marginTop: '3px',
  },
  statutBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '0.76rem', fontWeight: '700',
    padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
  },
  statutDot: {
    width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block',
  },
  btnContacter: {
    background: 'transparent', color: '#1a5c2a',
    border: '1.5px solid #1a5c2a', borderRadius: '20px',
    padding: '0.35rem 0.9rem', fontSize: '0.84rem',
    fontWeight: '600', cursor: 'pointer', width: '100%',
  },
};
