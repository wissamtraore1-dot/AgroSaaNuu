import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, CheckCircle, ChevronRight,
  Loader, Lock, MapPin, Package, ShoppingBag, Smartphone, Truck, User,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import OrderService from '../../services/order.service';
import CartService from '../../services/cart.service';
import TransportService from '../../services/transport.service';
import { useAuth } from '../../context/AuthContext';

const GREEN = '#1a5c2a';

const MODES_PAIEMENT = [
  { id: 'MTN',    label: 'MTN Mobile Money',  frais: 1   },
  { id: 'MOOV',   label: 'Moov Money',         frais: 1   },
  { id: 'CELTIS', label: 'Celtis Cash',         frais: 0.5 },
  { id: 'BANK',   label: 'Virement bancaire',   frais: 0   },
];

const FRAIS_LIVRAISON_DEFAUT = 5000;

function TransporteurCard({ t, choisi, onSelect, isFallback = false }) {
  const selectionne = choisi?.id === t.transporteur;
  return (
    <button
      onClick={() => onSelect(selectionne ? null : { id: t.transporteur, nom: t.transporteur_nom, tarif: Number(t.tarif) })}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
        border: `2px solid ${selectionne ? GREEN : '#e5e7eb'}`,
        borderRadius: '14px',
        background: selectionne ? '#f0fdf4' : 'white',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Badge fallback */}
      {isFallback && (
        <span style={{
          position: 'absolute', top: '8px', right: '8px',
          background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a',
          borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px',
        }}>
          {t.trajet_fallback === 'Tarif à convenir' ? 'Disponible' : 'Autre trajet'}
        </span>
      )}
      {/* Avatar */}
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {t.transporteur_photo
          ? <img src={t.transporteur_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <User size={20} color="#9ca3af" />}
      </div>
      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1a2e10' }}>{t.transporteur_nom}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Note : {Number(t.note_transporteur || 0).toFixed(1)} ★ · {t.total_missions || 0} missions
        </div>
        {isFallback && t.trajet_fallback && t.trajet_fallback !== 'Tarif à convenir' && (
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
            Tarif pour : {t.trajet_fallback}
          </div>
        )}
      </div>
      {/* Tarif */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: '800', color: GREEN, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
          {Number(t.tarif).toLocaleString('fr-FR')} FCFA
        </div>
        {isFallback && (
          <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
            {t.trajet_fallback === 'Tarif à convenir' ? 'forfaitaire' : 'indicatif'}
          </div>
        )}
      </div>
    </button>
  );
}

export default function Checkout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const lignes = location.state?.lignes || [];

  const [step,               setStep]               = useState(1); // 1=formulaire 2=transporteur 3=traitement 4=succès
  const [mode,               setMode]               = useState('MTN');
  const [adresse,            setAdresse]            = useState('');
  const [villeDepart,        setVilleDepart]        = useState('');
  const [villeArrivee,       setVilleArrivee]       = useState('');
  const [telephone,          setTelephone]          = useState(user?.telephone || '');
  const [note,               setNote]               = useState('');
  const [erreur,             setErreur]             = useState('');
  const [commandes,          setCommandes]          = useState([]);
  const [tarifsDisponibles,  setTarifsDisponibles]  = useState([]);
  const [autresTransporteurs,setAutresTransporteurs]= useState([]);
  const [trajetExact,        setTrajetExact]        = useState(true);
  const [loadingTarifs,      setLoadingTarifs]      = useState(false);
  const [transporteurChoisi, setTransporteurChoisi] = useState(null); // { id, nom, tarif }

  const modeActif      = MODES_PAIEMENT.find(m => m.id === mode);
  const fraisLivraison = transporteurChoisi ? transporteurChoisi.tarif : FRAIS_LIVRAISON_DEFAUT;
  const totalProduits  = lignes.reduce((s, l) => s + Number(l.sous_total || 0), 0);
  const fraisPaiement  = Math.round(totalProduits * (modeActif?.frais || 0) / 100);
  const totalEstime    = totalProduits + fraisLivraison + fraisPaiement;

  useEffect(() => {
    if (lignes.length === 0) navigate('/buyer/cart', { replace: true });
  }, []); // eslint-disable-line

  /* ── Étape 2 : charger les transporteurs disponibles ── */
  const passerEtapeTransporteur = async () => {
    if (!adresse.trim())    return setErreur('Veuillez saisir votre adresse de livraison.');
    if (!telephone.trim())  return setErreur('Veuillez saisir votre numéro de téléphone.');
    setErreur('');

    if (villeDepart && villeArrivee) {
      setLoadingTarifs(true);
      try {
        const res = await TransportService.getTarifsParTrajet({ ville_depart: villeDepart, ville_arrivee: villeArrivee });
        setTarifsDisponibles(res.tarifs || []);
        setAutresTransporteurs(res.autres_tarifs || []);
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

  /* ── Création des commandes ── */
  const handleCommander = async () => {
    setStep(3);

    const creees = [];
    for (const ligne of lignes) {
      try {
        const res = await OrderService.passerCommande({
          produit_id:          ligne.produit_id,
          quantite:            ligne.quantite,
          mode_paiement:       mode,
          adresse_livraison:   adresse.trim(),
          telephone_livraison: telephone.trim(),
          note_acheteur:       note.trim(),
          transporteur_id:     transporteurChoisi?.id || null,
          tarif_livraison:     transporteurChoisi ? transporteurChoisi.tarif : null,
          ville_depart:        villeDepart || '',
          ville_arrivee:       villeArrivee || '',
        });
        creees.push({ ...res.commande, produit_nom: ligne.produit_nom, ok: true });
      } catch (err) {
        const msg = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Erreur inconnue';
        creees.push({ produit_nom: ligne.produit_nom, ok: false, erreur: msg });
      }
    }

    setCommandes(creees);
    if (creees.every(c => c.ok)) {
      try { await CartService.vider(); } catch { /* silencieux */ }

      /* Si Mobile Money → initier paiement FedaPay pour la première commande réussie */
      if (['MTN', 'MOOV', 'CELTIS'].includes(mode)) {
        const premiere = creees.find(c => c.ok && c.id);
        if (premiere?.id) {
          try {
            const payRes = await OrderService.initierPaiementFedaPay({
              commande_id:   premiere.id,
              mode_paiement: mode,
              telephone:     telephone.trim(),
            });
            if (payRes.payment_url) {
              window.location.href = payRes.payment_url;
              return;
            }
          } catch { /* continuer vers l'étape succès même si FedaPay échoue */ }
        }
      }
    }
    setStep(4);
  };

  if (lignes.length === 0) return null;

  const VILLES = [
    'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Ouidah', 'Bohicon', 'Abomey',
    'Lokossa', 'Parakou', 'Natitingou', 'Djougou', 'Kandi', 'Malanville', 'Save', 'Bembéréké', 'Nikki',
  ];

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

            {/* Formulaire gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {erreur && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px' }}>
                  <AlertCircle size={15} /> {erreur}
                </div>
              )}

              {/* Articles commandés */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10' }}>
                  Articles ({lignes.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lignes.map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
                      {l.produit_image ? (
                        <img src={l.produit_image} alt={l.produit_nom} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={22} color="#d1d5db" />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{l.produit_nom}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>Vendeur : {l.vendeur_nom} · Qté : {l.quantite}</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: '800', color: GREEN, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {Number(l.sous_total).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Livraison */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color={GREEN} /> Livraison
                </p>

                <label style={lbl}>Adresse de livraison *</label>
                <textarea
                  value={adresse}
                  onChange={e => setAdresse(e.target.value)}
                  rows={3}
                  placeholder="Ville, quartier, repère..."
                  style={inp}
                />

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
                <input
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  placeholder="+229 XX XX XX XX"
                  style={inp}
                />

                <label style={lbl}>Note au vendeur (optionnel)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  placeholder="Instructions utiles pour la préparation..."
                  style={inp}
                />
              </div>

              {/* Mode de paiement */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', padding: '1.2rem' }}>
                <p style={{ margin: '0 0 1rem', fontWeight: '800', fontSize: '0.95rem', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={16} color={GREEN} /> Mode de paiement
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {MODES_PAIEMENT.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        border: `2px solid ${mode === m.id ? GREEN : '#e5e7eb'}`,
                        background: mode === m.id ? '#f0fdf4' : 'white',
                        fontWeight: '700', fontSize: '0.82rem', color: mode === m.id ? GREEN : '#374151',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Smartphone size={15} />
                      <span>{m.label}</span>
                      {m.frais > 0 && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#9ca3af' }}>+{m.frais}%</span>}
                    </button>
                  ))}
                </div>
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
                  <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Livraison</span>
                  <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{fraisLivraison.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {fraisPaiement > 0 && (
                  <div style={row}>
                    <span style={{ color: '#6b7280', fontSize: '0.83rem' }}>Frais {modeActif?.label}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.83rem' }}>{fraisPaiement.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem', color: '#1a2e10', marginBottom: '1rem' }}>
                <span>Total estimé</span>
                <span style={{ color: GREEN }}>{totalEstime.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.75rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                <Lock size={12} /> Paiement sécurisé — fonds bloqués jusqu'à réception
              </div>

              <button
                onClick={passerEtapeTransporteur}
                style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(26,92,42,0.25)' }}
              >
                <Truck size={17} /> Choisir un transporteur <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}

        {/* ══════════ ÉTAPE 2 : CHOIX TRANSPORTEUR ══════════ */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e5e7eb', padding: '1.8rem' }}>
            <h2 style={{ fontWeight: '800', color: '#1a2e10', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color={GREEN} /> Choisir un transporteur
            </h2>
            <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '1.2rem' }}>
              {villeDepart && villeArrivee ? `Trajet : ${villeDepart} → ${villeArrivee}` : 'Trajet non précisé — frais forfaitaires appliqués.'}
            </p>

            {loadingTarifs ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader size={28} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* ── Transporteurs pour ce trajet exact ── */}
                {tarifsDisponibles.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: '700', color: GREEN, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} /> Transporteurs pour ce trajet
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {tarifsDisponibles.map(t => (
                        <TransporteurCard key={t.id} t={t} choisi={transporteurChoisi} onSelect={setTransporteurChoisi} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Aucun pour ce trajet → fallback ── */}
                {tarifsDisponibles.length === 0 && autresTransporteurs.length === 0 && (
                  <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', marginBottom: '1rem' }}>
                    <Truck size={28} color="#d1d5db" style={{ marginBottom: '8px' }} />
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '4px' }}>Aucun transporteur disponible pour ce trajet.</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Frais forfaitaires : {FRAIS_LIVRAISON_DEFAUT.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                )}

                {/* ── Autres transporteurs (fallback) ── */}
                {tarifsDisponibles.length === 0 && autresTransporteurs.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {/* Bannière d'info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 14px', marginBottom: '12px' }}>
                      <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.8rem', color: '#92400e' }}>
                          Aucun transporteur spécialisé pour {villeDepart} → {villeArrivee}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#b45309' }}>
                          Voici d'autres transporteurs disponibles. Les tarifs affichés sont indicatifs (issus de leurs autres trajets).
                        </p>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.78rem', fontWeight: '700', color: '#6b7280', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={13} /> Autres transporteurs disponibles
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {autresTransporteurs.map(t => (
                        <TransporteurCard key={t.id} t={t} choisi={transporteurChoisi} onSelect={setTransporteurChoisi} isFallback />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {transporteurChoisi && (
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', fontSize: '0.82rem', color: '#166534', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> {transporteurChoisi.nom} sélectionné — {transporteurChoisi.tarif.toLocaleString('fr-FR')} FCFA
              </div>
            )}

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1rem', color: '#1a2e10', marginBottom: '1rem' }}>
              <span>Total</span>
              <span style={{ color: GREEN }}>{totalEstime.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setTransporteurChoisi(null); handleCommander(); }}
                style={{ flex: 1, padding: '0.85rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                Sans transporteur
              </button>
              <button onClick={handleCommander}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.85rem', background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
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

            {/* En-tête résultat */}
            {commandes.every(c => c.ok) ? (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle size={36} color="white" />
                </div>
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: '0 0 6px' }}>
                  {commandes.length === 1 ? 'Commande créée !' : `${commandes.length} commandes créées !`}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Vos fonds sont sécurisés en séquestre. Le vendeur peut maintenant préparer la livraison.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: '0.8rem' }} />
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: '0 0 6px' }}>Résultat partiel</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Certaines commandes ont rencontré une erreur.</p>
              </div>
            )}

            {/* Détail par commande */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
              {commandes.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: c.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${c.ok ? '#bbf7d0' : '#fecaca'}` }}>
                  {c.ok
                    ? <CheckCircle size={18} color="#16a34a" />
                    : <AlertCircle size={18} color="#dc2626" />
                  }
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.88rem', color: '#1a2e10' }}>{c.produit_nom}</p>
                    {c.ok
                      ? <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>Référence : {c.reference}</p>
                      : <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#dc2626' }}>{c.erreur}</p>
                    }
                  </div>
                  {c.ok && (
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', borderRadius: '20px', padding: '2px 10px' }}>
                      Créée
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/buyer/orders')}
                style={{ flex: 1, background: `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShoppingBag size={16} /> Voir mes commandes
              </button>
              <button
                onClick={() => navigate('/buyer/catalog')}
                style={{ flex: 1, background: 'white', color: GREEN, border: `1.5px solid ${GREEN}`, borderRadius: '12px', padding: '0.85rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}

const lbl = { display: 'block', color: '#374151', fontWeight: '700', fontSize: '0.83rem', margin: '12px 0 5px' };
const inp = { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', background: '#fafafa', color: '#1a2e10', outline: 'none', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
