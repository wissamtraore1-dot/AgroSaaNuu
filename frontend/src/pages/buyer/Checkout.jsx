import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, CheckCircle, ChevronRight,
  Loader, Lock, MapPin, Shield, ShoppingCart, Smartphone, Truck,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import ProductService from '../../services/product.service';
import OrderService from '../../services/order.service';
import CompleteProfileModal, { isProfileComplete } from '../../Components/common/CompleteProfileModal';
import { useAuth } from '../../context/AuthContext';

const modesPaiement = [
  { id: 'MTN', label: 'MTN Mobile Money', frais: 1 },
  { id: 'MOOV', label: 'Moov Money', frais: 1 },
  { id: 'CELTIS', label: 'Celtis Cash', frais: 0.5 },
  { id: 'BANK', label: 'Virement bancaire', frais: 0 },
];

const normalizeProduct = (data) => {
  const product = data?.produit || data;
  const mainImage = product?.images?.find((img) => img.est_principale)?.image || product?.images?.[0]?.image;
  return product ? {
    id: product.id,
    nom: product.nom,
    vendeur: product.vendeur_nom || 'Vendeur',
    localisation: product.ville || product.localisation || 'Benin',
    prix: Number(product.prix || 0),
    quantiteDisponible: Number(product.quantite || 0),
    image: mainImage || 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=240&q=80',
  } : null;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  const [showProfileModal, setShowProfileModal] = useState(!isProfileComplete(user));

  const [product, setProduct] = useState(null);
  const [step, setStep] = useState(1);
  const [modeSelect, setModeSelect] = useState('MTN');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [note, setNote] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      if (!productId) {
        setError('Aucun produit selectionne.');
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        const data = await ProductService.detail(productId);
        if (active) setProduct(normalizeProduct(data));
      } catch {
        if (active) setError('Impossible de charger ce produit.');
      } finally {
        if (active) setPageLoading(false);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  const modeActif = modesPaiement.find((m) => m.id === modeSelect);
  const prixProduit = product ? product.prix * quantite : 0;
  const fraisPaiement = modeActif ? Math.round(prixProduit * modeActif.frais / 100) : 0;
  const fraisLivraison = 5000;
  const total = prixProduit + fraisPaiement + fraisLivraison;

  const canOrder = useMemo(
    () => product && quantite > 0 && quantite <= product.quantiteDisponible,
    [product, quantite],
  );

  const handleCreateOrder = async () => {
    if (!adresse.trim()) return setError('Veuillez entrer votre adresse de livraison.');
    if (!telephone.trim()) return setError('Veuillez entrer votre numero de telephone.');
    if (!canOrder) return setError('Quantite indisponible.');

    try {
      setLoading(true);
      setError('');
      const orderData = await OrderService.passerCommande({
        produit_id: product.id,
        quantite,
        mode_paiement: modeSelect,
        adresse_livraison: adresse,
        telephone_livraison: telephone,
        note_acheteur: note,
      });
      setCreatedOrder(orderData.commande);
      setStep(2);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? Object.values(apiErrors).flat().join(' ') : err.response?.data?.message || 'Commande impossible.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!createdOrder) return;

    try {
      setLoading(true);
      setError('');
      const paymentData = await OrderService.initiatePaiement({
        commande_id: createdOrder.id,
        mode_paiement: modeSelect,
      });
      await OrderService.confirmPaiement({
        paiement_id: paymentData.paiement.id,
        transaction_id: `DEV-${Date.now()}`,
      });
      setStep(3);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setError(apiErrors ? Object.values(apiErrors).flat().join(' ') : err.response?.data?.message || 'Paiement impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="buyer">
      {/* Modal de complétion de profil si CIP / nom manquant */}
      {showProfileModal && (
        <CompleteProfileModal
          onComplete={() => setShowProfileModal(false)}
          onClose={() => navigate(-1)}
        />
      )}
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Retour
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Finaliser ma commande</h1>
          <p style={styles.subtitle}>Le paiement est bloque en sequestre jusqu'a confirmation de livraison.</p>
        </div>

        {pageLoading ? (
          <div style={styles.card}><Loader size={18} /> Chargement du produit...</div>
        ) : error && !product ? (
          <div style={styles.errorBox}><AlertCircle size={16} /> {error}</div>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              {error && <div style={styles.errorBox}><AlertCircle size={16} /> {error}</div>}

              {step === 1 && (
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}><Truck size={18} /> Livraison</h2>
                  <label style={styles.label}>Quantite</label>
                  <input
                    type="number"
                    min="1"
                    max={product.quantiteDisponible || 1}
                    value={quantite}
                    onChange={(event) => setQuantite(Number(event.target.value))}
                    style={styles.input}
                  />

                  <label style={styles.label}>Adresse de livraison</label>
                  <textarea
                    value={adresse}
                    onChange={(event) => setAdresse(event.target.value)}
                    rows={3}
                    style={styles.input}
                    placeholder="Ville, quartier, repere..."
                  />

                  <label style={styles.label}>Telephone de contact</label>
                  <input
                    value={telephone}
                    onChange={(event) => setTelephone(event.target.value)}
                    style={styles.input}
                    placeholder="+229 XX XX XX XX"
                  />

                  <label style={styles.label}>Note au vendeur</label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={2}
                    style={styles.input}
                    placeholder="Instructions utiles pour la preparation..."
                  />

                  <div style={styles.infoBox}>
                    <Shield size={18} />
                    Votre argent reste protege jusqu'a la reception confirmee.
                  </div>

                  <button style={styles.primaryBtn} onClick={handleCreateOrder} disabled={loading}>
                    {loading ? <Loader size={18} /> : <>Creer la commande <ChevronRight size={16} /></>}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}><Lock size={18} /> Paiement</h2>
                  <div style={styles.paymentGrid}>
                    {modesPaiement.map((mode) => (
                      <button
                        key={mode.id}
                        style={{
                          ...styles.paymentMode,
                          borderColor: modeSelect === mode.id ? '#1a5c2a' : '#e5e7eb',
                          background: modeSelect === mode.id ? '#f0fdf4' : '#fff',
                        }}
                        onClick={() => setModeSelect(mode.id)}
                      >
                        <Smartphone size={17} />
                        <span>{mode.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={styles.totalBox}>
                    <div style={styles.totalRow}><span>Produit</span><strong>{prixProduit.toLocaleString('fr-FR')} FCFA</strong></div>
                    <div style={styles.totalRow}><span>Livraison</span><strong>{fraisLivraison.toLocaleString('fr-FR')} FCFA</strong></div>
                    <div style={styles.totalRow}><span>Frais paiement</span><strong>{fraisPaiement.toLocaleString('fr-FR')} FCFA</strong></div>
                    <div style={styles.totalFinal}><span>Total</span><strong>{total.toLocaleString('fr-FR')} FCFA</strong></div>
                  </div>

                  <button style={styles.primaryBtn} onClick={handlePay} disabled={loading}>
                    {loading ? <Loader size={18} /> : <>Payer et bloquer en sequestre <Lock size={16} /></>}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div style={{ ...styles.card, textAlign: 'center' }}>
                  <div style={styles.successIcon}><CheckCircle size={42} /></div>
                  <h2 style={styles.cardTitle}>Commande securisee</h2>
                  <p style={styles.subtitle}>
                    La commande {createdOrder?.reference} est payee et le montant est en sequestre.
                    Le vendeur peut maintenant preparer la livraison.
                  </p>
                  <Link to="/buyer/orders" style={styles.linkBtn}>Voir mes commandes</Link>
                </div>
              )}
            </div>

            <div className="col-12 col-lg-4">
              <div style={styles.summary}>
                <h2 style={styles.cardTitle}><ShoppingCart size={18} /> Ma commande</h2>
                <img src={product.image} alt={product.nom} style={styles.productImage} />
                <h3 style={styles.productName}>{product.nom}</h3>
                <div style={styles.meta}><MapPin size={14} /> {product.localisation}</div>
                <div style={styles.meta}>Vendeur: {product.vendeur}</div>
                <div style={styles.meta}>Stock: {product.quantiteDisponible}</div>
                <div style={styles.price}>{total.toLocaleString('fr-FR')} FCFA</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: { maxWidth: '1180px', margin: '0 auto' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #e5e7eb', background: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', marginBottom: 16 },
  header: { marginBottom: 22 },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#1a2e10', margin: 0 },
  subtitle: { color: '#6b7280', fontSize: '.92rem', lineHeight: 1.6, margin: '6px 0 0' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 4px 18px rgba(0,0,0,.05)' },
  cardTitle: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1.05rem', color: '#1a2e10', fontWeight: 800, marginBottom: 18 },
  label: { display: 'block', color: '#374151', fontWeight: 700, fontSize: '.85rem', margin: '14px 0 6px' },
  input: { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 12px', background: '#fafafa', color: '#1a2e10', outline: 'none' },
  infoBox: { display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', borderRadius: 12, padding: 12, fontWeight: 700, fontSize: '.86rem' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: 12, marginBottom: 16 },
  primaryBtn: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#1a5c2a', color: '#fff', border: 0, borderRadius: 12, padding: 13, fontWeight: 800, cursor: 'pointer' },
  paymentGrid: { display: 'grid', gap: 10, marginBottom: 18 },
  paymentMode: { display: 'flex', alignItems: 'center', gap: 10, border: '2px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#fff', fontWeight: 700, cursor: 'pointer' },
  totalBox: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 18 },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#374151' },
  totalFinal: { display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 6, borderTop: '1px solid #e5e7eb', color: '#1a5c2a', fontSize: '1.05rem' },
  successIcon: { width: 78, height: 78, borderRadius: '50%', background: '#1a5c2a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' },
  linkBtn: { display: 'inline-flex', justifyContent: 'center', background: '#1a5c2a', color: '#fff', borderRadius: 12, padding: '12px 18px', fontWeight: 800, textDecoration: 'none', marginTop: 16 },
  summary: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, position: 'sticky', top: 90 },
  productImage: { width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 14 },
  productName: { fontSize: '1rem', color: '#1a2e10', fontWeight: 800, margin: '0 0 10px' },
  meta: { display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: '.85rem', marginBottom: 6 },
  price: { color: '#1a5c2a', fontWeight: 900, fontSize: '1.25rem', marginTop: 14 },
};
