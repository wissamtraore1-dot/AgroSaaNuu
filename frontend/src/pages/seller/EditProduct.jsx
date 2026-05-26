// ============================================================
// AgroConnect — Edit Product
// src/pages/seller/EditProduct.jsx
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductService from '../../services/product.service';
import { useNotificationContext } from '../../context/NotificationContext';

const EditProduct = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationContext();

  const [form,       setForm]       = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const [image,      setImage]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(true);
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    Promise.all([
      ProductService.getOne(id),
      ProductService.getCategories(),
    ]).then(([product, cats]) => {
      setForm({
        name:        product.name,
        description: product.description || '',
        price:       product.price,
        stock:       product.stock,
        category:    product.category,
      });
      setPreview(product.image);
      setCategories(cats);
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
      await ProductService.update(id, fd);
      success('Product updated successfully!');
      navigate('/seller/products');
    } catch (err) {
      notifyError('Failed to update product');
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>;

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate('/seller/products')}>← My Products</button>
      <h5 style={styles.title}>Edit Product</h5>

      <div style={styles.card}>
        {/* Image */}
        <div style={styles.imageUpload} onClick={() => document.getElementById('edit-img').click()}>
          {preview
            ? <img src={preview} alt="preview" style={styles.imagePreview} />
            : <div style={styles.imagePlaceholder}>📷 Click to change photo</div>}
          <input id="edit-img" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        </div>

        {[
          { name: 'name',  label: 'Product Name',  type: 'text',   placeholder: '' },
          { name: 'price', label: 'Price (FCFA)',   type: 'number', placeholder: '' },
          { name: 'stock', label: 'Stock quantity', type: 'number', placeholder: '' },
        ].map(field => (
          <div key={field.name} style={styles.field}>
            <label style={styles.label}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              style={{ ...styles.input, borderColor: errors[field.name] ? '#E02424' : '#D1D5DB' }}
            />
            {errors[field.name] && <div style={styles.errText}>{errors[field.name]}</div>}
          </div>
        ))}

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
            <option value="">Select a category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...styles.input, resize: 'vertical' }} />
        </div>

        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap:             { padding: '24px 16px', maxWidth: '600px', margin: '0 auto' },
  backBtn:          { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '8px', padding: 0 },
  title:            { fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px' },
  card:             { background: '#fff', borderRadius: '16px', padding: '24px', border: '1.5px solid #E5E7EB' },
  imageUpload:      { width: '100%', height: '180px', borderRadius: '12px', border: '2px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '20px', overflow: 'hidden' },
  imagePreview:     { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: { color: '#9CA3AF', fontSize: '15px' },
  field:            { marginBottom: '16px' },
  label:            { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
  input:            { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #D1D5DB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  errText:          { color: '#E02424', fontSize: '12px', marginTop: '4px' },
  submitBtn:        { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
};

export default EditProduct;