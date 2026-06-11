import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader, Image } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import ProductService from '../../services/product.service';
import { useNotificationContext } from '../../context/NotificationContext';

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

export default function EditProduct() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { success, error: notifError } = useNotificationContext();

  const [form,       setForm]       = useState({ name: '', description: '', price: '', stock: '', category: '' });
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
        name:        produit.nom        || produit.name        || '',
        description: produit.description                        || '',
        price:       produit.prix       || produit.price       || '',
        stock:       produit.stock                              || '',
        category:    produit.categorie  || produit.category    || '',
      });
      setPreview(produit.image || null);
      setCategories(Array.isArray(cats) ? cats : cats.results || []);
    }).catch(() => {
      notifError('Impossible de charger le produit');
    }).finally(() => setFetching(false));
  }, [id]);

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
          <Field label="Nom du produit" error={errors.name || errors.nom}>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Ex : Maïs blanc 2T" style={inputStyle(errors.name)} />
          </Field>

          {/* PRIX */}
          <Field label="Prix (FCFA)" error={errors.price || errors.prix}>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Ex : 150000" style={inputStyle(errors.price)} />
          </Field>

          {/* STOCK */}
          <Field label="Quantité en stock (kg ou tonnes)" error={errors.stock}>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="Ex : 500" style={inputStyle(errors.stock)} />
          </Field>

          {/* CATÉGORIE */}
          <Field label="Catégorie" error={errors.category || errors.categorie}>
            <select name="category" value={form.category} onChange={handleChange} style={inputStyle(errors.category)}>
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
