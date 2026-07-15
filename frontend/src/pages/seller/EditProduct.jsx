import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader, Image } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import ProductService from '../../services/product.service';
import { useNotificationContext } from '../../context/NotificationContext';

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const UNITES = [
  { value: 'KG',        label: 'Kilogramme (kg)', parUnite: 'le kilogramme', singulier: 'kilogramme',    pluriel: 'kilogrammes'    },
  { value: 'TONNE',     label: 'Tonne (t)',        parUnite: 'la tonne',      singulier: 'tonne',          pluriel: 'tonnes'         },
  { value: 'SAC_50KG',  label: 'Sac 50 kg',        parUnite: 'le sac de 50 kg',  singulier: 'sac de 50 kg',  pluriel: 'sacs de 50 kg'  },
  { value: 'SAC_100KG', label: 'Sac 100 kg',       parUnite: 'le sac de 100 kg', singulier: 'sac de 100 kg', pluriel: 'sacs de 100 kg' },
];

export default function EditProduct() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { success, error: notifError } = useNotificationContext();

  const [form,       setForm]       = useState({ nom: '', description: '', prix: '', quantite: '', unite: 'KG', categorie: '' });
  const [image,      setImage]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(true);
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    Promise.all([
      ProductService.detail(id),
      ProductService.getCategories(),
    ]).then(([produit, cats]) => {
      setForm({
        nom:         produit.nom         || '',
        description: produit.description || '',
        prix:        produit.prix        || '',
        quantite:    produit.quantite    || '',
        unite:       produit.unite       || 'KG',
        categorie:   produit.categorie   || '',
      });
      setPreview(produit.image || null);
      setCategories(Array.isArray(cats) ? cats : cats.results || []);
    }).catch(() => {
      notifError('Impossible de charger le produit');
    }).finally(() => setFetching(false));
  }, [id]);

  const uniteInfo = UNITES.find(u => u.value === form.unite) || UNITES[0];

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await ProductService.modifier(id, fd);
      success('Produit mis à jour avec succès !');
      navigate('/seller/products');
    } catch (err) {
      notifError('Impossible de modifier le produit');
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout role="seller">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Loader size={28} color={GREEN} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* EN-TÊTE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/seller/products')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.88rem', marginBottom: '0.8rem', padding: 0 }}
          >
            <ArrowLeft size={16} /> Retour à mes produits
          </button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>
            Modifier le produit
          </h1>
        </motion.div>

        {/* FORMULAIRE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.05 }}
          style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb' }}
        >
          {/* PHOTO */}
          <div
            onClick={() => document.getElementById('edit-img').click()}
            style={{ width: '100%', height: '180px', borderRadius: '12px', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '1.2rem', overflow: 'hidden', background: '#fafafa' }}
          >
            {preview
              ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.88rem' }}>
                  <Image size={28} color="#d1d5db" />
                  <span>Cliquez pour changer la photo</span>
                </div>
            }
            <input id="edit-img" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </div>

          {/* NOM */}
          <Field label="Nom du produit" error={errors.nom}>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Ex : Maïs blanc 2T" style={inputStyle(errors.nom)} />
          </Field>

          {/* PRIX + UNITÉ : le vendeur choisit l'unité qui s'applique au prix */}
          <div style={{ marginBottom: '0.3rem' }}>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Prix par unité</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="number" name="prix" value={form.prix} onChange={handleChange} placeholder="Ex : 1500" style={inputStyle(errors.prix)} />
              <select name="unite" value={form.unite} onChange={handleChange} style={inputStyle(errors.unite)}>
                {UNITES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            {errors.prix && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{errors.prix}</div>}
          </div>
          {!errors.prix && form.prix > 0 && (
            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 1rem' }}>
              Soit {Number(form.prix).toLocaleString('fr-FR')} FCFA {uniteInfo.parUnite}
            </p>
          )}

          {/* QUANTITÉ + UNITÉ : même unité que le prix, modifiable ici aussi */}
          <div style={{ marginBottom: '0.3rem' }}>
            <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Quantité disponible</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input type="number" name="quantite" value={form.quantite} onChange={handleChange} placeholder="Ex : 500" style={inputStyle(errors.quantite)} />
              <select name="unite" value={form.unite} onChange={handleChange} style={inputStyle(errors.unite)}>
                {UNITES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            {errors.quantite && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{errors.quantite}</div>}
          </div>
          {!errors.quantite && form.quantite > 0 && (
            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 1rem' }}>
              → {Number(form.quantite).toLocaleString('fr-FR')} {form.quantite == 1 ? uniteInfo.singulier : uniteInfo.pluriel} disponible{form.quantite == 1 ? '' : 's'}
            </p>
          )}

          {/* CATÉGORIE */}
          <Field label="Catégorie" error={errors.categorie}>
            <select name="categorie" value={form.categorie} onChange={handleChange} style={inputStyle(errors.categorie)}>
              <option value="">Sélectionner une catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom || c.name}</option>)}
            </select>
          </Field>

          {/* DESCRIPTION */}
          <Field label="Description" error={errors.description}>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Décrivez votre produit..." style={{ ...inputStyle(errors.description), resize: 'vertical' }} />
          </Field>

          {/* BOUTON */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.9rem', fontWeight: '700', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, marginTop: '0.5rem' }}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.span key="loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}><Loader size={16} /></motion.div>
                  <span> Sauvegarde…</span>
                </motion.span>
              ) : (
                <motion.span key="idle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Save size={16} /><span> Sauvegarder les modifications</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>{label}</label>
      {children}
      {error && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

const inputStyle = (error) => ({
  width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px',
  border: `1.5px solid ${error ? '#dc2626' : '#d1d5db'}`,
  fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
});
