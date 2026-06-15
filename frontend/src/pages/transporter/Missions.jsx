import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, MapPin, CheckCircle, Navigation,
  Clock, XCircle, Loader, Play, ThumbsDown, ThumbsUp,
  AlertCircle, Package, User, Phone, Truck, ChevronDown, ChevronUp,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import TransportService from '../../services/transport.service';
import { useAuth } from '../../context/AuthContext';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'Nouvelle mission',  bg: '#fef3c7', color: '#d97706', icon: Clock       },
  ACCEPTEE:   { label: 'Acceptée',          bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  EN_COURS:   { label: 'En cours',          bg: '#ede9fe', color: '#7c3aed', icon: Truck       },
  TERMINEE:   { label: 'Livrée',            bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:    { label: 'Annulée',           bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const TABS = [
  { value: null,        label: 'Toutes'     },
  { value: 'EN_ATTENTE', label: 'Nouvelles' },
  { value: 'ACCEPTEE',  label: 'Acceptées'  },
  { value: 'EN_COURS',  label: 'En cours'   },
  { value: 'TERMINEE',  label: 'Terminées'  },
];

const ORANGE = '#d97706';
const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function Missions() {
  const { user }  = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState(null);
  const [actif,       setActif]       = useState(null);
  const [expanded,    setExpanded]    = useState({});
  const [msg,         setMsg]         = useState({ type: '', text: '' });

  // Panneau délai — id de la mission en cours de saisie
  const [delaiPanel,  setDelaiPanel]  = useState(null);
  const [delaiJours,  setDelaiJours]  = useState('');
  const [delaiUnite,  setDelaiUnite]  = useState('JOURS'); // HEURES | JOURS | MOIS

  useEffect(() => { charger(); }, [tab]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await TransportService.getMyMissions({ status: tab || '' });
      setMissions(data.results || data || []);
    } finally {
      setLoading(false);
    }
  };

  const notif = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const UNITES = [
    { value: 'HEURES', label: 'Heure(s)', max: 168 },
    { value: 'JOURS',  label: 'Jour(s)',  max: 365 },
    { value: 'MOIS',   label: 'Mois',     max: 12  },
  ];

  const uniteLabel = (unite, val) => {
    if (unite === 'HEURES') return `${val} heure${val > 1 ? 's' : ''}`;
    if (unite === 'MOIS')   return `${val} mois`;
    return `${val} jour${val > 1 ? 's' : ''}`;
  };

  const uniteBadge = (unite) => {
    if (unite === 'HEURES') return 'h';
    if (unite === 'MOIS')   return 'mois';
    return 'j';
  };

  const ouvrirDelaiPanel = (id) => {
    setDelaiPanel(id);
    setDelaiJours('');
    setDelaiUnite('JOURS');
  };

  const handleAccepter = async (id) => {
    const val = parseInt(delaiJours, 10);
    const maxUnite = UNITES.find(u => u.value === delaiUnite)?.max || 365;
    if (!delaiJours || isNaN(val) || val < 1) {
      notif('error', 'Indiquez un délai valide (minimum 1).');
      return;
    }
    if (val > maxUnite) {
      notif('error', `Délai maximum : ${maxUnite} ${UNITES.find(u => u.value === delaiUnite)?.label}.`);
      return;
    }
    setActif(id);
    try {
      await TransportService.acceptMission(id, val, delaiUnite);
      setDelaiPanel(null);
      notif('success', `Mission acceptée — délai annoncé : ${uniteLabel(delaiUnite, val)}.`);
      charger();
    } catch (e) {
      notif('error', e.response?.data?.message || "Impossible d'accepter la mission.");
    } finally { setActif(null); }
  };

  const handleRefuser = async (id) => {
    setActif(id);
    try {
      await TransportService.declineMission(id);
      notif('info', 'Mission refusée.');
      charger();
    } catch {
      notif('error', 'Impossible de refuser la mission.');
    } finally { setActif(null); }
  };

  const handleDemarrer = async (id) => {
    setActif(id);
    try {
      await TransportService.demarrerMission(id);
      notif('success', 'Prise en charge confirmée — livraison en cours.');
      charger();
    } catch (e) {
      notif('error', e.response?.data?.message || 'Impossible de démarrer la mission.');
    } finally { setActif(null); }
  };

  const handleTerminer = async (id) => {
    setActif(id);
    try {
      const res = await TransportService.terminerMission(id);
      notif('success', res.message || 'Livraison confirmée !');
      charger();
    } catch (e) {
      notif('error', e.response?.data?.message || 'Impossible de confirmer la livraison.');
    } finally { setActif(null); }
  };

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={22} color={ORANGE} /> Mes missions
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Gérez vos livraisons en cours et à venir
          </p>
        </motion.div>

        {/* NOTIFICATION */}
        <AnimatePresence>
          {msg.text && (
            <motion.div key="msg" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', gap: '8px', borderRadius: '10px', padding: '0.7rem 1rem',
                marginBottom: '1rem', fontSize: '0.84rem', alignItems: 'center',
                background:   msg.type === 'success' ? '#f0fdf4' : msg.type === 'error' ? '#fef2f2' : '#eff6ff',
                border:       `1px solid ${msg.type === 'success' ? '#bbf7d0' : msg.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
                color:        msg.type === 'success' ? '#16a34a' : msg.type === 'error' ? '#dc2626' : '#2563eb',
              }}
            >
              {msg.type === 'success' ? <CheckCircle size={15} /> : msg.type === 'error' ? <AlertCircle size={15} /> : <AlertCircle size={15} />}
              <span>{msg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <motion.button key={String(t.value)} onClick={() => setTab(t.value)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', border: '1.5px solid',
                fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                background:  tab === t.value ? ORANGE  : 'white',
                color:       tab === t.value ? 'white' : '#374151',
                borderColor: tab === t.value ? ORANGE  : '#e5e7eb',
              }}
              whileTap={{ scale: 0.97 }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* LISTE */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: '140px', borderRadius: '16px', background: '#f3f4f6' }} />
            ))}
          </div>

        ) : missions.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}
          >
            <Package size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>
              Aucune mission{tab ? ' dans cette catégorie' : ''}
            </p>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {missions.map((m, i) => {
              const statut   = m.statut || m.status || 'EN_ATTENTE';
              const cfg      = STATUT_CONFIG[statut] || STATUT_CONFIG.EN_ATTENTE;
              const Icon     = cfg.icon;
              const enAction = actif === m.id;
              const open     = !!expanded[m.id];

              const tarif      = Number(m.tarif || 0);
              const depart     = m.ville_depart  || '—';
              const arrivee    = m.ville_arrivee || '—';
              const montant    = Number(m.commande_montant || 0);

              return (
                <motion.div key={m.id || i} variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: 'white', borderRadius: '16px',
                    border: `1.5px solid ${statut === 'EN_ATTENTE' ? '#fcd34d' : '#e5e7eb'}`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
                  }}
                >
                  {/* ── HEADER CARTE ── */}
                  <div style={{ padding: '1.1rem 1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#1a2e10' }}>
                          {m.commande_ref || `Mission #${String(m.id).slice(0, 8).toUpperCase()}`}
                        </span>
                        <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>{fmt(m.created_at)}</span>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>

                    {/* Produit */}
                    {m.produit_nom && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#374151', marginBottom: '6px' }}>
                        <Package size={13} color="#9ca3af" />
                        <span style={{ fontWeight: '600' }}>{m.produit_nom}</span>
                      </div>
                    )}

                    {/* Trajet */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#374151', marginBottom: '6px' }}>
                      <MapPin size={13} color="#9ca3af" />
                      <span style={{ fontWeight: '600' }}>{depart}</span>
                      <span style={{ color: ORANGE, fontWeight: '700' }}>→</span>
                      <span style={{ fontWeight: '600' }}>{arrivee}</span>
                    </div>

                    {/* Montant + tarif + délai */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                      {montant > 0 && (
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                          Commande : <strong>{montant.toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      )}
                      {m.delai_livraison_jours && statut !== 'EN_ATTENTE' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '2px 9px', borderRadius: '20px', background: '#fef3c7', color: '#d97706' }}>
                          <Clock size={11} /> {m.delai_livraison_jours} {uniteBadge(m.delai_livraison_unite || 'JOURS')} max
                        </span>
                      )}
                    </div>

                    {/* ── ACTIONS ── */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {statut === 'EN_ATTENTE' && (
                        <>
                          {delaiPanel !== m.id && (
                            <motion.button onClick={() => ouvrirDelaiPanel(m.id)} disabled={enAction}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.55rem 1.2rem', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <ThumbsUp size={13} /> Accepter
                            </motion.button>
                          )}
                          <motion.button onClick={() => handleRefuser(m.id)} disabled={enAction}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.55rem 1.2rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <ThumbsDown size={13} /> Refuser
                          </motion.button>
                        </>
                      )}

                      {statut === 'ACCEPTEE' && (
                        <motion.button onClick={() => handleDemarrer(m.id)} disabled={enAction}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1, boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {enAction ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Truck size={13} />}
                          J'ai récupéré la marchandise
                        </motion.button>
                      )}

                      {statut === 'EN_COURS' && (
                        <motion.button onClick={() => handleTerminer(m.id)} disabled={enAction}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.4rem', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', cursor: enAction ? 'not-allowed' : 'pointer', opacity: enAction ? 0.7 : 1, boxShadow: '0 3px 10px rgba(26,92,42,0.3)' }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {enAction ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                          Confirmer la livraison
                        </motion.button>
                      )}

                      {statut === 'TERMINEE' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#16a34a', fontWeight: '700' }}>
                          <Sparkles size={14} />
                          {m.confirme_transporteur ? 'Votre confirmation enregistrée' : 'Livraison terminée'}
                        </div>
                      )}

                      {/* Bouton détails */}
                      <motion.button onClick={() => toggleExpand(m.id)}
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', cursor: 'pointer' }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        Détails
                      </motion.button>
                    </div>
                  </div>

                  {/* ── PANNEAU DÉLAI (affiché quand on clique Accepter) ── */}
                  <AnimatePresence>
                    {delaiPanel === m.id && (
                      <motion.div
                        key="delai-panel"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ borderTop: '1px solid #fcd34d', padding: '1rem 1.2rem', background: '#fffbeb' }}>
                          <p style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '0.88rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} color="#d97706" />
                            Avant d'accepter — indiquez votre délai maximum de livraison
                          </p>

                          {/* Sélecteur d'unité */}
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                            {UNITES.map(u => (
                              <motion.button
                                key={u.value}
                                onClick={() => setDelaiUnite(u.value)}
                                style={{
                                  padding: '5px 14px', borderRadius: '20px', border: '2px solid',
                                  fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer',
                                  background: delaiUnite === u.value ? '#d97706' : 'white',
                                  color:      delaiUnite === u.value ? 'white'   : '#92400e',
                                  borderColor: delaiUnite === u.value ? '#d97706' : '#fcd34d',
                                  transition: 'all 0.15s',
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {u.label}
                              </motion.button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              autoFocus
                              type="number"
                              min="1"
                              max={UNITES.find(u => u.value === delaiUnite)?.max || 365}
                              placeholder="ex: 3"
                              value={delaiJours}
                              onChange={e => setDelaiJours(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleAccepter(m.id); if (e.key === 'Escape') setDelaiPanel(null); }}
                              style={{
                                width: '80px', padding: '8px 10px',
                                border: '2px solid #fcd34d', borderRadius: '10px',
                                fontSize: '1rem', fontWeight: '700', color: '#92400e',
                                outline: 'none', background: 'white', textAlign: 'center',
                              }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#92400e' }}>
                              {UNITES.find(u => u.value === delaiUnite)?.label}
                            </span>

                            <motion.button
                              onClick={() => handleAccepter(m.id)}
                              disabled={enAction || !delaiJours}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '0.55rem 1.1rem',
                                background: (!delaiJours || enAction) ? '#9ca3af' : `linear-gradient(135deg, ${GREEN}, #2d6a4f)`,
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: '700', fontSize: '0.82rem',
                                cursor: (!delaiJours || enAction) ? 'not-allowed' : 'pointer',
                              }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {enAction
                                ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</>
                                : <><ThumbsUp size={13} /> Confirmer l'acceptation</>
                              }
                            </motion.button>

                            <motion.button
                              onClick={() => setDelaiPanel(null)}
                              style={{ padding: '0.55rem 0.9rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', fontWeight: '600', fontSize: '0.82rem', color: '#6b7280', cursor: 'pointer' }}
                              whileTap={{ scale: 0.97 }}
                            >
                              Annuler
                            </motion.button>
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#b45309' }}>
                            Ce délai sera visible par l'acheteur et le vendeur.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── DÉTAILS EXPANDABLES ── */}
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.2rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { icon: User,  label: 'Acheteur',          val: m.acheteur_nom },
                            { icon: User,  label: 'Vendeur',           val: m.vendeur_nom  },
                            { icon: Phone, label: 'Tél. livraison',    val: m.telephone_livraison },
                            { icon: MapPin,label: 'Adresse livraison', val: m.adresse_livraison   },
                            { icon: Clock, label: 'Délai max annoncé', val: m.delai_livraison_jours ? uniteLabel(m.delai_livraison_unite || 'JOURS', m.delai_livraison_jours) : null },
                            { icon: Clock, label: 'Début livraison',   val: fmt(m.date_depart)    },
                            { icon: CheckCircle, label: 'Livraison terminée', val: fmt(m.date_arrivee) },
                          ].filter(r => r.val && r.val !== '—').map((r, idx) => {
                            const RowIcon = r.icon;
                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem' }}>
                                <RowIcon size={13} color="#9ca3af" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ color: '#6b7280', minWidth: '120px' }}>{r.label}</span>
                                <span style={{ fontWeight: '600', color: '#1a2e10' }}>{r.val}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
