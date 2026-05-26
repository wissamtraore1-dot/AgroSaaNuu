import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Star, Truck,
  CheckCircle, Clock, X, Filter,
  Phone, MessageSquare, ArrowUpRight,
  Shield, Award, ChevronDown
} from 'lucide-react';

// ===== MOCK DATA =====
const transporteurs = [
  {
    id: 1,
    nom:          'Moussa Traoré',
    avatar:       'https://i.pravatar.cc/120?img=11',
    vehicule:     'Camion 10t',
    immat:        'BJ-1234-AB',
    note:         4.9,
    avis:         127,
    missions:     234,
    localisation: 'Cotonou',
    zones:        ['Cotonou', 'Porto-Novo', 'Abomey'],
    statut:       'Disponible',
    tarif:        '15 000',
    experience:   '5 ans',
    verifie:      true,
    specialite:   'Céréales en vrac',
  },
  {
    id: 2,
    nom:          'Kofi Amegah',
    avatar:       'https://i.pravatar.cc/120?img=12',
    vehicule:     'Camion 5t',
    immat:        'BJ-5678-CD',
    note:         4.6,
    avis:         89,
    missions:     156,
    localisation: 'Parakou',
    zones:        ['Parakou', 'Nikki', 'Kandi'],
    statut:       'Disponible',
    tarif:        '10 000',
    experience:   '3 ans',
    verifie:      true,
    specialite:   'Transport longue distance',
  },
  {
    id: 3,
    nom:          'Sèna Bello',
    avatar:       'https://i.pravatar.cc/120?img=13',
    vehicule:     'Pick-up 2t',
    immat:        'BJ-9012-EF',
    note:         4.4,
    avis:         54,
    missions:     98,
    localisation: 'Natitingou',
    zones:        ['Natitingou', 'Djougou', 'Tanguiéta'],
    statut:       'En mission',
    tarif:        '8 000',
    experience:   '2 ans',
    verifie:      true,
    specialite:   'Zones rurales',
  },
  {
    id: 4,
    nom:          'Yao Dossou',
    avatar:       'https://i.pravatar.cc/120?img=14',
    vehicule:     'Camion 15t',
    immat:        'BJ-3456-GH',
    note:         4.8,
    avis:         203,
    missions:     412,
    localisation: 'Abomey-Calavi',
    zones:        ['Cotonou', 'Abomey-Calavi', 'Ouidah', 'Bohicon'],
    statut:       'Disponible',
    tarif:        '20 000',
    experience:   '8 ans',
    verifie:      true,
    specialite:   'Grands volumes',
  },
  {
    id: 5,
    nom:          'Afi Kossou',
    avatar:       'https://i.pravatar.cc/120?img=15',
    vehicule:     'Camion 8t',
    immat:        'BJ-7890-IJ',
    note:         4.5,
    avis:         76,
    missions:     143,
    localisation: 'Porto-Novo',
    zones:        ['Porto-Novo', 'Cotonou', 'Sakété'],
    statut:       'Disponible',
    tarif:        '12 000',
    experience:   '4 ans',
    verifie:      false,
    specialite:   'Livraison express',
  },
  {
    id: 6,
    nom:          'Brice Houngbo',
    avatar:       'https://i.pravatar.cc/120?img=16',
    vehicule:     'Camion 10t',
    immat:        'BJ-2345-KL',
    note:         4.3,
    avis:         41,
    missions:     87,
    localisation: 'Bohicon',
    zones:        ['Bohicon', 'Abomey', 'Zagnanado'],
    statut:       'Indisponible',
    tarif:        '14 000',
    experience:   '3 ans',
    verifie:      true,
    specialite:   'Centre Bénin',
  },
];

const villes    = ['Toutes', 'Cotonou', 'Parakou', 'Natitingou', 'Abomey-Calavi', 'Porto-Novo', 'Bohicon'];
const vehicules = ['Tous', 'Pick-up 2t', 'Camion 5t', 'Camion 8t', 'Camion 10t', 'Camion 15t'];
const tris      = [
  { label: 'Mieux notés',     value: 'note'     },
  { label: 'Plus de missions',value: 'missions' },
  { label: 'Tarif croissant', value: 'tarif_asc'},
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

export default function Transporters() {
  const [search,     setSearch]     = useState('');
  const [ville,      setVille]      = useState('Toutes');
  const [vehicule,   setVehicule]   = useState('Tous');
  const [statut,     setStatut]     = useState('Tous');
  const [tri,        setTri]        = useState('note');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected,   setSelected]   = useState(null);

  const transporteursFiltres = useMemo(() => {
    let result = [...transporteurs];
    if (search)            result = result.filter((t) => t.nom.toLowerCase().includes(search.toLowerCase()) || t.localisation.toLowerCase().includes(search.toLowerCase()));
    if (ville !== 'Toutes')   result = result.filter((t) => t.localisation === ville);
    if (vehicule !== 'Tous')  result = result.filter((t) => t.vehicule === vehicule);
    if (statut === 'Disponible')   result = result.filter((t) => t.statut === 'Disponible');
    if (statut === 'En mission')   result = result.filter((t) => t.statut === 'En mission');
    if (tri === 'note')      result.sort((a, b) => b.note - a.note);
    if (tri === 'missions')  result.sort((a, b) => b.missions - a.missions);
    if (tri === 'tarif_asc') result.sort((a, b) => Number(a.tarif.replace(/\s/g, '')) - Number(b.tarif.replace(/\s/g, '')));
    return result;
  }, [search, ville, vehicule, statut, tri]);

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
              <span style={{ color: 'white' }}>Transporteurs</span>
            </div>
            <h1 style={styles.heroTitle}>🚚 Transporteurs disponibles</h1>
            <p style={styles.heroSub}>
              {transporteursFiltres.length} transporteurs vérifiés au Bénin
            </p>

            {/* RECHERCHE */}
            <div style={styles.heroSearch}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher un transporteur, une ville..."
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

        {/* ===== BARRE FILTRES ===== */}
        <motion.div
          style={styles.filtersBar}
          className="mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* STATUT */}
          <div style={styles.statutBtns}>
            {['Tous', 'Disponible', 'En mission'].map((s) => (
              <motion.button
                key={s}
                style={{
                  ...styles.statutBtn,
                  background:  statut === s ? '#1a5c2a' : 'white',
                  color:       statut === s ? 'white'   : '#374151',
                  borderColor: statut === s ? '#1a5c2a' : '#e5e7eb',
                }}
                onClick={() => setStatut(s)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {s === 'Disponible' && <span style={{ color: statut === s ? 'white' : '#16a34a' }}>●</span>}
                {s === 'En mission' && <span style={{ color: statut === s ? 'white' : '#d97706' }}>●</span>}
                {s}
              </motion.button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* VILLE */}
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            style={styles.filterSelect}
          >
            {villes.map((v) => <option key={v}>{v}</option>)}
          </select>

          {/* VÉHICULE */}
          <select
            value={vehicule}
            onChange={(e) => setVehicule(e.target.value)}
            style={styles.filterSelect}
          >
            {vehicules.map((v) => <option key={v}>{v}</option>)}
          </select>

          {/* TRI */}
          <select
            value={tri}
            onChange={(e) => setTri(e.target.value)}
            style={styles.filterSelect}
          >
            {tris.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

        </motion.div>

        {/* ===== GRILLE TRANSPORTEURS ===== */}
        <AnimatePresence mode="wait">
          {transporteursFiltres.length === 0 ? (
            <motion.div
              key="empty"
              style={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <h3 style={{ color: '#1a2e10', marginBottom: '0.5rem' }}>Aucun transporteur trouvé</h3>
              <p style={{ color: '#6b7280' }}>Essayez de modifier vos filtres</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="row g-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {transporteursFiltres.map((t, i) => (
                <motion.div
                  key={t.id}
                  className="col-12 col-md-6 col-lg-4"
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.08 }}
                >
                  <motion.div
                    style={styles.card}
                    whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
                  >
                    {/* HEADER CARTE */}
                    <div style={styles.cardHeader}>
                      <div style={styles.avatarWrap}>
                        <img
                          src={t.avatar}
                          alt={t.nom}
                          style={styles.avatar}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                        />
                        {t.verifie && (
                          <div style={styles.verifieBadge}>
                            <CheckCircle size={14} color="white" fill="#1a5c2a" />
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={styles.nomWrap}>
                          <h3 style={styles.nom}>{t.nom}</h3>
                          {t.verifie && (
                            <span style={styles.verifiePill}>
                              <Shield size={11} /> Vérifié
                            </span>
                          )}
                        </div>

                        <div style={styles.vehiculeInfo}>
                          <Truck size={14} color="#6b7280" />
                          <span>{t.vehicule}</span>
                          <span style={styles.immat}>{t.immat}</span>
                        </div>

                        <div style={styles.noteWrap}>
                          <Star size={14} color="#f0c040" fill="#f0c040" />
                          <strong style={styles.noteVal}>{t.note}</strong>
                          <span style={styles.avisCount}>({t.avis} avis)</span>
                        </div>
                      </div>

                      {/* STATUT */}
                      <span style={{
                        ...styles.statutPill,
                        background: t.statut === 'Disponible'  ? '#dcfce7'
                          : t.statut === 'En mission' ? '#fef3c7' : '#fee2e2',
                        color: t.statut === 'Disponible'  ? '#16a34a'
                          : t.statut === 'En mission' ? '#d97706' : '#dc2626',
                      }}>
                        {t.statut === 'Disponible'  && <CheckCircle size={11} />}
                        {t.statut === 'En mission'  && <Clock        size={11} />}
                        {t.statut}
                      </span>
                    </div>

                    {/* INFOS */}
                    <div style={styles.cardBody}>
                      <div style={styles.infoRow}>
                        <MapPin size={14} color="#6b7280" />
                        <span>{t.localisation}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <Award size={14} color="#6b7280" />
                        <span>{t.experience} d'expérience • {t.missions} missions</span>
                      </div>
                      <div style={styles.infoRow}>
                        <Truck size={14} color="#6b7280" />
                        <span style={{ fontSize: '0.78rem' }}>{t.specialite}</span>
                      </div>
                    </div>

                    {/* ZONES */}
                    <div style={styles.zonesWrap}>
                      {t.zones.map((z) => (
                        <span key={z} style={styles.zoneTag}>{z}</span>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div style={styles.cardFooter}>
                      <div>
                        <div style={styles.tarifLabel}>Tarif/jour</div>
                        <div style={styles.tarifVal}>{t.tarif} FCFA</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button
                          style={styles.btnVoir}
                          onClick={() => setSelected(t)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowUpRight size={15} />
                          Voir
                        </motion.button>
                        <motion.button
                          style={{
                            ...styles.btnContacter,
                            opacity: t.statut === 'Indisponible' ? 0.5 : 1,
                            cursor:  t.statut === 'Indisponible' ? 'not-allowed' : 'pointer',
                          }}
                          disabled={t.statut === 'Indisponible'}
                          whileHover={{ scale: t.statut !== 'Indisponible' ? 1.05 : 1 }}
                          whileTap={{ scale: t.statut !== 'Indisponible' ? 0.95 : 1 }}
                        >
                          <MessageSquare size={15} />
                          Contacter
                        </motion.button>
                      </div>
                    </div>

                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ===== MODAL DÉTAIL ===== */}
      <AnimatePresence>
        {selected && (
         <>
         <motion.div
           style={styles.overlay}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={() => setSelected(null)}
         >
       
           <motion.div
             style={styles.modal}
             onClick={(e) => e.stopPropagation()}
             initial={{ scale: 0.85, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.85, opacity: 0 }}
             transition={{ duration: 0.3 }}
           >
              {/* CLOSE */}
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>
                <X size={20} color="#6b7280" />
              </button>

              {/* PROFIL */}
              <div style={styles.modalHeader}>
                <img src={selected.avatar} alt={selected.nom} style={styles.modalAvatar} />
                <div>
                  <div style={styles.nomWrap}>
                    <h2 style={{ ...styles.nom, fontSize: '1.3rem' }}>{selected.nom}</h2>
                    {selected.verifie && (
                      <span style={styles.verifiePill}>
                        <Shield size={11} /> Vérifié
                      </span>
                    )}
                  </div>
                  <div style={styles.noteWrap}>
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={16} color="#f0c040" fill={n <= selected.note ? '#f0c040' : 'transparent'} />
                    ))}
                    <strong style={styles.noteVal}>{selected.note}</strong>
                    <span style={styles.avisCount}>({selected.avis} avis)</span>
                  </div>
                  <span style={{
                    ...styles.statutPill,
                    background: selected.statut === 'Disponible' ? '#dcfce7' : '#fef3c7',
                    color:      selected.statut === 'Disponible' ? '#16a34a' : '#d97706',
                  }}>
                    {selected.statut}
                  </span>
                </div>
              </div>

              {/* STATS */}
              <div style={styles.modalStats}>
                {[
                  { label: 'Missions',    value: selected.missions   },
                  { label: 'Expérience',  value: selected.experience },
                  { label: 'Tarif/jour',  value: `${selected.tarif} FCFA` },
                ].map((s, i) => (
                  <div key={i} style={styles.modalStat}>
                    <div style={styles.modalStatVal}>{s.value}</div>
                    <div style={styles.modalStatLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* INFOS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
                {[
                  { icon: Truck,   val: `${selected.vehicule} — ${selected.immat}` },
                  { icon: MapPin,  val: selected.localisation },
                  { icon: Award,   val: selected.specialite },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={styles.modalInfoRow}>
                      <Icon size={16} color="#1a5c2a" />
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>{item.val}</span>
                    </div>
                  );
                })}
              </div>

              {/* ZONES */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#6b7280', marginBottom: '8px' }}>
                  ZONES COUVERTES
                </p>
                <div style={styles.zonesWrap}>
                  {selected.zones.map((z) => (
                    <span key={z} style={styles.zoneTag}>{z}</span>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                  style={styles.modalBtnPhone}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Phone size={16} />
                  Appeler
                </motion.button>
                <motion.button
                  style={styles.modalBtnMsg}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <MessageSquare size={16} />
                  Envoyer un message
                </motion.button>
              </div>

            </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// ===== STYLES =====
const styles = {
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

  // FILTRES
  filtersBar:  { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb' },
  statutBtns:  { display: 'flex', gap: '6px' },
  statutBtn:   { display: 'flex', alignItems: 'center', gap: '5px', padding: '0.45rem 1rem', borderRadius: '20px', border: '1.5px solid', fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: 'none' },
  filterSelect:{ padding: '0.5rem 0.8rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', background: 'white', cursor: 'pointer' },

  // CARTE
  card:       { background: 'white', borderRadius: '18px', padding: '1.3rem', border: '1px solid #e5e7eb', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar:     { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0c040' },
  verifieBadge:{ position: 'absolute', bottom: 0, right: 0, background: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' },
  nomWrap:    { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  nom:        { fontSize: '1rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  verifiePill:{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f0fdf4', color: '#1a5c2a', fontSize: '0.7rem', fontWeight: '700', padding: '2px 7px', borderRadius: '10px' },
  vehiculeInfo:{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#6b7280', margin: '3px 0' },
  immat:      { background: '#f4f6f4', padding: '1px 6px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '600' },
  noteWrap:   { display: 'flex', alignItems: 'center', gap: '4px' },
  noteVal:    { fontSize: '0.88rem', color: '#1a2e10' },
  avisCount:  { fontSize: '0.75rem', color: '#6b7280' },
  statutPill: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 },

  cardBody:   { display: 'flex', flexDirection: 'column', gap: '7px' },
  infoRow:    { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.83rem', color: '#374151' },

  zonesWrap:  { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  zoneTag:    { background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: '600', padding: '3px 10px', borderRadius: '10px' },

  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f0f0f0' },
  tarifLabel: { fontSize: '0.72rem', color: '#6b7280', fontWeight: '600' },
  tarifVal:   { fontSize: '1rem', fontWeight: '800', color: '#1a5c2a' },
  btnVoir:    { display: 'flex', alignItems: 'center', gap: '5px', background: '#f4f6f4', border: 'none', borderRadius: '10px', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', color: '#374151' },
  btnContacter:{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' },

  // EMPTY
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' },

  // MODAL
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',},
  modal: { background: 'white', width: '92%', maxWidth: '500px', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '95vh', overflowY: 'auto', position: 'relative',},
  closeBtn:   { position: 'absolute', top: '1rem', right: '1rem', background: '#f4f6f4', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  modalHeader:{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '1.5rem' },
  modalAvatar:{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f0c040', flexShrink: 0 },
  modalStats: { display: 'flex', gap: '0', marginBottom: '1.2rem', background: '#f9fafb', borderRadius: '14px', overflow: 'hidden' },
  modalStat:  { flex: 1, textAlign: 'center', padding: '1rem 0.5rem', borderRight: '1px solid #e5e7eb' },
  modalStatVal:{ fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' },
  modalStatLabel:{ fontSize: '0.72rem', color: '#6b7280', fontWeight: '500', marginTop: '2px' },
  modalInfoRow:{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
  modalBtnPhone:{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f0fdf4', color: '#1a5c2a', border: '1.5px solid #86efac', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  modalBtnMsg:  { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
};