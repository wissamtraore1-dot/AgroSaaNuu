import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Clock, CheckCircle, XCircle, Navigation,
  Package, CreditCard, Loader, X, Smartphone, ChevronDown, ChevronUp,
  Pencil, Check,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import { ORDER_STATUS } from '../../utils/constants';

const STATUT_CONFIG = {
  PAIEMENT_EN_ATTENTE: { label: 'Paiement en attente', bg: '#fef3c7', color: '#d97706', icon: Clock       },
  PAIEMENT_RECU:       { label: 'Paiement sécurisé',   bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
  EN_PREPARATION:      { label: 'En préparation',       bg: '#ede9fe', color: '#7c3aed', icon: Package     },
  EN_LIVRAISON:        { label: 'En livraison',         bg: '#dbeafe', color: '#2563eb', icon: Navigation  },
  LIVREE:              { label: 'Livrée',               bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  CONFIRMEE_RECEPTION: { label: 'Réception confirmée',  bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  PAIEMENT_LIBERE:     { label: 'Clôturée',             bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
  ANNULEE:             { label: 'Annulée',              bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
  LITIGE:              { label: 'En litige',            bg: '#fee2e2', color: '#dc2626', icon: XCircle     },
};

const TABS = [
  { label: 'Toutes',     value: null },
  { label: 'En attente', value: ORDER_STATUS.PENDING },
  { label: 'En cours',   value: ORDER_STATUS.PREPARING },
  { label: 'Livrées',    value: ORDER_STATUS.DELIVERED },
  { label: 'Annulées',   value: ORDER_STATUS.CANCELLED },
];

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export default function BuyerOrders() {
  const navigate = useNavigate();
  const [commandes,   setCommandes]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState(null);
  const [expanded,    setExpanded]    = useState({});  // panier_id → bool
  const [renomEdit,   setRenomEdit]   = useState(null); // groupKey en cours de renommage
  const [nomTemp,     setNomTemp]     = useState('');
  const [savingNom,   setSavingNom]   = useState(false);

  // Annulation
  const [confirmAnnuler, setConfirmAnnuler] = useState(null); // groupKey en cours de confirmation
  const [annulant,       setAnnulant]       = useState(false);

  // Modal paiement
  const [modalCmd,    setModalCmd]    = useState(null);
  const [paying,      setPaying]      = useState(false);
  const [paySuccess,  setPaySuccess]  = useState(false);
  const [payError,    setPayError]    = useState('');

  useEffect(() => { charger(); }, [tab]);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getBuyerOrders({ status: tab });
      setCommandes(data.commandes || data.results || data || []);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModal = (e, groupe) => {
    e.stopPropagation();
    setModalCmd(groupe);
    setPaying(false);
    setPaySuccess(false);
    setPayError('');
  };

  const fermerModal = () => {
    if (paying) return;
    if (paySuccess) { charger(); }
    setModalCmd(null);
    setPaySuccess(false);
    setPayError('');
  };

  const handlePayer = async () => {
    setPaying(true);
    setPayError('');
    try {
      let res;
      if (modalCmd.groupe_vendeur_id) {
        res = await OrderService.initierPaiementGroupeVendeur(modalCmd.groupe_vendeur_id);
      } else if (modalCmd.panier_id) {
        res = await OrderService.initierPaiementPanier(modalCmd.panier_id);
      } else {
        res = await OrderService.initierPaiementFedaPay({ commande_id: modalCmd.id });
      }
      setPaying(false);
      window.FedaPay.init({
        public_key: res.public_key,
        transaction: { id: res.transaction_id },
        onComplete: (reason) => {
          if (reason === window.FedaPay.CHECKOUT_COMPLETED) {
            setPaySuccess(true);
          } else {
            // Mobile Money : l'approbation (USSD) peut arriver après la fermeture
            // de la fenêtre FedaPay. On ne réaffiche pas le formulaire de paiement —
            // on ferme et on rafraîchit pour refléter le vrai statut dès que le
            // webhook FedaPay confirme la transaction côté serveur.
            setModalCmd(null);
            charger();
            setTimeout(charger, 5000);
          }
        },
      }).open();
    } catch (err) {
      setPayError(err.response?.data?.message || 'Erreur lors du paiement. Réessayez.');
      setPaying(false);
    }
  };

  const ouvrirRenom = (e, c) => {
    e.stopPropagation();
    setRenomEdit(c.groupe_vendeur_id || c.panier_id || c.id);
    setNomTemp(c.nom_commande || '');
  };

  const sauvegarderNom = async (e, c) => {
    e.stopPropagation();
    setSavingNom(true);
    try {
      await OrderService.renommerCommande(c.id, nomTemp.trim());
      setCommandes(prev => prev.map(x => {
        const key = c.groupe_vendeur_id || c.panier_id || c.id;
        if ((x.groupe_vendeur_id || x.panier_id || x.id) === key) return { ...x, nom_commande: nomTemp.trim() };
        return x;
      }));
      setRenomEdit(null);
    } catch {
      // silencieux
    } finally {
      setSavingNom(false);
    }
  };

  const handleAnnuler = async (e, c) => {
    e.stopPropagation();
    setAnnulant(true);
    try {
      const ids = c.commande_ids?.length ? c.commande_ids : [c.id];
      await Promise.all(ids.map(id => OrderService.annuler(id)));
      setConfirmAnnuler(null);
      charger();
    } catch {
      // silencieux — le statut sera rafraîchi
    } finally {
      setAnnulant(false);
    }
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={22} color={GREEN} /><span> Mes commandes</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Suivez l'état de toutes vos commandes
          </p>
        </motion.div>

        {/* ONGLETS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <motion.button
              key={String(t.value)}
              onClick={() => setTab(t.value)}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '20px', border: '1.5px solid',
                fontSize: '0.83rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                background:  tab === t.value ? GREEN  : 'white',
                color:       tab === t.value ? 'white' : '#374151',
                borderColor: tab === t.value ? GREEN  : '#e5e7eb',
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
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: '110px', borderRadius: '14px', background: '#f3f4f6' }} />)}
          </div>

        ) : commandes.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid #e5e7eb' }}
          >
            <ShoppingCart size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: '0 0 1.2rem' }}>Aucune commande trouvée</p>
            <motion.button
              onClick={() => navigate('/buyer/catalog')}
              style={{ background: `linear-gradient(135deg, #0d2b14, ${GREEN})`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 2rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Parcourir le catalogue
            </motion.button>
          </motion.div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commandes.map((c, i) => {
              const cfg             = STATUT_CONFIG[c.statut] || STATUT_CONFIG.PAIEMENT_EN_ATTENTE;
              const Icon            = cfg.icon;
              const enAttentePaiement = c.statut === 'PAIEMENT_EN_ATTENTE';
              const hasMultiple     = (c.lignes?.length || 0) > 1;
              const groupKey        = c.groupe_vendeur_id || c.panier_id || c.id;
              const isOpen          = !!expanded[groupKey];
              const firstCmdId      = c.commande_ids?.[0] || c.id;

              return (
                <motion.div
                  key={groupKey || i}
                  variants={fadeUp} initial="hidden" animate="show"
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: 'white', borderRadius: '14px',
                    border: `1px solid ${enAttentePaiement ? '#fcd34d' : '#e5e7eb'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                  }}
                >
                  {/* ── En-tête de la commande (cliquable → détail) ── */}
                  <div
                    onClick={() => renomEdit === groupKey ? null : navigate(`/buyer/orders/${firstCmdId}`)}
                    style={{ padding: '1.1rem 1.2rem', cursor: renomEdit === groupKey ? 'default' : 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.7rem' }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                        {renomEdit === groupKey ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={nomTemp}
                              onChange={e => setNomTemp(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') sauvegarderNom(e, c); if (e.key === 'Escape') setRenomEdit(null); }}
                              placeholder="Nom de la commande…"
                              style={{ flex: 1, padding: '4px 8px', border: '2px solid ' + GREEN, borderRadius: '7px', fontSize: '0.88rem', fontWeight: '700', color: '#1a2e10', outline: 'none', minWidth: 0 }}
                            />
                            <motion.button onClick={e => sauvegarderNom(e, c)} disabled={savingNom} style={{ background: GREEN, border: 'none', borderRadius: '7px', padding: '4px 8px', cursor: 'pointer', display: 'flex', color: 'white', flexShrink: 0 }} whileTap={{ scale: 0.95 }}>
                              {savingNom ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
                            </motion.button>
                            <motion.button onClick={e => { e.stopPropagation(); setRenomEdit(null); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: '7px', padding: '4px 8px', cursor: 'pointer', display: 'flex', color: '#6b7280', flexShrink: 0 }} whileTap={{ scale: 0.95 }}>
                              <X size={12} />
                            </motion.button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>
                                {c.nom_commande || `Commande #${c.reference || String(c.id || '').slice(0, 8).toUpperCase()}`}
                              </span>
                              <motion.button
                                onClick={e => ouvrirRenom(e, c)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#d1d5db', padding: '1px', flexShrink: 0 }}
                                whileHover={{ color: GREEN }}
                                title="Renommer"
                              >
                                <Pencil size={12} />
                              </motion.button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                              {c.vendeur_nom && (
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Package size={11} color="#9ca3af" /> {c.vendeur_nom}
                                </span>
                              )}
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(c.created_at)}</span>
                              {hasMultiple && (
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: GREEN, background: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>
                                  {c.nb_articles} articles
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                        <Icon size={12} /><span> {cfg.label}</span>
                      </span>
                    </div>

                    {/* Résumé produits */}
                    {c.lignes?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                        {(isOpen ? c.lignes : c.lignes.slice(0, 2)).map((ligne, j) => (
                          <span key={j} style={{ background: '#f3f4f6', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', color: '#374151' }}>
                            {ligne.produit_nom}{ligne.quantite > 1 ? ` ×${ligne.quantite}` : ''}
                          </span>
                        ))}
                        {!isOpen && c.lignes.length > 2 && (
                          <span style={{ background: '#f3f4f6', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', color: '#6b7280' }}>
                            +{c.lignes.length - 2} de plus
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a5c2a' }}>
                        {Number(c.montant_total || 0).toLocaleString('fr-FR')} FCFA
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {enAttentePaiement && (
                          confirmAnnuler === groupKey ? (
                            /* ── Confirmation d'annulation inline ── */
                            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '5px 10px' }}>
                              <span style={{ fontSize: '0.73rem', color: '#dc2626', fontWeight: '700' }}>Annuler la commande ?</span>
                              <motion.button
                                onClick={e => handleAnnuler(e, c)}
                                disabled={annulant}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '7px', padding: '4px 10px', fontSize: '0.73rem', fontWeight: '700', cursor: annulant ? 'not-allowed' : 'pointer' }}
                                whileTap={!annulant ? { scale: 0.95 } : {}}
                              >
                                {annulant ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={11} />}
                                Oui
                              </motion.button>
                              <motion.button
                                onClick={e => { e.stopPropagation(); setConfirmAnnuler(null); }}
                                style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '7px', padding: '4px 10px', fontSize: '0.73rem', fontWeight: '700', cursor: 'pointer' }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Non
                              </motion.button>
                            </div>
                          ) : (
                            <>
                              <motion.button
                                onClick={e => ouvrirModal(e, c)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '5px',
                                  background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                                  color: 'white', border: 'none', borderRadius: '10px',
                                  padding: '6px 14px', fontSize: '0.78rem', fontWeight: '700',
                                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(217,119,6,0.35)',
                                }}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              >
                                <CreditCard size={13} /> Payer
                              </motion.button>
                              <motion.button
                                onClick={e => { e.stopPropagation(); setConfirmAnnuler(groupKey); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700', color: '#dc2626', cursor: 'pointer' }}
                                whileHover={{ background: '#fef2f2' }} whileTap={{ scale: 0.95 }}
                              >
                                <X size={13} /> Annuler
                              </motion.button>
                            </>
                          )
                        )}
                        {hasMultiple && (
                          <motion.button
                            onClick={e => toggleExpand(e, groupKey)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer', fontWeight: '600' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {isOpen ? 'Réduire' : 'Détails'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Détail des lignes (dépliable) ── */}
                  <AnimatePresence>
                    {isOpen && hasMultiple && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', borderTop: '1px solid #f3f4f6' }}
                      >
                        <div style={{ padding: '0.8rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {c.lignes.map((ligne, j) => {
                            const lCfg = STATUT_CONFIG[ligne.statut] || STATUT_CONFIG.PAIEMENT_EN_ATTENTE;
                            return (
                              <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: j < c.lignes.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <div>
                                  <span style={{ fontWeight: '600', fontSize: '0.83rem', color: '#1a2e10' }}>{ligne.produit_nom}</span>
                                  <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>× {ligne.quantite} — {ligne.vendeur_nom}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: GREEN }}>{Number(ligne.montant).toLocaleString('fr-FR')} FCFA</span>
                                  {ligne.statut !== c.statut && (
                                    <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', background: lCfg.bg, color: lCfg.color }}>
                                      {lCfg.label}
                                    </span>
                                  )}
                                </div>
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

      {/* ── MODAL PAIEMENT FEDAPAY ── */}
      <AnimatePresence>
        {modalCmd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={fermerModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
            >
              {paySuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    style={{ width: '72px', height: '72px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}
                  >
                    <Smartphone size={38} color="#d97706" />
                  </motion.div>
                  <h2 style={{ fontWeight: '900', color: '#1a2e10', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Paiement effectué !</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                    Votre paiement de <strong>{Number(modalCmd.montant_total || 0).toLocaleString('fr-FR')} FCFA</strong> a bien été transmis à FedaPay.
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
                    Votre commande passera en "Paiement sécurisé" dès confirmation de FedaPay.
                  </p>
                  <motion.button
                    onClick={fermerModal}
                    style={{ background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '14px', padding: '0.85rem 2.5rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  >
                    Fermer
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* ── Header FedaPay ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    {/* Logo officiel FedaPay */}
                    <svg width="130" height="27" viewBox="0 0 118 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.7644 17.9915C10.848 18.2234 10.6761 18.4679 10.4284 18.4679H0.00298505C0.0045625 18.4647 0.00456164 18.46 0.00456164 18.4584C0.00456164 18.4568 0.00456318 18.4552 0.00614064 18.4552C0.00929556 18.4442 0.0092945 18.4331 0.0124494 18.4221C0.0124494 18.4205 0.012451 18.4205 0.0140284 18.419C0.0156059 18.4126 0.0171816 18.4063 0.0171816 18.4C0.0345337 18.3858 0.0518851 18.3716 0.0708146 18.359C0.111829 18.3275 0.15442 18.2943 0.197012 18.2644C0.214364 18.2502 0.231716 18.2375 0.249068 18.2249C0.302702 18.1855 0.35476 18.1461 0.408393 18.1066C3.25413 16.0086 6.51789 14.4375 10.0514 13.5383C10.0482 13.6471 10.0482 13.756 10.0482 13.8664C10.0482 14.1109 10.0561 14.3538 10.0703 14.5936C10.1382 15.7799 10.3779 16.9204 10.7644 17.9915Z" fill="url(#fp0)"/>
                      <path d="M14.5993 12.7212V14.3034C14.5993 14.4485 14.4653 14.5605 14.3107 14.5479C13.6876 14.4942 13.0566 14.4674 12.4177 14.4674C9.98528 14.4674 7.65222 14.8649 5.48794 15.5906C5.45166 15.6032 5.41538 15.6142 5.3791 15.6269C3.55556 16.25 1.85348 17.1097 0.315453 18.165C0.287059 18.1823 0.260244 18.2013 0.233427 18.2218C0.231849 18.2218 0.231849 18.2234 0.230271 18.2234C0.195567 18.247 0.159285 18.2723 0.126158 18.2975C0.0914543 18.3212 0.055173 18.3464 0.0204689 18.3716C0.0220463 18.3606 0.0236227 18.3511 0.0267777 18.3417C0.121425 18.2596 0.217651 18.1792 0.313876 18.1003L0.315453 18.0987C0.373819 18.0514 0.432185 18.0025 0.490551 17.9568C1.96863 16.7642 3.61077 15.7436 5.38068 14.928C5.41853 14.9107 5.45482 14.8933 5.49268 14.8776C8.26427 13.6172 11.3435 12.8553 14.5993 12.7212Z" fill="url(#fp1)"/>
                      <path d="M15.6942 10.4102V12.4656C15.6942 12.5966 15.5838 12.7038 15.4434 12.7101L14.6515 12.7433C14.6341 12.7448 14.6168 12.7448 14.5994 12.7464C11.3436 12.8852 8.2612 13.655 5.49118 14.9233C5.47067 14.9328 5.45174 14.9422 5.43124 14.9517C3.57299 15.8083 1.85514 16.8904 0.318691 18.1634C0.317114 18.1634 0.315536 18.165 0.315536 18.1666C0.291874 18.1855 0.268212 18.2044 0.246127 18.2249C0.224043 18.2423 0.201959 18.2612 0.179874 18.2801H0.178298C0.17672 18.2817 0.175142 18.2833 0.175142 18.2849C0.119931 18.3275 0.0647209 18.3732 0.0110873 18.4221C0.0110873 18.4205 0.0110864 18.4205 0.0126639 18.419C0.0315934 18.3984 0.050523 18.3795 0.0694525 18.359C0.088382 18.3385 0.107311 18.3196 0.127818 18.2991C0.189339 18.2328 0.252439 18.1666 0.317115 18.1003C1.85198 16.5181 3.60769 15.1299 5.53693 13.9705C7.86841 12.5729 10.4539 11.516 13.216 10.8724C13.4069 10.8282 13.5993 10.7856 13.7918 10.7446C13.8864 10.7241 13.9842 10.7052 14.0804 10.6863C14.183 10.6657 14.2855 10.6468 14.3881 10.6263C14.4764 10.6105 14.5631 10.5932 14.6515 10.579C14.825 10.5474 14.9985 10.519 15.1705 10.4906C15.2572 10.4749 15.3456 10.4623 15.4323 10.4512C15.5207 10.4354 15.6074 10.4228 15.6942 10.4102Z" fill="url(#fp2)"/>
                      <path d="M16.8047 0.246643V10.0442C16.8047 10.1657 16.71 10.2682 16.5807 10.2872L15.7399 10.4055C15.6374 10.4197 15.5349 10.4339 15.4323 10.4512C15.3456 10.4638 15.2572 10.4764 15.1705 10.4906C15.0111 10.5159 14.8534 10.5427 14.6956 10.5695C14.5931 10.5869 14.489 10.6074 14.3881 10.6263C14.2855 10.6468 14.183 10.6657 14.0804 10.6863C13.9842 10.7052 13.8864 10.7257 13.7918 10.7446C13.5993 10.7856 13.4069 10.8282 13.216 10.8724C10.4744 11.5176 7.9078 12.5713 5.59367 13.9548C4.00044 14.9107 2.53655 16.0133 1.21464 17.2501C1.12631 17.3337 1.03955 17.4157 0.951208 17.4993C0.795039 17.6492 0.64041 17.8022 0.490551 17.9568C0.44796 17.9994 0.405408 18.0404 0.365972 18.083C0.320225 18.1287 0.277596 18.1745 0.233427 18.2218C0.189297 18.2675 0.184564 18.2738 0.178254 18.2786H0.176677C0.134085 18.3243 0.0962251 18.3637 0.0567886 18.4048C0.0394365 18.4237 0.0394365 18.4253 0.0378608 18.4268C0.0331277 18.43 0.0236629 18.441 0 18.4663C0.00157746 18.4631 0.001579 18.4584 0.001579 18.4568C0.00630945 18.4426 0.00630945 18.4316 0.00946437 18.4205C0.0110434 18.4174 0.014199 18.4111 0.014199 18.3985C0.0173539 18.389 0.0173528 18.3811 0.0205077 18.37C0.0236627 18.3606 0.0236616 18.3496 0.0268165 18.3401C1.55537 10.4843 7.14589 3.95209 14.6956 0.707262C15.0395 0.558981 15.3865 0.418586 15.7399 0.286079L16.4419 0.0179142C16.6154 -0.0467616 16.8047 0.0715449 16.8047 0.246643Z" fill="url(#fp3)"/>
                      <path d="M24.1718 2.4551H35.6352L35.0484 5.43807H27.3425L26.5916 9.33912H33.381L32.8163 12.3221H26.0032L24.8296 18.43H21.0705L24.1718 2.4551Z" fill="#212121"/>
                      <path d="M42.0016 5.39075C37.5862 5.39075 34.5544 9.21924 34.5544 13.5667C34.5544 16.8794 36.6445 18.8055 40.0282 18.8055C42.8723 18.8055 45.6218 17.2785 46.7702 14.2703H43.0111C42.4953 15.4455 41.5078 15.9376 40.3105 15.9376C38.9476 15.9376 38.2409 15.1158 38.2409 13.4484C38.2409 13.237 38.2409 13.0493 38.2646 12.8364H46.9564L47.0731 12.1786C47.1677 11.6154 47.2135 11.0507 47.2135 10.5333C47.2166 7.41148 45.3363 5.39075 42.0016 5.39075ZM43.6453 10.7715H38.7362C39.2994 9.31704 40.3342 8.25857 41.6719 8.25857C42.9638 8.25857 43.6453 9.08043 43.6453 10.6074V10.7715Z" fill="#212121"/>
                      <path d="M58.8712 2.46457L57.9989 6.91773C57.3884 5.93182 56.4009 5.39075 55.0853 5.39075C51.0928 5.39075 48.2975 9.41011 48.2975 13.8254C48.2975 16.8336 49.8955 18.8054 52.5014 18.8054C53.7713 18.8054 54.967 18.2423 56.0018 17.2548L55.7668 18.43H59.3618L62.4663 2.45352L58.8712 2.46457ZM53.8186 15.8919C52.6434 15.8919 52.0329 15.0937 52.0329 13.614C52.0329 10.9576 53.4668 8.30431 55.3219 8.30431C56.5192 8.30431 57.1313 9.10251 57.1313 10.5822C57.1313 12.8379 55.9088 15.8919 53.8186 15.8919Z" fill="#212121"/>
                      <path d="M69.7444 5.39075C66.4554 5.39075 64.0356 6.96505 63.239 9.97327H66.834C67.1858 8.98578 68.0076 8.3059 69.2523 8.3059C70.4748 8.3059 71.0616 8.79806 71.0616 9.76347C71.0616 9.97485 71.0379 10.1862 70.9906 10.4213L70.9433 10.7036C68.3815 10.7273 67.0675 10.844 65.1414 11.4797C62.9787 12.207 61.8287 13.7103 61.8287 15.4502C61.8287 17.6586 63.4504 18.8102 65.6572 18.8102C67.0201 18.8102 68.5014 18.2944 69.7208 17.1192L69.6498 18.0814C69.6498 18.2234 69.6498 18.3417 69.6734 18.4348H73.3852C73.3615 18.247 73.3379 18.0577 73.3379 17.799C73.3379 17.2359 73.4089 16.5087 73.6423 15.2861L74.5588 10.5632C74.6298 10.1641 74.6756 9.81237 74.6756 9.43693C74.6787 7.12911 73.1044 5.39075 69.7444 5.39075ZM70.4275 13.2859C70.0962 15.0243 68.6181 16.3146 66.9981 16.3146C66.0816 16.3146 65.5405 15.9156 65.5405 15.0716C65.5405 13.8018 66.6447 12.8616 70.5205 12.7922L70.4275 13.2859Z" fill="#212121"/>
                      <path d="M85.0632 2.4551H78.9064L75.8051 18.43H79.5642L80.5754 13.2149H83.1608C87.8112 13.2149 90.5844 10.4181 90.5844 7.05812C90.5828 4.12405 88.4437 2.4551 85.0632 2.4551ZM83.4653 10.2304H81.1622L82.0787 5.43807H84.4985C85.9324 5.43807 86.6596 6.14477 86.6596 7.24741C86.6581 8.93845 85.5554 10.2304 83.4653 10.2304Z" fill="#212121"/>
                      <path d="M98.1466 5.39075C94.8576 5.39075 92.4362 6.96505 91.638 9.97327H95.233C95.5848 8.98578 96.4082 8.3059 97.6528 8.3059C98.8754 8.3059 99.4622 8.79806 99.4622 9.76347C99.4622 9.97485 99.4385 10.1862 99.3912 10.4213L99.3439 10.7036C96.7836 10.7273 95.468 10.844 93.542 11.4797C91.3809 12.207 90.2293 13.7103 90.2293 15.4502C90.2293 17.6586 91.8509 18.8102 94.0578 18.8102C95.4207 18.8102 96.9019 18.2944 98.1229 17.1192L98.0519 18.0814C98.0519 18.2234 98.0519 18.3417 98.0756 18.4348H101.787C101.764 18.247 101.74 18.0577 101.74 17.799C101.74 17.2359 101.811 16.5087 102.044 15.2861L102.959 10.5632C103.03 10.1641 103.076 9.81237 103.076 9.43693C103.079 7.12911 101.505 5.39075 98.1466 5.39075ZM98.828 13.2859C98.4999 15.0243 97.0187 16.3146 95.3986 16.3146C94.4837 16.3146 93.9411 15.9156 93.9411 15.0716C93.9411 13.8018 95.0453 12.8616 98.9227 12.7922L98.828 13.2859Z" fill="#212121"/>
                      <path d="M102.28 23.6451L102.819 20.9208H103.548C104.84 20.9208 105.427 20.6858 106.649 18.5957L107.119 17.7738L104.699 5.793H108.458L109.563 12.5114L109.703 14.1788L110.479 12.5114L114.074 5.793H117.903L109.75 19.7472C107.824 23.0362 106.414 24 104.042 24C103.267 23.9984 102.562 23.7871 102.28 23.6451Z" fill="#212121"/>
                      <defs>
                        <linearGradient id="fp0" x1="3.52707" y1="12.615" x2="7.81921" y2="22.3107" gradientUnits="userSpaceOnUse">
                          <stop offset="0.3227" stopColor="#0E225E"/><stop offset="0.3988" stopColor="#112770"/>
                          <stop offset="0.5312" stopColor="#162E88"/><stop offset="0.6708" stopColor="#193399"/>
                          <stop offset="0.8208" stopColor="#1B36A4"/><stop offset="1" stopColor="#1C37A7"/>
                        </linearGradient>
                        <linearGradient id="fp1" x1="6.50175" y1="12.5482" x2="8.20048" y2="18.8408" gradientUnits="userSpaceOnUse">
                          <stop offset="0.1754" stopColor="#0992FF"/><stop offset="0.3617" stopColor="#8DD3FF"/>
                          <stop offset="0.6635" stopColor="#8FD4FF"/><stop offset="0.8248" stopColor="#97D7FF"/>
                          <stop offset="0.9526" stopColor="#A5DCFF"/><stop offset="1" stopColor="#ACDFFF"/>
                        </linearGradient>
                        <linearGradient id="fp2" x1="6.79289" y1="11.708" x2="8.6287" y2="16.3946" gradientUnits="userSpaceOnUse">
                          <stop offset="0.111" stopColor="#04568E"/><stop offset="0.4027" stopColor="#309EFF"/>
                          <stop offset="0.9137" stopColor="#309EFF"/><stop offset="1" stopColor="#309EFF"/>
                        </linearGradient>
                        <linearGradient id="fp3" x1="6.25578" y1="5.47431" x2="10.2134" y2="12.5701" gradientUnits="userSpaceOnUse">
                          <stop offset="0.0406" stopColor="#063FB2"/><stop offset="0.1678" stopColor="#104BC8"/>
                          <stop offset="0.351" stopColor="#1B58E0"/><stop offset="0.5442" stopColor="#2462F1"/>
                          <stop offset="0.7519" stopColor="#2867FC"/><stop offset="1" stopColor="#2A69FF"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <motion.button onClick={fermerModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} whileHover={{ background: '#e5e7eb' }}>
                      <X size={16} color="#6b7280" />
                    </motion.button>
                  </div>

                  {/* Marchand + référence */}
                  <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '2px' }}>
                      Commande #{modalCmd.reference || String(modalCmd.id || '').slice(0, 8).toUpperCase()}
                      {(modalCmd.nb_articles || 1) > 1 && ` · ${modalCmd.nb_articles} articles`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>
                      AgroSaaNuu · Bénin
                    </div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '16px', padding: '1rem 1.2rem', marginBottom: '1.4rem', textAlign: 'center', border: '1.5px solid #fcd34d' }}>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>Montant total à payer</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#92400e' }}>
                      {Number(modalCmd.montant_total || 0).toLocaleString('fr-FR')}
                      <span style={{ fontSize: '1rem', fontWeight: '700', marginLeft: '6px' }}>FCFA</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#6b7280', textAlign: 'center', marginBottom: '1.2rem' }}>
                    Tu choisiras ton opérateur Mobile Money (MTN, Moov, Celtis…) et ton numéro directement dans la fenêtre FedaPay qui va s'ouvrir.
                  </p>

                  {payError && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '10px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' }}>
                      {payError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={fermerModal}
                      style={{ flex: 1, padding: '0.85rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      Annuler
                    </button>
                    <motion.button
                      onClick={handlePayer}
                      disabled={paying}
                      style={{
                        flex: 2, padding: '0.85rem',
                        background: paying ? '#9ca3af' : 'linear-gradient(135deg, #00a57a, #00c896)',
                        color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700',
                        cursor: paying ? 'not-allowed' : 'pointer', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        boxShadow: paying ? 'none' : '0 4px 16px rgba(0,200,150,0.35)',
                      }}
                      whileHover={!paying ? { scale: 1.02 } : {}}
                      whileTap={!paying ? { scale: 0.97 } : {}}
                    >
                      {paying
                        ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Traitement…</>
                        : <><CreditCard size={15} /> Payer maintenant</>
                      }
                    </motion.button>
                  </div>

                  {/* Footer sécurité */}
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 14 14" width="13" height="13"><path d="M7 1L2 3v4c0 3 2.5 5.2 5 6 2.5-.8 5-3 5-6V3L7 1z" fill="#00c896" opacity="0.8"/></svg>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Paiement sécurisé par</span>
                    <svg viewBox="0 0 80 18" width="60" height="14">
                      <text x="0" y="14" fontFamily="'Arial Black',Arial" fontWeight="900" fontSize="13" fill="#00c896">Feda</text>
                      <text x="38" y="14" fontFamily="'Arial Black',Arial" fontWeight="900" fontSize="13" fill="#374151">Pay</text>
                    </svg>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
