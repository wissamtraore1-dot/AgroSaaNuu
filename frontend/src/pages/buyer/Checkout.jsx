import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, CheckCircle, ChevronRight,
  Eye, Loader, Lock, MapPin, Package, ShoppingBag, Smartphone, Truck, User, X,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import CartService from '../../services/cart.service';
import TransportService from '../../services/transport.service';
import { useAuth } from '../../context/AuthContext';

const GREEN  = '#1a5c2a';
const ORANGE = '#d97706';

const MODES_PAIEMENT = [
  { id: 'MTN',    label: 'MTN Mobile Money', frais: 1   },
  { id: 'MOOV',   label: 'Moov Money',        frais: 1   },
  { id: 'CELTIS', label: 'Celtis Cash',        frais: 0.5 },
  { id: 'BANK',   label: 'Virement bancaire',  frais: 0   },
];

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'TR';

const uniteLabel = (unite, val) => {
  if (unite === 'HEURES') return `${val} heure${val > 1 ? 's' : ''}`;
  if (unite === 'MOIS')   return `${val} mois`;
  return `${val} jour${val > 1 ? 's' : ''}`;
};

const formatDisponibilite = (isoDate) => {
  if (!isoDate) return null;
  const fin = new Date(isoDate);
  const now  = new Date();
  const diffMs = fin - now;
  if (diffMs <= 0) return 'bientôt disponible';
  const diffH = Math.round(diffMs / (1000 * 60 * 60));
  const diffJ = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffH < 24)  return `dans ${diffH}h`;
  if (diffJ === 1) return 'demain';
  if (diffJ <= 60) return `dans ${diffJ} jours`;
  return `le ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
};

/* ── Carte transporteur (réutilisable) ── */
function TransporteurCard({ t, choisi, onSelect, isFallback = false, onVoirProfil }) {
  const selectionne = choisi?.id === t.transporteur;
  return (
    <div style={{
      border: `2px solid ${selectionne ? GREEN : '#e5e7eb'}`,
      borderRadius: '14px',
      background: selectionne ? '#f0fdf4' : 'white',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Badge top-right : "En mission" > "Autre trajet" > "Disponible" */}
      {(t.en_mission || isFallback) && (
        <span style={{
          position: 'absolute', top: '8px', right: '8px',
          background: t.en_mission ? '#fff7ed' : '#fffbeb',
          color:      t.en_mission ? '#c2410c' : '#b45309',
          border:     `1px solid ${t.en_mission ? '#fed7aa' : '#fde68a'}`,
          borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px',
        }}>
          {t.en_mission ? 'En mission' : (t.trajet_fallback === 'Tarif à convenir' ? 'Disponible' : 'Autre trajet')}
        </span>
      )}
      <button
        onClick={() => onSelect(selectionne ? null : { id: t.transporteur, nom: t.transporteur_nom, tarif: Number(t.tarif) })}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 14px 8px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {t.transporteur_photo
            ? <img src={t.transporteur_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <User size={20} color="#9ca3af" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>{t.transporteur_nom}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {Number(t.note_transporteur || 0).toFixed(1)}/5 · {t.total_missions || 0} missions
          </div>
          {t.en_mission && (
            <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: '600', marginTop: '3px' }}>
              {t.fin_mission_estimee
                ? `Disponible ${formatDisponibilite(t.fin_mission_estimee)}`
                : 'Disponibilité à confirmer'}
            </div>
          )}
          {isFallback && !t.en_mission && t.delai_typique != null && (
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600', marginTop: '3px' }}>
              Disponible dans : {uniteLabel(t.delai_typique_unite || 'JOURS', t.delai_typique)}
            </div>
          )}
          {isFallback && t.trajet_fallback && t.trajet_fallback !== 'Tarif à convenir' && (
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>Tarif pour : {t.trajet_fallback}</div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: '800', color: GREEN, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
            {Number(t.tarif).toLocaleString('fr-FR')} FCFA
          </div>
          {isFallback && <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{t.trajet_fallback === 'Tarif à convenir' ? 'forfaitaire' : 'indicatif'}</div>}
        </div>
      </button>

      {t.tarifs_liste?.length > 0 && (
        <div style={{ margin: '0 14px 10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '5px 10px', background: '#f3f4f6', fontSize: '0.67rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <span>Départ</span><span>Arrivée</span><span style={{ textAlign: 'right' }}>Tarif</span>
          </div>
          {t.tarifs_liste.map((tr, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '6px 10px', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem', background: 'white' }}>
              <span style={{ color: '#374151', fontWeight: '600' }}>{tr.ville_depart}</span>
              <span style={{ color: '#374151', fontWeight: '600' }}>{tr.ville_arrivee}</span>
              <span style={{ fontWeight: '800', color: GREEN, whiteSpace: 'nowrap' }}>{Number(tr.tarif).toLocaleString('fr-FR')} FCFA</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '0 14px 10px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onVoirProfil(t)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px 12px', fontSize: '0.73rem', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
        >
          <Eye size={12} /> Voir profil
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const lignes = location.state?.lignes || [];

  /* ── Grouper les lignes par vendeur ── */
  const groupesVendeur = useMemo(() => {
    const map = {};
    for (const l of lignes) {
      const key = l.vendeur_id || l.vendeur_nom;
      if (!map[key]) map[key] = { vendeur_key: key, vendeur_nom: l.vendeur_nom, lignes: [] };
      map[key].lignes.push(l);
    }
    return Object.values(map);
  }, [lignes]);

  const [step,               setStep]               = useState(1);
  const [mode,               setMode]               = useState('MTN');
  const [adresse,            setAdresse]            = useState('');
  const [villeDepart,        setVilleDepart]        = useState('');
  const [villeArrivee,       setVilleArrivee]       = useState('');
  const [indicatif,          setIndicatif]          = useState('+229');
  const [telephone,          setTelephone]          = useState(() => {
    const tel = user?.telephone || '';
    const match = ['+229','+226','+225','+227','+223','+221','+228','+234','+233'].find(c => tel.startsWith(c));
    return match ? tel.slice(match.length).replace(/\D/g, '').slice(0, 10) : tel.replace(/\D/g, '').slice(0, 10);
  });
  const [note,               setNote]               = useState('');
  const [erreur,             setErreur]             = useState('');
  const [commandes,          setCommandes]          = useState([]);

  // Transporteurs disponibles (communs à tous les groupes)
  const [tarifsDisponibles,   setTarifsDisponibles]  = useState([]);
  const [autresTransporteurs, setAutresTransporteurs]= useState([]);
  const [trajetExact,         setTrajetExact]        = useState(true);
  const [loadingTarifs,       setLoadingTarifs]      = useState(false);

  // Un transporteur par groupe vendeur : { vendeur_key: { id, nom, tarif } | null }
  const [transporteursParVendeur, setTransporteursParVendeur] = useState({});

  // Modal profil
  const [profilModal,  setProfilModal]  = useState(null);
  const [loadingProfil,setLoadingProfil]= useState(false);

  const modeActif       = MODES_PAIEMENT.find(m => m.id === mode);
  const totalProduits   = lignes.reduce((s, l) => s + Number(l.sous_total || 0), 0);
  const totalLivraison  = groupesVendeur.reduce((s, g) => {
    const t = transporteursParVendeur[g.vendeur_key];
    return s + (t ? t.tarif : 0);
  }, 0);
  const fraisPaiement   = Math.round(totalProduits * (modeActif?.frais || 0) / 100);
  const toutesLivraisonsDefinies = groupesVendeur.every(g => transporteursParVendeur[g.vendeur_key] !== undefined);
  const totalEstime     = totalProduits + totalLivraison + fraisPaiement;

  const setTransporteurPourVendeur = (vendeur_key, transporteur) => {
    setTransporteursParVendeur(prev => ({ ...prev, [vendeur_key]: transporteur }));
  };

  const ouvrirProfilTransporteur = async (t) => {
    const id = t.transporteur;
    setLoadingProfil(true);
    setProfilModal({ nom: t.transporteur_nom, tarifs: [], zones: [] });
    try {
      const res = await TransportService.getTransporteurProfil(id);
      setProfilModal(res.transporteur);
    } catch {
      setProfilModal({ nom: t.transporteur_nom, ville: '', tarifs: [], zones: [], missions: t.total_missions || 0, note: t.note_transporteur || 0, est_disponible: true });
    } finally {
      setLoadingProfil(false);
    }
  };

  useEffect(() => {
    if (lignes.length === 0) navigate('/buyer/cart', { replace: true });
  }, []); // eslint-disable-line

  /* ── Étape 2 : charger les transporteurs ── */
  const passerEtapeTransporteur = async () => {
    if (!adresse.trim())          return setErreur('Veuillez saisir votre adresse de livraison.');
    if (telephone.length !== 10)  return setErreur('Veuillez saisir exactement 10 chiffres pour le téléphone de contact.');
    setErreur('');

    if (villeDepart && villeArrivee) {
      setLoadingTarifs(true);
      try {
        const res = await TransportService.getTarifsParTrajet({ ville_depart: villeDepart, ville_arrivee: villeArrivee });
        const vu = new Set();
        const dedup = (arr) => (arr || []).filter(t => {
          const cle = (t.transporteur_nom || '').toLowerCase().trim() || t.transporteur;
          if (vu.has(cle)) return false;
          vu.add(cle); return true;
        });
        setTarifsDisponibles(dedup(res.tarifs));
        vu.clear();
        setAutresTransporteurs(dedup(res.autres_tarifs));
        setTrajetExact(res.trajet_exact !== false);
      } catch {
        setTarifsDisponibles([]);
        setAutresTransporteurs([]);
        setTrajetExact(true);
      } finally {
        setLoadingTarifs(false);
      }
    }
    setStep(2);
  };

  /* ── Création des commandes (par groupe vendeur) ── */
  const handleCommander = async () => {
    setStep(3);
    const panierUuid = crypto.randomUUID();
    const creees = [];

    for (const groupe of groupesVendeur) {
      const transporteurChoisi = transporteursParVendeur[groupe.vendeur_key] ?? null;
      const groupeVendeurUuid  = crypto.randomUUID();

      for (let idx = 0; idx < groupe.lignes.length; idx++) {
        const ligne    = groupe.lignes[idx];
        const estPremier = idx === 0;

        try {
          const res = await OrderService.passerCommande({
            produit_id:          ligne.produit_id,
            quantite:            ligne.quantite,
            mode_paiement:       mode,
            adresse_livraison:   adresse.trim(),
            telephone_livraison: `${indicatif}${telephone}`,
            note_acheteur:       note.trim(),
            transporteur_id:     transporteurChoisi?.id || null,
            // Le frais de livraison ne s'applique qu'une fois par groupe vendeur (sur le 1er produit)
            tarif_livraison:     estPremier ? (transporteurChoisi?.tarif ?? null) : 0,
            ville_depart:        villeDepart || '',
            ville_arrivee:       villeArrivee || '',
            panier_id:           panierUuid,
            groupe_vendeur_id:   groupeVendeurUuid,
          });
          creees.push({ ...res.commande, produit_nom: ligne.produit_nom, vendeur_nom: groupe.vendeur_nom, ok: true });
        } catch (err) {
          const msg = err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(' ')
            : err.response?.data?.message || 'Erreur inconnue';
          creees.push({ produit_nom: ligne.produit_nom, vendeur_nom: groupe.vendeur_nom, ok: false, erreur: msg });
        }
      }
    }

    setCommandes(creees);
    if (creees.every(c => c.ok)) {
      try { await CartService.vider(); } catch { /* silencieux */ }
    }
    setStep(4);
  };

  if (lignes.length === 0) return null;

  const VILLES = [
    'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Ouidah', 'Bohicon', 'Abomey',
    'Lokossa', 'Parakou', 'Natitingou', 'Djougou', 'Kandi', 'Malanville', 'Save', 'Bembéréké', 'Nikki',
  ];

  const tousLesTransporteursChoisis = groupesVendeur.every(g => transporteursParVendeur[g.vendeur_key] != null);

  return (
    <DashboardLayout role="buyer">
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Retour */}
        <button
          onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : navigate('/buyer/cart')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '1.2rem' }}
        >
          <ArrowLeft size={15} /> {step === 1 ? 'Retour au panier' : 'Retour'}
        </button>

        <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={20} color={GREEN} /> Finaliser la commande
        </h1>

        {/* ══════════ ÉTAPE 1 : FORMULAIRE ══════════ */}
        {step === 1 && (
          <div className="split-main-sidebar" style={{ alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {erreur && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px' }}>
                  <AlertCircle size={15} /> {erreur}
                </div>
              )}

              {/* Articles groupés par vendeur */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10' }}>
                  Articles ({lignes.length})
                </p>
                {groupesVendeur.map((groupe, gi) => (
                  <div key={groupe.vendeur_key} style={{ marginBottom: gi < groupesVendeur.length - 1 ? '1rem' : 0 }}>
                    {groupesVendeur.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 8px', background: '#f3f4f6', borderRadius: '8px' }}>
                        <Package size={12} color="#9ca3af" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280' }}>Vendeur : {groupe.vendeur_nom}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {groupe.lignes.map(l => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
                          {l.produit_image
                            ? <img src={l.produit_image} alt={l.produit_nom} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={22} color="#d1d5db" /></div>
                          }
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{l.produit_nom}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                              {groupesVendeur.length === 1 && `Vendeur : ${l.vendeur_nom} · `}Qté : {l.quantite}
                            </p>
                          </div>
                          <p style={{ margin: 0, fontWeight: '800', color: GREEN, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            {Number(l.sous_total).toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Livraison */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color={GREEN} /> Livraison
                </p>
                <label style={lbl}>Adresse de livraison *</label>
                <textarea value={adresse} onChange={e => setAdresse(e.target.value)} rows={3} placeholder="Ville, quartier, repère..." style={inp} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={lbl}>Ville de départ (optionnel)</label>
                    <select value={villeDepart} onChange={e => setVilleDepart(e.target.value)} style={inp}>
                      <option value="">-- Sélectionner --</option>
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Ville d'arrivée (optionnel)</label>
                    <select value={villeArrivee} onChange={e => setVilleArrivee(e.target.value)} style={inp}>
                      <option value="">-- Sélectionner --</option>
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0' }}>
                  Indiquez votre trajet pour voir les transporteurs disponibles avec leurs tarifs.
                </p>

                <label style={lbl}>Téléphone de contact *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={indicatif}
                    onChange={e => setIndicatif(e.target.value)}
                    style={{ ...inp, width: 'auto', minWidth: '150px', flexShrink: 0, resize: 'none', cursor: 'pointer' }}
                  >
                    <option value="+229">🇧🇯 +229 Bénin</option>
                    <option value="+226">🇧🇫 +226 Burkina Faso</option>
                    <option value="+225">🇨🇮 +225 Côte d'Ivoire</option>
                    <option value="+227">🇳🇪 +227 Niger</option>
                    <option value="+223">🇲🇱 +223 Mali</option>
                    <option value="+221">🇸🇳 +221 Sénégal</option>
                    <option value="+228">🇹🇬 +228 Togo</option>
                    <option value="+234">🇳🇬 +234 Nigeria</option>
                    <option value="+233">🇬🇭 +233 Ghana</option>
                  </select>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={e => setTelephone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="XX XX XX XX XX"
                      maxLength={10}
                      style={{
                        ...inp,
                        paddingRight: '50px',
                        borderColor: telephone.length === 10 ? '#16a34a' : '#e5e7eb',
                      }}
                    />
                    <span style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.72rem', fontWeight: '700',
                      color: telephone.length === 10 ? '#16a34a' : '#9ca3af',
                      pointerEvents: 'none',
                    }}>
                      {telephone.length}/10
                    </span>
                  </div>
                </div>
                {telephone.length > 0 && telephone.length < 10 && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#d97706', fontWeight: '600' }}>
                    Encore {10 - telephone.length} chiffre{10 - telephone.length > 1 ? 's' : ''} requis
                  </p>
                )}

                <label style={lbl}>Note aux vendeurs (optionnel)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Instructions utiles pour la préparation..." style={inp} />
              </div>
            </div>

            {/* Récapitulatif droite */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '1.4rem', position: 'sticky', top: '80px' }}>
              <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10' }}>Récapitulatif</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <div style={row}>
                  <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Produits ({lignes.length})</span>
                  <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{totalProduits.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={row}>
                  <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>
                    Livraison {groupesVendeur.length > 1 ? `(${groupesVendeur.length} vendeurs)` : ''}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>À définir</span>
                </div>
                {fraisPaiement > 0 && (
                  <div style={row}>
                    <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Frais {modeActif?.label}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{fraisPaiement.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginBottom: '1rem' }}>
                <div style={row}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: '#1a2e10' }}>Sous-total</span>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: GREEN }}>{totalProduits.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#9ca3af' }}>
                  {groupesVendeur.length > 1
                    ? `+ ${groupesVendeur.length} frais de livraison (un par vendeur)`
                    : '+ frais de livraison après choix du transporteur'}
                </p>
              </div>

              {groupesVendeur.length > 1 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.75rem', color: '#92400e', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                  {groupesVendeur.length} vendeurs différents → {groupesVendeur.length} commandes, {groupesVendeur.length} frais de livraison
                </div>
              )}

              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.75rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                <Lock size={12} /> Paiement sécurisé — fonds bloqués jusqu'à réception
              </div>

              <button onClick={passerEtapeTransporteur}
                style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(26,92,42,0.25)' }}
              >
                <Truck size={17} /> Choisir les transporteurs <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════ ÉTAPE 2 : CHOIX TRANSPORTEUR PAR VENDEUR ══════════ */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Info globale */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
              <h2 style={{ fontWeight: '800', color: '#1a2e10', fontSize: '1.1rem', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color={GREEN} /> Choisir les transporteurs
              </h2>
              <p style={{ fontSize: '0.83rem', color: '#6b7280', margin: 0 }}>
                {villeDepart && villeArrivee
                  ? `Trajet : ${villeDepart} → ${villeArrivee}`
                  : 'Trajet non précisé — frais forfaitaires.'}
                {groupesVendeur.length > 1 && ` · Vous avez des produits chez ${groupesVendeur.length} vendeurs différents.`}
              </p>
            </div>

            {/* ── Un bloc par vendeur ── */}
            {groupesVendeur.map((groupe, gi) => {
              const transporteurChoisi = transporteursParVendeur[groupe.vendeur_key] ?? undefined;
              const setTransporteur    = (t) => setTransporteurPourVendeur(groupe.vendeur_key, t);
              const sousTotalGroupe    = groupe.lignes.reduce((s, l) => s + Number(l.sous_total || 0), 0);

              return (
                <div key={groupe.vendeur_key} style={{ background: 'white', borderRadius: '16px', border: `1.5px solid ${transporteurChoisi != null ? '#bbf7d0' : '#e5e7eb'}`, overflow: 'hidden' }}>

                  {/* En-tête groupe */}
                  <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '0.92rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={14} color={GREEN} />
                        Vendeur : {groupe.vendeur_nom}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                        {groupe.lignes.length} article{groupe.lignes.length > 1 ? 's' : ''} —
                        sous-total : <strong>{sousTotalGroupe.toLocaleString('fr-FR')} FCFA</strong>
                      </p>
                    </div>
                    {transporteurChoisi != null && (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} />
                        {transporteurChoisi === null ? 'Sans transporteur' : `${transporteurChoisi.nom} — ${transporteurChoisi.tarif.toLocaleString('fr-FR')} FCFA`}
                      </span>
                    )}
                  </div>

                  {/* Produits du groupe */}
                  <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid #f3f4f6' }}>
                    {groupe.lignes.map(l => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #fafafa' }}>
                        {l.produit_image
                          ? <img src={l.produit_image} alt="" style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={16} color="#d1d5db" /></div>
                        }
                        <span style={{ flex: 1, fontWeight: '600', fontSize: '0.85rem', color: '#1a2e10' }}>{l.produit_nom}</span>
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>×{l.quantite}</span>
                        <span style={{ fontWeight: '700', color: GREEN, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{Number(l.sous_total).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    ))}
                  </div>

                  {/* Liste des transporteurs pour ce groupe */}
                  <div style={{ padding: '1rem 1.2rem' }}>
                    {loadingTarifs ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <Loader size={24} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    ) : (
                      <>
                        {tarifsDisponibles.length > 0 && (
                          <div style={{ marginBottom: '10px' }}>
                            <p style={{ fontSize: '0.76rem', fontWeight: '700', color: GREEN, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> Transporteurs pour ce trajet
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {tarifsDisponibles.map(t => (
                                <TransporteurCard key={t.id} t={t} choisi={transporteurChoisi} onSelect={setTransporteur} onVoirProfil={ouvrirProfilTransporteur} />
                              ))}
                            </div>
                          </div>
                        )}

                        {tarifsDisponibles.length === 0 && autresTransporteurs.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', gap: '6px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '8px 12px', marginBottom: '10px' }}>
                              <AlertCircle size={13} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e' }}>
                                Aucun transporteur spécialisé pour ce trajet — tarifs indicatifs.
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {autresTransporteurs.map(t => (
                                <TransporteurCard key={t.id} t={t} choisi={transporteurChoisi} onSelect={setTransporteur} isFallback onVoirProfil={ouvrirProfilTransporteur} />
                              ))}
                            </div>
                          </div>
                        )}

                        {tarifsDisponibles.length === 0 && autresTransporteurs.length === 0 && (
                          <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                            <Truck size={24} color="#d1d5db" style={{ marginBottom: '6px' }} />
                            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>Aucun transporteur disponible.</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Bouton "Sans transporteur" pour ce groupe */}
                    <button
                      onClick={() => setTransporteur(null)}
                      style={{
                        marginTop: '10px', width: '100%', padding: '8px',
                        background: transporteurChoisi === null ? '#f0fdf4' : '#f9fafb',
                        border: `1.5px solid ${transporteurChoisi === null ? GREEN : '#e5e7eb'}`,
                        borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700',
                        color: transporteurChoisi === null ? GREEN : '#6b7280', cursor: 'pointer',
                      }}
                    >
                      {transporteurChoisi === null ? 'Sans transporteur pour ce vendeur' : 'Commander sans transporteur'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* ── Récapitulatif total et bouton Confirmer ── */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                <div style={row}>
                  <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Sous-total produits</span>
                  <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{totalProduits.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {groupesVendeur.map(g => {
                  const t = transporteursParVendeur[g.vendeur_key];
                  if (t === undefined) return null;
                  return (
                    <div key={g.vendeur_key} style={row}>
                      <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                        Livraison {groupesVendeur.length > 1 ? `(${g.vendeur_nom})` : ''}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '0.82rem', color: t === null ? '#9ca3af' : '#1a2e10' }}>
                        {t === null ? 'Sans transport' : `${t.tarif.toLocaleString('fr-FR')} FCFA`}
                      </span>
                    </div>
                  );
                })}
                {fraisPaiement > 0 && (
                  <div style={row}>
                    <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Frais paiement</span>
                    <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>{fraisPaiement.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1.5px solid #e5e7eb', paddingTop: '10px', marginBottom: '1rem' }}>
                <div style={row}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: '#1a2e10' }}>
                    {toutesLivraisonsDefinies ? 'Total' : 'Sous-total'}
                  </span>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: GREEN }}>
                    {totalEstime.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                {!toutesLivraisonsDefinies && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: ORANGE }}>
                    Choisissez un transporteur (ou "sans transporteur") pour chaque vendeur.
                  </p>
                )}
              </div>

              <button
                onClick={handleCommander}
                disabled={!toutesLivraisonsDefinies}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '0.9rem',
                  background: toutesLivraisonsDefinies
                    ? `linear-gradient(135deg, ${GREEN}, #2d8c47)`
                    : '#e5e7eb',
                  color: toutesLivraisonsDefinies ? 'white' : '#9ca3af',
                  border: 'none', borderRadius: '12px', fontWeight: '700', cursor: toutesLivraisonsDefinies ? 'pointer' : 'not-allowed',
                  boxShadow: toutesLivraisonsDefinies ? '0 4px 16px rgba(26,92,42,0.25)' : 'none',
                }}
              >
                <ShoppingBag size={16} /> Confirmer la commande <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════ ÉTAPE 3 : TRAITEMENT ══════════ */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '3rem', textAlign: 'center' }}>
            <Loader size={40} color={GREEN} style={{ animation: 'spin 1s linear infinite', marginBottom: '1.2rem' }} />
            <p style={{ fontWeight: '700', color: '#1a2e10', fontSize: '1rem' }}>Création de vos commandes en cours…</p>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Veuillez patienter, ne fermez pas cette page.</p>
          </div>
        )}

        {/* ══════════ ÉTAPE 4 : RÉSULTAT ══════════ */}
        {step === 4 && (
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '2rem' }}>
            {commandes.every(c => c.ok) ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle size={36} color="white" />
                </div>
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: '0 0 6px' }}>
                  {groupesVendeur.length === 1 ? 'Commande créée !' : `${groupesVendeur.length} commandes créées !`}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  {groupesVendeur.length === 1
                    ? 'Vos fonds sont sécurisés. Le vendeur peut maintenant préparer la livraison.'
                    : `Une commande par vendeur. Chaque vendeur prépare sa partie.`}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: '0.8rem' }} />
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: '0 0 6px' }}>Résultat partiel</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Certaines commandes ont rencontré une erreur.</p>
              </div>
            )}

            {/* Groupes par vendeur dans le résultat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
              {groupesVendeur.map(groupe => {
                const lignesGroupe = commandes.filter(c => c.vendeur_nom === groupe.vendeur_nom);
                const ok = lignesGroupe.every(c => c.ok);
                return (
                  <div key={groupe.vendeur_key} style={{ borderRadius: '12px', background: ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {ok ? <CheckCircle size={16} color="#16a34a" /> : <AlertCircle size={16} color="#dc2626" />}
                      <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>
                        Vendeur : {groupe.vendeur_nom}
                      </span>
                    </div>
                    {lignesGroupe.map((c, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: c.ok ? '#6b7280' : '#dc2626', marginLeft: '24px', marginTop: '2px' }}>
                        {c.ok ? `${c.produit_nom} — réf. ${c.reference}` : `${c.produit_nom} : ${c.erreur}`}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/buyer/orders')}
                style={{ flex: 1, background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShoppingBag size={16} /> Voir mes commandes
              </button>
              <button onClick={() => navigate('/buyer/catalog')}
                style={{ flex: 1, background: 'white', color: GREEN, border: `1.5px solid ${GREEN}`, borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ══════════ MODAL PROFIL TRANSPORTEUR ══════════ */}
      {profilModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setProfilModal(null)}>
          <div style={{ background: 'white', width: '92%', maxWidth: '480px', borderRadius: '20px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setProfilModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f4f6f4', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="#6b7280" />
            </button>
            {loadingProfil ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader size={28} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#eef7ef', color: GREEN, border: '3px solid #f0c040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', flexShrink: 0 }}>
                    {getInitials(profilModal.nom)}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontWeight: '800', color: '#1a2e10', fontSize: '1.15rem' }}>{profilModal.nom}</h2>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: profilModal.est_disponible ? '#dcfce7' : '#fef3c7', color: profilModal.est_disponible ? '#16a34a' : '#d97706', fontSize: '0.72rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', marginTop: '4px' }}>
                      {profilModal.est_disponible ? 'Disponible' : 'En mission'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', background: '#f9fafb', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                  {[['Note', profilModal.note > 0 ? Number(profilModal.note).toFixed(1) : '—'], ['Missions', profilModal.missions ?? 0], ['Zones', profilModal.zones?.length ?? 0]].map(([label, val], i, arr) => (
                    <div key={label} style={{ flex: 1, textAlign: 'center', padding: '1rem 0.5rem', borderRight: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <div style={{ fontWeight: '800', color: '#1a2e10', fontSize: '1.1rem' }}>{val}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{label}</div>
                    </div>
                  ))}
                </div>
                {profilModal.ville && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f5f5f5', marginBottom: '0.8rem' }}>
                    <MapPin size={15} color={GREEN} />
                    <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.87rem' }}>Basé à {profilModal.ville}</span>
                  </div>
                )}
                {profilModal.zones?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.73rem', fontWeight: '700', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Zones couvertes</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {profilModal.zones.map((z, i) => <span key={i} style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: '600', padding: '3px 10px', borderRadius: '10px' }}>{z}</span>)}
                    </div>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: '0.73rem', fontWeight: '700', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tarifs</p>
                  {!profilModal.tarifs?.length
                    ? <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.83rem' }}>Aucun tarif défini</div>
                    : (
                      <div style={{ background: '#f9fafb', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '8px 12px', background: '#f3f4f6', fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <span>Départ</span><span>Arrivée</span><span style={{ textAlign: 'right' }}>Tarif</span>
                        </div>
                        {profilModal.tarifs.map((t, i) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '9px 12px', borderTop: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: '600', color: '#1a2e10' }}>{t.ville_depart}</span>
                            <span style={{ fontWeight: '600', color: '#1a2e10' }}>{t.ville_arrivee}</span>
                            <span style={{ fontWeight: '800', color: GREEN, whiteSpace: 'nowrap' }}>{Number(t.tarif).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const lbl = { display: 'block', color: '#374151', fontWeight: '700', fontSize: '0.83rem', margin: '12px 0 5px' };
const inp = { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', background: '#fafafa', color: '#1a2e10', outline: 'none', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
