import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Star, Truck,
  CheckCircle, Clock, X, ChevronDown,
  Phone, MessageSquare, ArrowUpRight,
  Shield, AlertTriangle,
} from 'lucide-react';

const VILLES_BENIN = [
  'Toutes', 'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Ouidah',
  'Bohicon', 'Abomey', 'Lokossa', 'Natitingou', 'Djougou',
  'Kandi', 'Parakou', 'Savè', 'Bembèrèkè', 'Nikki', 'Malanville',
];
import TransportService from '../../services/transport.service';

const tris = [
  { label: 'Mieux notés',      value: 'note'     },
  { label: 'Plus de missions', value: 'missions' },
];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  show:   { y: 0,  opacity: 1 },
};

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'TR';

export default function Transporters() {
  const [search,      setSearch]      = useState('');
  const [ville,       setVille]       = useState('Toutes');
  const [statut,      setStatut]      = useState('Tous');
  const [tri,         setTri]         = useState('note');
  const [selected,    setSelected]    = useState(null);
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await TransportService.getTransporters({});
        if (!active) return;
        const items = res.transporteurs || res.results || res || [];
        setData(items.map((u) => ({
          id:           u.id,
          nom:          u.nom_complet || `${u.prenom || ''} ${u.nom || ''}`.trim(),
          localisation: u.ville || 'Bénin',
          zones:        u.transporter_profile?.zones || [],
          note:         Number(u.transporter_profile?.note_moyenne || 0),
          missions:     u.transporter_profile?.total_missions || 0,
          statut:       u.transporter_profile?.est_disponible ? 'Disponible' : 'En mission',
          verifie:      u.transporter_profile?.est_certifie || false,
          telephone:    u.telephone || '',
        })));
      } catch (err) {
        if (active) {
          setError(!err.response
            ? 'Serveur inaccessible. Démarrez le backend Django.'
            : 'Impossible de charger les transporteurs.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const villes = useMemo(() => ['Toutes', ...Array.from(new Set(data.map((t) => t.localisation).filter(Boolean)))], [data]);

  const transporteursFiltres = useMemo(() => {
    let result = [...data];
    if (search)               result = result.filter((t) => t.nom.toLowerCase().includes(search.toLowerCase()) || t.localisation.toLowerCase().includes(search.toLowerCase()));
    if (ville !== 'Toutes')   result = result.filter((t) => t.localisation === ville);
    if (statut === 'Disponible') result = result.filter((t) => t.statut === 'Disponible');
    if (statut === 'En mission') result = result.filter((t) => t.statut === 'En mission');
    if (tri === 'note')       result.sort((a, b) => b.note - a.note);
    if (tri === 'missions')   result.sort((a, b) => b.missions - a.missions);
    return result;
  }, [data, search, ville, statut, tri]);

  return (
    <div style={{ background: '#f8f9f4', minHeight: '100vh' }}>

      {/* ===== HERO ===== */}
      <div style={styles.hero}>
        <div className="container-fluid px-4 px-lg-5">
          <motion.div style={{ textAlign: 'center' }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={styles.heroBreadcrumb}>
              <Link to="/" style={styles.breadLink}>Accueil</Link>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
              <span style={{ color: 'white' }}>Transporteurs</span>
            </div>
            <h1 style={{ ...styles.heroTitle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Truck size={26} /> Transporteurs disponibles</h1>
            <p style={styles.heroSub}>
              {loading ? 'Chargement…' : `${transporteursFiltres.length} transporteur${transporteursFiltres.length !== 1 ? 's' : ''} inscrit${transporteursFiltres.length !== 1 ? 's' : ''}`}
            </p>
            <div style={styles.heroSearch}>
              <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher un transporteur..."
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

      {/* ===== BARRE FILTRES ===== */}
      <div style={styles.filterBar}>
        <div className="container-fluid px-4 px-lg-5">
          <div style={styles.filterRow}>

            {/* Ville */}
            <div style={styles.filterDropWrap}>
              <select value={ville} onChange={(e) => setVille(e.target.value)} style={styles.filterDrop}>
                <option value="Toutes">Ville</option>
                {VILLES_BENIN.filter(v => v !== 'Toutes').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown size={14} color="#6b7280" style={styles.dropIcon} />
            </div>

            {/* Disponibilité */}
            <div style={styles.filterDropWrap}>
              <select value={statut} onChange={(e) => setStatut(e.target.value)} style={styles.filterDrop}>
                <option value="Tous">Disponibilité</option>
                <option value="Disponible">Disponible</option>
                <option value="En mission">En mission</option>
              </select>
              <ChevronDown size={14} color="#6b7280" style={styles.dropIcon} />
            </div>

            <span style={styles.resultCount}>
              {transporteursFiltres.length} transporteur{transporteursFiltres.length !== 1 ? 's' : ''} trouvé{transporteursFiltres.length !== 1 ? 's' : ''}
            </span>

            {/* Tri */}
            <div style={{ marginLeft: 'auto' }}>
              <div style={styles.filterDropWrap}>
                <select value={tri} onChange={(e) => setTri(e.target.value)} style={styles.filterDrop}>
                  {tris.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={14} color="#6b7280" style={styles.dropIcon} />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="container-fluid px-4 px-lg-5 py-4">

        {/* ===== CONTENU ===== */}
        {loading ? (
          <div className="row g-4">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className="col-12 col-md-6 col-lg-4">
                <div style={{ height: '280px', background: '#f3f4f6', borderRadius: '18px' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={styles.emptyState}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}><AlertTriangle size={40} color="#F59E0B" /></div>
            <h3 style={{ color: '#1a2e10' }}>{error}</h3>
            <button onClick={() => window.location.reload()} style={styles.btnRetry}>Réessayer</button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {transporteursFiltres.length === 0 ? (
              <motion.div key="empty" style={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Truck size={48} color="#d1d5db" />
                <h3 style={{ color: '#1a2e10', marginTop: '1rem' }}>
                  {data.length === 0 ? 'Aucun transporteur inscrit pour le moment' : 'Aucun transporteur ne correspond à votre recherche'}
                </h3>
                <p style={{ color: '#6b7280' }}>
                  {data.length === 0
                    ? 'Les transporteurs qui s\'inscrivent apparaissent ici automatiquement.'
                    : 'Essayez de modifier vos filtres.'}
                </p>
                {data.length === 0 && (
                  <Link to="/auth/register?role=TRANSPORTER" style={styles.btnJoin}>
                    Devenir transporteur
                  </Link>
                )}
              </motion.div>
            ) : (
              <motion.div key="grid" className="row g-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {transporteursFiltres.map((t, i) => (
                  <motion.div key={t.id} className="col-12 col-md-6 col-lg-4" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.06 }}>
                    <motion.div style={styles.card} whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>

                      {/* HEADER */}
                      <div style={styles.cardHeader}>
                        <div style={styles.avatarWrap}>
                          <div style={styles.initialsAvatar}>{getInitials(t.nom)}</div>
                          {t.verifie && (
                            <div style={styles.verifieBadge}>
                              <CheckCircle size={14} color="white" fill="#1a5c2a" />
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={styles.nomWrap}>
                            <h3 style={styles.nom}>{t.nom}</h3>
                            {t.verifie && <span style={styles.verifiePill}><Shield size={11} /> Vérifié</span>}
                          </div>
                          <div style={styles.noteWrap}>
                            <Star size={14} color="#f0c040" fill={t.note > 0 ? '#f0c040' : 'transparent'} />
                            <strong style={styles.noteVal}>{t.note > 0 ? t.note.toFixed(1) : '—'}</strong>
                            <span style={styles.avisCount}>• {t.missions} mission{t.missions !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <span style={{
                          ...styles.statutPill,
                          background: t.statut === 'Disponible' ? '#dcfce7' : '#fef3c7',
                          color:      t.statut === 'Disponible' ? '#16a34a' : '#d97706',
                        }}>
                          {t.statut === 'Disponible' ? <CheckCircle size={11} /> : <Clock size={11} />}
                          {t.statut}
                        </span>
                      </div>

                      {/* INFOS */}
                      <div style={styles.cardBody}>
                        <div style={styles.infoRow}>
                          <MapPin size={14} color="#6b7280" />
                          <span>{t.localisation}</span>
                        </div>
                        {t.zones.length > 0 && (
                          <div style={styles.zonesWrap}>
                            {t.zones.slice(0, 3).map((z, idx) => (
                              <span key={idx} style={styles.zoneTag}>{z}</span>
                            ))}
                            {t.zones.length > 3 && <span style={styles.zoneTag}>+{t.zones.length - 3}</span>}
                          </div>
                        )}
                      </div>

                      {/* FOOTER */}
                      <div style={styles.cardFooter}>
                        <motion.button
                          style={styles.btnVoir}
                          onClick={() => setSelected(t)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowUpRight size={15} />
                          Voir profil
                        </motion.button>
                        <Link to={`/auth/login`} style={{ textDecoration: 'none' }}>
                          <motion.button
                            style={{ ...styles.btnContacter, opacity: t.statut === 'Indisponible' ? 0.5 : 1 }}
                            disabled={t.statut === 'Indisponible'}
                            whileHover={{ scale: t.statut !== 'Indisponible' ? 1.05 : 1 }}
                            whileTap={{ scale: t.statut !== 'Indisponible' ? 0.95 : 1 }}
                          >
                            <MessageSquare size={15} />
                            Contacter
                          </motion.button>
                        </Link>
                      </div>

                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </div>

      {/* ===== MODAL DÉTAIL ===== */}
      <AnimatePresence>
        {selected && (
          <motion.div style={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div style={styles.modal} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.3 }}>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}><X size={20} color="#6b7280" /></button>

              <div style={styles.modalHeader}>
                <div style={styles.modalInitialsAvatar}>{getInitials(selected.nom)}</div>
                <div>
                  <div style={styles.nomWrap}>
                    <h2 style={{ ...styles.nom, fontSize: '1.3rem' }}>{selected.nom}</h2>
                    {selected.verifie && <span style={styles.verifiePill}><Shield size={11} /> Vérifié</span>}
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

              <div style={styles.modalStats}>
                <div style={styles.modalStat}>
                  <div style={styles.modalStatVal}>{selected.note > 0 ? selected.note.toFixed(1) : '—'}</div>
                  <div style={styles.modalStatLabel}>Note</div>
                </div>
                <div style={styles.modalStat}>
                  <div style={styles.modalStatVal}>{selected.missions}</div>
                  <div style={styles.modalStatLabel}>Missions</div>
                </div>
                <div style={styles.modalStat}>
                  <div style={styles.modalStatVal}>{selected.zones.length}</div>
                  <div style={styles.modalStatLabel}>Zones</div>
                </div>
              </div>

              <div style={styles.modalInfoRow}>
                <MapPin size={16} color="#1a5c2a" />
                <span>{selected.localisation}</span>
              </div>

              {selected.zones.length > 0 && (
                <div style={{ margin: '1rem 0' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#6b7280', marginBottom: '8px' }}>ZONES COUVERTES</p>
                  <div style={styles.zonesWrap}>
                    {selected.zones.map((z, i) => <span key={i} style={styles.zoneTag}>{z}</span>)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '1.2rem' }}>
                {selected.telephone && (
                  <a href={`tel:${selected.telephone}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <motion.button style={styles.modalBtnPhone} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Phone size={16} /> Appeler
                    </motion.button>
                  </a>
                )}
                <Link to="/auth/login" style={{ flex: 2, textDecoration: 'none' }}>
                  <motion.button style={styles.modalBtnMsg} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <MessageSquare size={16} /> Contacter (connexion requise)
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ===== STYLES =====
const styles = {
  hero:           { background: 'linear-gradient(135deg, #0d2b14 0%, #1a5c2a 60%, #2d8c47 100%)', padding: '2.5rem 0 2rem' },
  heroBreadcrumb: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.6)' },
  breadLink:      { color: 'rgba(255,255,255,0.6)', textDecoration: 'none' },
  heroTitle:      { color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', margin: '0 0 0.3rem', textAlign: 'center' },
  heroSub:        { color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: '0 0 1.4rem', textAlign: 'center' },
  heroSearch:     { display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '14px', padding: '0.8rem 1.4rem', maxWidth: '520px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  heroSearchInput:{ flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', color: '#1a2e10', background: 'transparent' },
  clearBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' },
  filterBar:      { background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' },
  filterRow:      { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  filterDropWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  filterDrop:     { padding: '0.5rem 2rem 0.5rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none', appearance: 'none' },
  dropIcon:       { position: 'absolute', right: '8px', pointerEvents: 'none' },
  resultCount:    { fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'nowrap' },
  card:           { background: 'white', borderRadius: '18px', padding: '1.3rem', border: '1px solid #e5e7eb', transition: 'all 0.2s', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader:     { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatarWrap:     { position: 'relative', flexShrink: 0 },
  initialsAvatar: { width: '64px', height: '64px', borderRadius: '50%', background: '#eef7ef', color: '#1a5c2a', border: '2px solid #f0c040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem' },
  verifieBadge:   { position: 'absolute', bottom: 0, right: 0, background: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' },
  nomWrap:        { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  nom:            { fontSize: '1rem', fontWeight: '800', color: '#1a2e10', margin: 0 },
  verifiePill:    { display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f0fdf4', color: '#1a5c2a', fontSize: '0.7rem', fontWeight: '700', padding: '2px 7px', borderRadius: '10px' },
  noteWrap:       { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' },
  noteVal:        { fontSize: '0.88rem', color: '#1a2e10' },
  avisCount:      { fontSize: '0.75rem', color: '#6b7280' },
  statutPill:     { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 },
  cardBody:       { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  infoRow:        { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.83rem', color: '#374151' },
  zonesWrap:      { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  zoneTag:        { background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: '600', padding: '3px 10px', borderRadius: '10px' },
  cardFooter:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f0f0f0', marginTop: 'auto' },
  btnVoir:        { display: 'flex', alignItems: 'center', gap: '5px', background: '#f4f6f4', border: 'none', borderRadius: '10px', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', color: '#374151' },
  btnContacter:   { display: 'flex', alignItems: 'center', gap: '5px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '10px', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' },
  emptyState:     { textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '16px', border: '1.5px dashed #e5e7eb' },
  btnRetry:       { marginTop: '1rem', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: '600', cursor: 'pointer' },
  btnJoin:        { display: 'inline-block', marginTop: '1rem', background: '#1a5c2a', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '20px', textDecoration: 'none', fontWeight: '600' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal:          { background: 'white', width: '92%', maxWidth: '500px', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '95vh', overflowY: 'auto', position: 'relative' },
  closeBtn:       { position: 'absolute', top: '1rem', right: '1rem', background: '#f4f6f4', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  modalHeader:    { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '1.5rem' },
  modalInitialsAvatar: { width: '80px', height: '80px', borderRadius: '50%', background: '#eef7ef', color: '#1a5c2a', border: '3px solid #f0c040', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' },
  modalStats:     { display: 'flex', marginBottom: '1.2rem', background: '#f9fafb', borderRadius: '14px', overflow: 'hidden' },
  modalStat:      { flex: 1, textAlign: 'center', padding: '1rem 0.5rem', borderRight: '1px solid #e5e7eb' },
  modalStatVal:   { fontSize: '1.1rem', fontWeight: '800', color: '#1a2e10' },
  modalStatLabel: { fontSize: '0.72rem', color: '#6b7280', fontWeight: '500', marginTop: '2px' },
  modalInfoRow:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
  modalBtnPhone:  { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f0fdf4', color: '#1a5c2a', border: '1.5px solid #86efac', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  modalBtnMsg:    { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
};
