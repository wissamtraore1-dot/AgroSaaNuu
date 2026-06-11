import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, ArrowLeft, CheckCircle, AlertCircle,
  Loader, Tag, Package, DollarSign, MapPin, AlignLeft,
  ShieldAlert,
} from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import ProductService from '../../services/product.service';

const GREEN = '#1a5c2a';

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '6px' };

const inputStyle = (focused, name, err) => ({
  width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem',
  border: `1.5px solid ${err ? '#ef4444' : focused === name ? GREEN : '#e5e7eb'}`,
  borderRadius: '12px', fontSize: '0.93rem', outline: 'none',
  color: '#1a2e10', background: focused === name ? '#fafff9' : '#fafafa',
  transition: 'all 0.2s',
  boxShadow: focused === name ? '0 0 0 3px rgba(26,92,42,0.08)' : 'none',
  boxSizing: 'border-box',
});

const iconLeft = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };

export default function AddProduct() {
  const navigate = useNavigate();

  const UNITES = [
    { value: 'KG',       label: 'Kilogramme (kg)'  },
    { value: 'TONNE',    label: 'Tonne (t)'         },
    { value: 'SAC_50KG', label: 'Sac 50 kg'         },
    { value: 'SAC_100KG',label: 'Sac 100 kg'        },
  ];

  const [form, setForm] = useState({
    nom: '', description: '', prix: '', quantite: '', unite: 'KG', categorie: '', ville: '', localisation: '',
  });
  const [image,      setImage]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({});
  const [focused,    setFocused]    = useState('');
  const [profilAlert, setProfilAlert] = useState(false);

  useEffect(() => {
    ProductService.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleImage = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const valider = () => {
    const errs = {};
    if (!form.nom.trim())       errs.nom       = 'Le nom du produit est requis';
    if (!form.prix || Number(form.prix) <= 0) errs.prix = 'Le prix doit être supérieur à 0';
    if (!form.quantite || Number(form.quantite) <= 0) errs.quantite = 'La quantité est requise';
    if (!form.categorie)        errs.categorie = 'La catégorie est requise';
    if (!form.ville.trim())     errs.ville     = 'La ville est requise';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = valider();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nom',          form.nom.trim());
      fd.append('description',  form.description.trim());
      fd.append('prix',         form.prix);
      fd.append('quantite',     form.quantite);
      fd.append('unite',        form.unite);
      fd.append('categorie',    form.categorie);
      fd.append('ville',        form.ville.trim());
      fd.append('localisation', form.localisation.trim());
      if (image) fd.append('image', image);

      await ProductService.creer(fd);
      navigate('/seller/products');
    } catch (err) {
      const data = err.response?.data || {};
      // Gate profil incomplet → rediriger vers la page de complétion
      if (data.profil_incomplet) {
        setProfilAlert(true);
        return;
      }
      setErrors(data.errors || { general: data.message || 'Erreur lors de la création du produit.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Alerte profil incomplet ──
  if (profilAlert) {
    return (
      <DashboardLayout role="seller">
        <div style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fef2f2', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
            <ShieldAlert size={32} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a2e10', marginBottom: '0.6rem' }}>
            Profil incomplet
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Vous devez compléter votre profil (numéro CIP et informations de boutique)
            avant de pouvoir publier un produit.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={() => navigate('/seller/completer-profil')}
              style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '12px', padding: '0.8rem 1.6rem', fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Compléter mon profil
            </motion.button>
            <motion.button
              onClick={() => setProfilAlert(false)}
              style={{ background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '0.8rem 1.6rem', fontWeight: '600', fontSize: '0.92rem', cursor: 'pointer' }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Retour
            </motion.button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="seller">
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <motion.button onClick={() => navigate('/seller/products')}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} color="#374151" />
          </motion.button>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e10', margin: 0 }}>Publier un produit</h1>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>Renseignez les informations de votre produit agricole</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.8rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

            {/* Erreur générale */}
            <AnimatePresence>
              {errors.general && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.84rem', color: '#dc2626', alignItems: 'center' }}
                >
                  <AlertCircle size={15} /> {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Photo du produit */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={labelStyle}>Photo du produit</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', border: `2px dashed ${preview ? GREEN : '#e5e7eb'}`, borderRadius: '16px', height: '180px', cursor: 'pointer', background: preview ? '#f0fdf4' : '#fafafa', overflow: 'hidden', transition: 'all 0.2s' }}>
                {preview
                  ? <img src={preview} alt="aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <>
                      <Upload size={30} color="#9ca3af" />
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Cliquez pour ajouter une photo</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG — max 5 MB</span>
                    </>
                }
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Nom */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nom du produit *</label>
              <div style={{ position: 'relative' }}>
                <Package size={15} color="#9ca3af" style={iconLeft} />
                <input name="nom" type="text" value={form.nom} onChange={handleChange}
                  onFocus={() => setFocused('nom')} onBlur={() => setFocused('')}
                  placeholder="Ex : Maïs blanc 50 kg"
                  style={inputStyle(focused, 'nom', errors.nom)}
                />
              </div>
              {errors.nom && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.nom}</span>}
            </div>

            {/* Prix */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Prix (FCFA) *</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={15} color="#9ca3af" style={iconLeft} />
                <input name="prix" type="number" value={form.prix} onChange={handleChange}
                  onFocus={() => setFocused('prix')} onBlur={() => setFocused('')}
                  placeholder="Ex : 15000" min="1"
                  style={inputStyle(focused, 'prix', errors.prix)}
                />
              </div>
              {errors.prix && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.prix}</span>}
            </div>

            {/* Quantité + Unité côte à côte */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Quantité disponible *</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={15} color="#9ca3af" style={iconLeft} />
                  <input name="quantite" type="number" value={form.quantite} onChange={handleChange}
                    onFocus={() => setFocused('quantite')} onBlur={() => setFocused('')}
                    placeholder="Ex : 500" min="1"
                    style={inputStyle(focused, 'quantite', errors.quantite)}
                  />
                </div>
                {errors.quantite && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.quantite}</span>}
              </div>
              <div>
                <label style={labelStyle}>Unité *</label>
                <div style={{ position: 'relative' }}>
                  <Package size={15} color="#9ca3af" style={iconLeft} />
                  <select name="unite" value={form.unite} onChange={handleChange}
                    onFocus={() => setFocused('unite')} onBlur={() => setFocused('')}
                    style={{ ...inputStyle(focused, 'unite', false), appearance: 'none', cursor: 'pointer' }}
                  >
                    {UNITES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Catégorie */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Catégorie *</label>
              <div style={{ position: 'relative' }}>
                <Tag size={15} color="#9ca3af" style={iconLeft} />
                <select name="categorie" value={form.categorie} onChange={handleChange}
                  onFocus={() => setFocused('categorie')} onBlur={() => setFocused('')}
                  style={{ ...inputStyle(focused, 'categorie', errors.categorie), appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- Choisir une catégorie --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom || c.name}</option>)}
                </select>
              </div>
              {errors.categorie && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.categorie}</span>}
            </div>

            {/* Ville + Localisation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Ville *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#9ca3af" style={iconLeft} />
                  <input name="ville" type="text" value={form.ville} onChange={handleChange}
                    onFocus={() => setFocused('ville')} onBlur={() => setFocused('')}
                    placeholder="Ex : Cotonou"
                    style={inputStyle(focused, 'ville', errors.ville)}
                  />
                </div>
                {errors.ville && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors.ville}</span>}
              </div>
              <div>
                <label style={labelStyle}>Quartier / Localisation</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#9ca3af" style={iconLeft} />
                  <input name="localisation" type="text" value={form.localisation} onChange={handleChange}
                    onFocus={() => setFocused('localisation')} onBlur={() => setFocused('')}
                    placeholder="Ex : Akpakpa"
                    style={inputStyle(focused, 'localisation', false)}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={labelStyle}>Description</label>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '14px', pointerEvents: 'none' }} />
                <textarea name="description" value={form.description} onChange={handleChange}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
                  placeholder="Qualité du produit, conditions de stockage, délai de disponibilité..."
                  rows={4}
                  style={{ width: '100%', padding: '0.82rem 1rem 0.82rem 2.6rem', border: `1.5px solid ${focused === 'desc' ? GREEN : '#e5e7eb'}`, borderRadius: '12px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#1a2e10', background: '#fafafa', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Bouton */}
            <motion.button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.9rem', background: loading ? '#9ca3af' : `linear-gradient(135deg, ${GREEN}, #2d8c47)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.97rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(26,92,42,0.28)', transition: 'opacity 0.2s' }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {loading ? (
                  <motion.span
                    key="loading"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader size={18} />
                    </motion.div>
                    Publication en cours…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CheckCircle size={18} /> Publier le produit
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
