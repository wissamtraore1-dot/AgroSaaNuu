import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Calendar, Eye, Heart,
  Tag, ArrowRight, Clock, X,
  TrendingUp, Bookmark, Share2
} from 'lucide-react';
import NewsService from '../../services/news.service';

// ===== MOCK DATA =====
const articles = [
  {
    id: 1,
    titre:      'Le Bénin dpci explique les raisons de la hausse des prix des céréales',
    extrait:    'Les autorités béninoises ont tenu une conférence pour expliquer les facteurs qui influencent le marché céréalier cette saison.',
    categorie:  'Marché',
    date:       '07 Mai 2026',
    lecture:    '5 min',
    vues:       1240,
    likes:      89,
    image:      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
    vedette:    true,
    auteur:     'Rédaction AgroConnect',
    tags:       ['Prix', 'Marché', 'Bénin'],
  },
  {
    id: 2,
    titre:      'Nouvelle coopérative agricole ouvre ses portes à Parakou',
    extrait:    'Une nouvelle coopérative regroupant plus de 200 producteurs de maïs et de riz vient d\'être officiellement inaugurée.',
    categorie:  'Coopératives',
    date:       '05 Mai 2026',
    lecture:    '3 min',
    vues:       856,
    likes:      62,
    image:      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    vedette:    false,
    auteur:     'Kofi Amegah',
    tags:       ['Coopérative', 'Parakou', 'Maïs'],
  },
  {
    id: 3,
    titre:      'Les techniques modernes d\'irrigation révolutionnent la culture du riz',
    extrait:    'Des agriculteurs du nord Bénin adoptent de nouvelles techniques d\'irrigation qui permettent d\'augmenter les rendements de 40%.',
    categorie:  'Agriculture',
    date:       '03 Mai 2026',
    lecture:    '7 min',
    vues:       2100,
    likes:      145,
    image:      'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800&q=80',
    vedette:    false,
    auteur:     'Moussa Kéita',
    tags:       ['Irrigation', 'Riz', 'Technologie'],
  },
  {
    id: 4,
    titre:      'Le gouvernement annonce des subventions pour les producteurs de soja',
    extrait:    'Le ministère de l\'agriculture a annoncé un programme de subventions destiné à soutenir les producteurs de soja du Bénin.',
    categorie:  'Politique',
    date:       '01 Mai 2026',
    lecture:    '4 min',
    vues:       3400,
    likes:      210,
    image:      'https://images.unsplash.com/photo-1599579773853-3b3e1b43f7d5?w=800&q=80',
    vedette:    true,
    auteur:     'Rédaction AgroConnect',
    tags:       ['Soja', 'Subvention', 'Gouvernement'],
  },
  {
    id: 5,
    titre:      'Formation des jeunes agriculteurs au numérique',
    extrait:    'Un programme de formation au numérique pour les jeunes agriculteurs béninois a été lancé en partenariat avec des ONG locales.',
    categorie:  'Formation',
    date:       '28 Avr 2026',
    lecture:    '6 min',
    vues:       987,
    likes:      73,
    image:      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
    vedette:    false,
    auteur:     'Sèna Bello',
    tags:       ['Formation', 'Numérique', 'Jeunes'],
  },
  {
    id: 6,
    titre:      'Record de production de maïs au Bénin en 2026',
    extrait:    'Le Bénin enregistre une production record de maïs cette année grâce aux bonnes pluies et aux nouvelles variétés semées.',
    categorie:  'Production',
    date:       '25 Avr 2026',
    lecture:    '4 min',
    vues:       1560,
    likes:      98,
    image:      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    vedette:    false,
    auteur:     'Yao Dossou',
    tags:       ['Maïs', 'Production', 'Record'],
  },
];

const categories = ['Tous', 'Marché', 'Coopératives', 'Agriculture', 'Politique', 'Formation', 'Production'];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function News() {
  const [search,     setSearch]     = useState('');
  const [categorie,  setCategorie]  = useState('Tous');
  const [likes,      setLikes]      = useState([]);
  const [bookmarks,  setBookmarks]  = useState([]);
  const [articlesData, setArticlesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState(['Tous']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [newsResponse, categoryResponse] = await Promise.all([
          NewsService.getAll({ search }),
          NewsService.getCategories(),
        ]);

        if (!active) return;

        const newsItems = newsResponse.results || newsResponse;
        const categoryItems = categoryResponse.results || categoryResponse;

        setArticlesData(newsItems.map((item) => ({
          id: item.id,
          titre: item.titre,
          extrait: item.extrait,
          categorie: item.categorie_nom || 'Actualite',
          date: new Date(item.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          lecture: `${Math.max(1, Math.ceil((item.contenu?.length || item.extrait?.length || 400) / 900))} min`,
          vues: item.vues || 0,
          likes: 0,
          image: item.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80',
          vedette: item.est_vedette,
          auteur: item.auteur_nom || 'Redaction AgroConnect',
          tags: item.tags || [],
        })));
        setCategoriesData(['Tous', ...categoryItems.map((cat) => cat.nom)]);
      } catch {
        if (active) {
          setError('Impossible de charger les actualites depuis le backend.');
          setArticlesData([]);
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

  const toggleLike     = (id) => setLikes(    (p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleBookmark = (id) => setBookmarks((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const articlesFiltres = useMemo(() => {
    let result = [...articlesData];
    if (search)               result = result.filter((a) => a.titre.toLowerCase().includes(search.toLowerCase()) || a.extrait.toLowerCase().includes(search.toLowerCase()));
    if (categorie !== 'Tous') result = result.filter((a) => a.categorie === categorie);
    return result;
  }, [articlesData, search, categorie]);

  const articleVedette = articlesData.find((a) => a.vedette && !search && categorie === 'Tous');
  const autresArticles = articlesFiltres.filter((a) => a.id !== articleVedette?.id);

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
              <span style={{ color: 'white' }}>Actualités</span>
            </div>
            <h1 style={styles.heroTitle}>📰 Actualités Agricoles</h1>
            <p style={styles.heroSub}>
              Restez informé des dernières nouvelles du secteur agricole au Bénin
            </p>

            {/* RECHERCHE */}
            <div style={styles.heroSearch}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher un article..."
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

        {/* CATÉGORIES */}
        <motion.div
          style={styles.categories}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {categoriesData.map((c) => (
            <motion.button
              key={c}
              style={{
                ...styles.catBtn,
                background:  categorie === c ? '#1a5c2a' : 'white',
                color:       categorie === c ? 'white'   : '#374151',
                borderColor: categorie === c ? '#1a5c2a' : '#e5e7eb',
              }}
              onClick={() => setCategorie(c)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {c}
            </motion.button>
          ))}
        </motion.div>

        {/* ===== ARTICLE VEDETTE ===== */}
        <AnimatePresence>
          {articleVedette && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                style={styles.vedette}
                whileHover={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
              >
                {/* IMAGE */}
                <div style={styles.vedetteImgWrap}>
                  <img
                    src={articleVedette.image}
                    alt={articleVedette.titre}
                    style={styles.vedetteImg}
                  />
                  <div style={styles.vedetteOverlay} />
                  <span style={styles.vedetteBadge}>
                    <TrendingUp size={12} /> À la une
                  </span>
                </div>

                {/* CONTENU */}
                <div style={styles.vedetteContent}>
                  <div style={styles.articleMeta}>
                    <span style={{ ...styles.catTag, background: '#f0fdf4', color: '#1a5c2a' }}>
                      <Tag size={12} /> {articleVedette.categorie}
                    </span>
                    <span style={styles.metaItem}>
                      <Calendar size={13} /> {articleVedette.date}
                    </span>
                    <span style={styles.metaItem}>
                      <Clock size={13} /> {articleVedette.lecture} de lecture
                    </span>
                  </div>

                  <h2 style={styles.vedetteTitre}>{articleVedette.titre}</h2>
                  <p style={styles.vedetteExtrait}>{articleVedette.extrait}</p>

                  <div style={styles.vedetteFooter}>
                    <div style={styles.auteurWrap}>
                      <div style={styles.auteurAvatar}>
                        {articleVedette.auteur[0]}
                      </div>
                      <span style={styles.auteurNom}>{articleVedette.auteur}</span>
                    </div>

                    <div style={styles.articleActions}>
                      <motion.button
                        style={styles.actionBtn}
                        onClick={() => toggleLike(articleVedette.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart
                          size={16}
                          color={likes.includes(articleVedette.id) ? '#ef4444' : '#6b7280'}
                          fill={likes.includes(articleVedette.id) ? '#ef4444' : 'transparent'}
                        />
                        <span>{articleVedette.likes + (likes.includes(articleVedette.id) ? 1 : 0)}</span>
                      </motion.button>

                      <motion.button
                        style={styles.actionBtn}
                        onClick={() => toggleBookmark(articleVedette.id)}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Bookmark
                          size={16}
                          color={bookmarks.includes(articleVedette.id) ? '#1a5c2a' : '#6b7280'}
                          fill={bookmarks.includes(articleVedette.id) ? '#1a5c2a' : 'transparent'}
                        />
                      </motion.button>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link to={`/news/${articleVedette.id}`} style={styles.btnLire}>
                          Lire l'article <ArrowRight size={15} />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== GRILLE ARTICLES ===== */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            {categorie === 'Tous' ? 'Tous les articles' : categorie}
          </h2>
          <span style={styles.sectionCount}>
            {autresArticles.length} articles
          </span>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" style={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>Chargement des actualites...</h3>
            </motion.div>
          ) : error ? (
            <motion.div key="error" style={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>{error}</h3>
            </motion.div>
          ) : autresArticles.length === 0 ? (
            <motion.div
              key="empty"
              style={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>Aucun article trouvé</h3>
              <p style={{ color: '#6b7280' }}>Essayez une autre recherche</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="row g-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {autresArticles.map((a, i) => (
                <motion.div
                  key={a.id}
                  className="col-12 col-md-6 col-lg-4"
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.08 }}
                >
                  <ArticleCard
                    article={a}
                    likes={likes}
                    bookmarks={bookmarks}
                    toggleLike={toggleLike}
                    toggleBookmark={toggleBookmark}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// ===== COMPOSANT CARTE ARTICLE =====
function ArticleCard({ article: a, likes, bookmarks, toggleLike, toggleBookmark }) {
  return (
    <motion.div
      style={styles.card}
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
    >
      {/* IMAGE */}
      <div style={styles.cardImgWrap}>
        <img
          src={a.image}
          alt={a.titre}
          style={styles.cardImg}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Article'; }}
        />
        <span style={{ ...styles.catTag, position: 'absolute', top: '10px', left: '10px', background: 'rgba(26,92,42,0.9)', color: 'white' }}>
          {a.categorie}
        </span>
        <motion.button
          style={styles.bookmarkBtn}
          onClick={() => toggleBookmark(a.id)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark
            size={16}
            color={bookmarks.includes(a.id) ? '#1a5c2a' : 'white'}
            fill={bookmarks.includes(a.id) ? '#1a5c2a' : 'transparent'}
          />
        </motion.button>
      </div>

      {/* CONTENU */}
      <div style={{ padding: '1.1rem' }}>
        {/* META */}
        <div style={styles.cardMeta}>
          <span style={styles.metaItem}>
            <Calendar size={12} /> {a.date}
          </span>
          <span style={styles.metaItem}>
            <Clock size={12} /> {a.lecture}
          </span>
        </div>

        {/* TITRE */}
        <h3 style={styles.cardTitre}>{a.titre}</h3>

        {/* EXTRAIT */}
        <p style={styles.cardExtrait}>{a.extrait}</p>

        {/* TAGS */}
        <div style={styles.tagsWrap}>
          {a.tags.map((t) => (
            <span key={t} style={styles.tag}>#{t}</span>
          ))}
        </div>

        {/* FOOTER */}
        <div style={styles.cardFooter}>
          <div style={styles.auteurWrap}>
            <div style={{ ...styles.auteurAvatar, width: '28px', height: '28px', fontSize: '0.75rem' }}>
              {a.auteur[0]}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{a.auteur}</span>
          </div>

          <div style={styles.cardActions}>
            {/* VUES */}
            <span style={styles.metaItem}>
              <Eye size={13} /> {a.vues.toLocaleString()}
            </span>

            {/* LIKE */}
            <motion.button
              style={styles.actionBtn}
              onClick={() => toggleLike(a.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart
                size={14}
                color={likes.includes(a.id) ? '#ef4444' : '#6b7280'}
                fill={likes.includes(a.id) ? '#ef4444' : 'transparent'}
              />
              <span style={{ fontSize: '0.78rem' }}>
                {a.likes + (likes.includes(a.id) ? 1 : 0)}
              </span>
            </motion.button>

            {/* LIRE */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/news/${a.id}`} style={styles.btnLireSm}>
                Lire <ArrowRight size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
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
  },
  heroBreadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' },
  breadLink:      { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle:      { color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '0.4rem' },
  heroSub:        { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  heroSearch:     { display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '14px', padding: '0.75rem 1.2rem', maxWidth: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  heroSearchInput:{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1a2e10', background: 'transparent' },
  clearBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' },

  // CATÉGORIES
  categories: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' },
  catBtn:     { padding: '0.45rem 1.1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },

  // ARTICLE VEDETTE
  vedette:        { background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'row', minHeight: '280px', transition: 'all 0.2s' },
  vedetteImgWrap: { position: 'relative', width: '45%', flexShrink: 0, minHeight: '280px' },
  vedetteImg:     { width: '100%', height: '100%', objectFit: 'cover' },
  vedetteOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, rgba(0,0,0,0.1))' },
  vedetteBadge:   { position: 'absolute', top: '16px', left: '16px', background: '#f0c040', color: '#1a2e10', fontWeight: '700', fontSize: '0.78rem', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' },
  vedetteContent: { padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 },
  vedetteTitre:   { fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: '800', color: '#1a2e10', lineHeight: 1.3, marginBottom: '0.8rem', marginTop: '0.5rem' },
  vedetteExtrait: { fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.65, flex: 1 },
  vedetteFooter:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '1rem' },

  // META
  articleMeta: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  metaItem:    { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#6b7280' },
  catTag:      { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },

  // AUTEUR
  auteurWrap:   { display: 'flex', alignItems: 'center', gap: '8px' },
  auteurAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5c2a, #4db86a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  auteurNom:    { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },

  // ACTIONS
  articleActions: { display: 'flex', alignItems: 'center', gap: '10px' },
  actionBtn:      { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.82rem', padding: '4px' },

  // BOUTONS
  btnLire:   { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a5c2a', color: 'white', padding: '0.55rem 1.2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.88rem' },
  btnLireSm: { display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', color: '#1a5c2a', padding: '0.35rem 0.8rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.78rem' },

  // SECTION
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  sectionTitle:  { fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  sectionCount:  { fontSize: '0.82rem', color: '#6b7280', background: '#f4f6f4', padding: '3px 10px', borderRadius: '20px' },

  // CARTE ARTICLE
  card:        { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column' },
  cardImgWrap: { position: 'relative', height: '190px', overflow: 'hidden' },
  cardImg:     { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  bookmarkBtn: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' },
  cardMeta:    { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.6rem' },
  cardTitre:   { fontSize: '0.97rem', fontWeight: '700', color: '#1a2e10', lineHeight: 1.35, marginBottom: '0.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardExtrait: { fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.55, marginBottom: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },

  // TAGS
  tagsWrap: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.8rem' },
  tag:      { fontSize: '0.72rem', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' },

  // FOOTER CARTE
  cardFooter:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '0.8rem', marginTop: 'auto' },
  cardActions: { display: 'flex', alignItems: 'center', gap: '8px' },

  // EMPTY
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' },
};
