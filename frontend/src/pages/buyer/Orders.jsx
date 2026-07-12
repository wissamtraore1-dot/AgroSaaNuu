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

const RESEAUX = [
  {
    value: 'MTN', label: 'MTN Mobile Money', color: '#FFCB05',
    logo: (
      /* Logo officiel MTN Mobile Money */
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88" width="54" height="54">
        <polygon fill="#ffcb05" points="0 122.88 122.88 122.88 122.88 0 0 0 0 122.88"/>
        <path fill="#00678f" d="M119,61.09c0,13.11-25.78,23.75-57.58,23.75S3.85,74.2,3.85,61.09s25.79-23.75,57.6-23.75S119,48,119,61.09Z"/>
        <polygon fill="#fff" points="24.55 72.81 30.5 49.06 40.02 49.06 40.02 62.89 46.27 49.06 56.1 49.06 50.15 72.81 43.89 72.81 47.46 57.48 40.02 72.81 34.97 72.81 34.97 57.48 31.09 72.81 24.55 72.81"/>
        <polygon fill="#ed1d24" points="58.02 73.11 58.91 69.8 65.76 69.8 64.86 73.11 58.02 73.11"/>
        <polygon fill="#fff" points="73.34 72.81 79.29 49.06 86.14 49.06 89.12 61.69 92.39 49.06 98.64 49.06 92.69 72.81 86.14 72.81 82.87 59.88 79.59 72.81 73.34 72.81"/>
        <polygon fill="#ffcb05" points="58.02 49.06 56.53 55.08 62.79 55.08 59.42 68.12 66.26 68.12 69.64 55.08 75.88 55.08 77.37 49.06 58.02 49.06"/>
      </svg>
    ),
  },
  {
    value: 'MOOV', label: 'Moov Money', color: '#003087',
    logo: (
      /* Logo officiel Moov Africa Bénin */
      <img
        src="https://www.moov-africa.bj/wp-content/uploads/2022/10/LOGO-MOOV-AFRICA-.png"
        alt="Moov Money"
        style={{ width: '76px', height: '44px', objectFit: 'contain', display: 'block' }}
      />
    ),
  },
  {
    value: 'CELTIS', label: 'Celtiis Money', color: '#1F3B71',
    logo: (
      /* Logo officiel Celtiis Bénin */
      <svg width="54" height="53" viewBox="0 0 66 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M59.7787 64.5874H5.22388C4.59216 64.5874 3.96662 64.463 3.38302 64.2211C2.79942 63.9793 2.26919 63.6249 1.82261 63.178C1.37604 62.7312 1.02187 62.2008 0.780353 61.6171C0.538837 61.0334 0.414703 60.4078 0.41504 59.776V5.22122C0.41504 3.94584 0.921687 2.72269 1.82352 1.82086C2.72535 0.919028 3.9485 0.412385 5.22388 0.412385H59.7787C60.4104 0.412048 61.036 0.536182 61.6197 0.777698C62.2035 1.01921 62.7339 1.37338 63.1807 1.81995C63.6275 2.26653 63.982 2.79676 64.2238 3.38037C64.4656 3.96397 64.5901 4.5895 64.5901 5.22122V59.776C64.5901 61.0521 64.0832 62.2759 63.1809 63.1782C62.2785 64.0805 61.0547 64.5874 59.7787 64.5874" fill="#1F3B71"/>
        <path d="M59.7787 65H5.22388C3.83884 64.9986 2.5109 64.4478 1.53153 63.4685C0.552154 62.4891 0.00135656 61.1612 0 59.7761V5.22132C0.00271035 3.83693 0.554031 2.51005 1.53319 1.53138C2.51234 0.552702 3.83949 0.00203122 5.22388 0H59.7787C61.1637 0.00135656 62.4916 0.552162 63.471 1.53154C64.4504 2.51091 65.0012 3.83884 65.0026 5.22388V59.7761C65.0019 61.1614 64.4513 62.4897 63.4718 63.4692C62.4922 64.4487 61.1639 64.9993 59.7787 65M5.22388 0.824958C4.05831 0.826314 2.94087 1.28994 2.11668 2.11412C1.2925 2.9383 0.828871 4.05575 0.827515 5.22132V59.7761C0.828871 60.9417 1.2925 62.0591 2.11668 62.8833C2.94087 63.7075 4.05831 64.1711 5.22388 64.1725H59.7787C60.9443 64.1711 62.0617 63.7075 62.8859 62.8833C63.7101 62.0591 64.1737 60.9417 64.175 59.7761V5.22132C64.1737 4.0553 63.7097 2.93747 62.885 2.11322C62.0602 1.28896 60.9421 0.825636 59.7761 0.824958H5.22388Z" fill="white"/>
        <path d="M53.6915 18.2771C53.5966 18.2052 53.4974 18.1393 53.3943 18.0798L53.2815 18.0158C51.5133 16.9527 49.4099 16.5933 47.389 17.0089C45.984 17.2928 44.6777 17.9393 43.5998 18.8843C42.3651 19.9686 41.4805 21.3954 41.0583 22.9835C41.0505 23.0023 41.0453 23.0221 41.043 23.0424C41.0341 23.1096 41.0496 23.1777 41.0865 23.2345C41.1095 23.2708 41.1408 23.3011 41.1777 23.3229C41.2147 23.3447 41.2563 23.3574 41.2992 23.3601C41.3362 23.3626 41.3734 23.3578 41.4085 23.3459C41.4437 23.3341 41.4762 23.3154 41.5041 23.2909C41.5122 23.2803 41.5217 23.2708 41.5323 23.2627C42.3279 22.464 43.3425 21.9192 44.4478 21.6974C45.375 21.5087 46.3344 21.5527 47.2404 21.8254C47.9924 22.0496 48.6901 22.4263 49.29 22.9322C49.4422 23.1153 49.614 23.2811 49.8024 23.4267C50.2088 23.7366 50.6829 23.9456 51.1858 24.0364C51.646 24.1214 52.1192 24.1039 52.5719 23.9852C53.3258 23.784 53.9818 23.3174 54.4191 22.6711C54.8564 22.0248 55.0456 21.2423 54.952 20.4676C54.8992 20.0361 54.7599 19.6197 54.5425 19.2433C54.325 18.8669 54.0338 18.5383 53.6863 18.2771" fill="#94C11F"/>
        <path d="M18.8976 46.5178C18.8028 46.587 18.7028 46.6536 18.6029 46.7151L18.4902 46.7791C16.7218 47.8418 14.6186 48.2011 12.5976 47.786C11.1933 47.5025 9.8877 46.8559 8.81105 45.9106C7.57483 44.8271 6.68918 43.4001 6.26699 41.8114C6.26579 41.7918 6.26579 41.7721 6.26699 41.7525C6.26084 41.7194 6.2613 41.6853 6.26833 41.6523C6.27537 41.6194 6.28885 41.5881 6.30799 41.5604C6.33155 41.5241 6.36328 41.4938 6.40065 41.472C6.43803 41.4502 6.48 41.4375 6.52319 41.4348C6.55984 41.4322 6.59664 41.437 6.63141 41.4489C6.66618 41.4607 6.69821 41.4795 6.72559 41.504L6.75377 41.5322C7.54604 42.3251 8.55504 42.8662 9.65394 43.0873C10.5808 43.2782 11.5405 43.2351 12.4465 42.9618C13.1981 42.7368 13.8957 42.3601 14.4961 41.855C14.6483 41.6719 14.8201 41.5061 15.0085 41.3605C15.4142 41.0512 15.8874 40.8422 16.3894 40.7508C16.8495 40.6657 17.3228 40.6832 17.7754 40.802C18.5316 41.0012 19.19 41.4675 19.629 42.1146C20.0679 42.7618 20.2577 43.5459 20.1632 44.3222C20.1107 44.7537 19.9716 45.1702 19.7541 45.5467C19.5366 45.9231 19.2453 46.2517 18.8976 46.5127" fill="#94C11F"/>
        <path d="M13.8636 36.7362C13.8636 36.749 12.5826 38.0172 10.925 38.0172C10.5073 38.0287 10.0917 37.9526 9.70518 37.7937C9.31863 37.6349 8.96966 37.3968 8.68071 37.0949C8.13245 36.5035 7.8333 35.7235 7.8455 34.9172C7.8455 33.1469 9.106 31.8608 10.843 31.8608C11.8129 31.8817 12.7409 32.2603 13.4486 32.924L13.5792 33.0572L14.8756 31.0435L14.8064 30.9589C14.7526 30.8949 13.4511 29.3628 10.7072 29.3628C9.93242 29.3451 9.16183 29.4819 8.44043 29.7651C7.71904 30.0484 7.06131 30.4725 6.50559 31.0127C5.48445 32.0591 4.9205 33.4681 4.93766 34.93C4.92648 35.6581 5.05924 36.3812 5.32831 37.0579C5.59738 37.7345 5.99747 38.3513 6.50559 38.8729C7.56625 39.9361 9.02145 40.4972 10.7072 40.4972C13.5254 40.4972 15.019 38.8345 15.0831 38.7627L15.1497 38.6859L14.0096 36.5927L13.8636 36.7362Z" fill="white"/>
        <path d="M21.4154 29.3628C20.6955 29.3478 19.98 29.4782 19.3117 29.7463C18.6434 30.0144 18.0361 30.4146 17.5263 30.9231C16.5169 32.0105 15.9726 33.4494 16.0096 34.9326C16.0096 38.1581 18.4102 40.4972 21.7177 40.4972C23.2739 40.512 24.7847 39.9735 25.9808 38.9779L26.0628 38.8985L24.9278 36.79L24.7895 36.9104C24.7895 36.9104 23.4931 38.0095 21.9021 38.0095C21.187 38.0226 20.4889 37.7902 19.9243 37.3511C19.3839 36.8999 19.0387 36.2574 18.961 35.5577H26.0756L26.0884 35.4245C26.0884 35.3963 26.1499 34.7225 26.1499 34.415C26.1499 32.9803 25.7297 31.7429 24.9381 30.8283C24.0926 29.8598 22.8731 29.3474 21.4128 29.3474M21.3539 31.6327C22.4427 31.6327 23.1473 32.3398 23.2472 33.4902H19.0583C19.335 32.3245 20.1831 31.6327 21.3641 31.6327" fill="white"/>
        <path d="M44.1968 25.548H41.3428V28.1971H44.1968V25.548Z" fill="white"/>
        <path d="M44.2173 29.3552H41.3428V40.4972H44.2173V29.3552Z" fill="white"/>
        <path d="M49.6177 25.548H46.7637V28.1971H49.6177V25.548Z" fill="white"/>
        <path d="M49.6382 29.3552H46.7637V40.4972H49.6382V29.3552Z" fill="white"/>
        <path d="M56.2173 33.7899C55.3206 33.4312 54.5495 33.1212 54.5495 32.637C54.5495 32.058 55.1797 31.853 55.7203 31.853C56.6062 31.8472 57.4669 32.1477 58.1567 32.7036L58.3002 32.8394L59.3916 30.6617L59.3173 30.5874C59.2686 30.5362 58.1106 29.3628 55.7306 29.3628C53.2736 29.3628 51.6314 30.6438 51.6314 32.555C51.6314 34.6353 53.4709 35.3911 54.9491 35.9957C55.8689 36.3724 56.6657 36.7003 56.6657 37.2255C56.6657 37.7507 56.0559 38.0095 55.4539 38.0095C54.4467 37.981 53.4828 37.594 52.7356 36.9181L52.6075 36.7874L51.2676 38.837L51.347 38.9215C52.4676 39.9593 53.9474 40.5215 55.4744 40.4895C57.8903 40.4895 59.5735 39.1521 59.5735 37.2383C59.5735 35.1349 57.7058 34.3843 56.2071 33.7822" fill="white"/>
        <path d="M30.7279 25.548H27.8457V40.4972H30.7279V25.548Z" fill="white"/>
        <path d="M39.5287 37.8711L39.3493 37.9096C39.2055 37.9346 39.0597 37.9466 38.9138 37.9454C37.2587 37.9454 37.0128 36.8181 37.0128 36.152V31.7019H39.3673V29.3551H37.0179V26.3704H34.1997V29.3551H32.7983V31.7019H34.1383V36.4697C34.1383 38.0377 34.7044 39.1726 35.8215 39.8464C36.6683 40.3103 37.6232 40.541 38.5884 40.5151C38.8631 40.5187 39.1375 40.4972 39.4082 40.451L39.5287 40.428V37.866V37.8711Z" fill="white"/>
      </svg>
    ),
  },
  {
    value: 'VIREMENT', label: 'Virement Bancaire', color: '#1565C0',
    logo: (
      <svg viewBox="0 0 72 52" width="72" height="52">
        <rect width="72" height="52" rx="8" fill="#EEF2FF"/>
        <polygon points="36,7 13,19 59,19" fill="#1565C0"/>
        <rect x="15" y="19" width="7" height="15" rx="1" fill="#1565C0"/>
        <rect x="26" y="19" width="7" height="15" rx="1" fill="#1565C0"/>
        <rect x="39" y="19" width="7" height="15" rx="1" fill="#1565C0"/>
        <rect x="50" y="19" width="7" height="15" rx="1" fill="#1565C0"/>
        <rect x="10" y="34" width="52" height="5" rx="2" fill="#1565C0"/>
        <text x="36" y="47" textAnchor="middle" fontFamily="Arial" fontSize="6.5" fontWeight="700" fill="#1565C0">VIREMENT BANCAIRE</text>
      </svg>
    ),
  },
];

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
  const [reseau,      setReseau]      = useState('MTN');
  const [telephone,   setTelephone]   = useState('');
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
    setReseau('MTN');
    setTelephone('');
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
    const digits = telephone.replace(/\D/g, '');
    if (!digits) { setPayError('Entrez votre numéro de téléphone.'); return; }
    if (digits.length !== 10) { setPayError(`Numéro incomplet — ${digits.length}/10 chiffres saisis.`); return; }
    const telFormate = '+229' + digits;
    setPaying(true);
    setPayError('');
    try {
      if (modalCmd.groupe_vendeur_id) {
        await OrderService.initierPaiementGroupeVendeur(modalCmd.groupe_vendeur_id, { telephone: telFormate, reseau });
      } else if (modalCmd.panier_id) {
        await OrderService.initierPaiementPanier(modalCmd.panier_id, { telephone: telFormate, reseau });
      } else {
        await OrderService.initierPaiementFedaPay({ commande_id: modalCmd.id, mode_paiement: reseau, telephone: telFormate });
      }
      setPaySuccess(true);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Erreur lors du paiement. Réessayez.');
    } finally {
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
                  <h2 style={{ fontWeight: '900', color: '#1a2e10', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Demande envoyée !</h2>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                    Une demande de paiement de <strong>{Number(modalCmd.montant_total || 0).toLocaleString('fr-FR')} FCFA</strong> a été envoyée sur votre téléphone.
                  </p>
                  <p style={{ color: '#d97706', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    Approuvez la transaction sur votre téléphone pour confirmer.
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
                    Votre commande passera en "Paiement sécurisé" après confirmation.
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

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '8px' }}>
                      Moyen de paiement
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {RESEAUX.map(r => (
                        <motion.button
                          key={r.value}
                          onClick={() => setReseau(r.value)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            padding: '10px 8px', borderRadius: '12px', cursor: 'pointer',
                            border: `2px solid ${reseau === r.value ? r.color : '#e5e7eb'}`,
                            background: reseau === r.value ? `${r.color}14` : '#fafafa',
                            transition: 'all 0.15s',
                            boxShadow: reseau === r.value ? `0 0 0 3px ${r.color}30` : 'none',
                          }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {r.logo}
                          <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>{r.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '6px' }}>
                      Numéro de téléphone
                    </label>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: `1.5px solid ${payError ? '#fca5a5' : telephone.length === 10 ? '#16a34a' : '#e5e7eb'}`,
                      borderRadius: '12px', overflow: 'hidden', background: 'white',
                      transition: 'border-color 0.2s',
                    }}>
                      {/* Préfixe pays */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '11px 12px', background: '#f9fafb', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>
                        <span style={{ fontSize: '1rem', lineHeight: 1 }}>🇧🇯</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#374151' }}>+229</span>
                      </div>
                      {/* Champ — chiffres uniquement */}
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="0197XXXXXX"
                        maxLength={10}
                        value={telephone}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setTelephone(v);
                          setPayError('');
                        }}
                        style={{ flex: 1, padding: '11px 10px', border: 'none', fontSize: '0.92rem', color: '#111827', outline: 'none', background: 'transparent', letterSpacing: '0.06em', minWidth: 0 }}
                      />
                      {/* Compteur */}
                      <span style={{ padding: '0 12px', fontSize: '0.72rem', fontWeight: '700', color: telephone.length === 10 ? '#16a34a' : '#9ca3af', flexShrink: 0 }}>
                        {telephone.length}/10
                      </span>
                    </div>
                  </div>

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
