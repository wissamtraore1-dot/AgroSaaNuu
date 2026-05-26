// ============================================================
// AgroConnect — Add Product
// src/pages/seller/AddProduct.jsx
// ============================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../../services/product.service';
import { useNotificationContext } from '../../context/NotificationContext';

const AddProduct = () => {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotificationContext();

  const [form,       setForm]       = useState({ name: '', description: '', price: '', stock: '', category: '' });
  const [image,      setImage]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    ProductService.getCategories().then(setCategories);
  }, []);

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

  const validate = () => {
    const errs = {};
    if (!form.name)        errs.name     = 'Product name is required';
    if (!form.price)       errs.price    = 'Price is required';
    if (Number(form.price) <= 0) errs.price = 'Price must be greater than 0';
    if (!form.stock)       errs.stock    = 'Stock is required';
    if (!form.category)    errs.category = 'Category is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await ProductService.create(fd);
      success('Product added successfully!');
      navigate('/seller/products');
    } catch (err) {
      const e = err.response?.data || {};
      notifyError('Failed to add product');
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate('/seller/products')}>← My Products</button>
      <h5 style={styles.title}>Add New Product</h5>

      <div style={styles.card}>
        {/* Image upload */}
        <div style={styles.imageUpload} onClick={() => document.getElementById('img-input').click()}>
          {preview
            ? <img src={preview} alt="preview" style={styles.imagePreview} />
            : <div style={styles.imagePlaceholder}>📷 Click to add photo</div>}
          <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        </div>

        {/* Fields */}
        {[
          { name: 'name',        label: 'Product Name',   type: 'text',   placeholder: 'e.g. Fresh Tomatoes' },
          { name: 'price',       label: 'Price (FCFA)',    type: 'number', placeholder: '0' },
          { name: 'stock',       label: 'Stock quantity',  type: 'number', placeholder: '0' },
        ].map(field => (
          <div key={field.name} style={styles.field}>
            <label style={styles.label}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              style={{ ...styles.input, borderColor: errors[field.name] ? '#E02424' : '#D1D5DB' }}
            />
            {errors[field.name] && <div style={styles.errText}>{errors[field.name]}</div>}
          </div>
        ))}

        {/* Category */}
        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{ ...styles.input, borderColor: errors.category ? '#E02424' : '#D1D5DB' }}
          >
            <option value="">Select a category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category && <div style={styles.errText}>{errors.category}</div>}
        </div>

        {/* Description */}
        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your product..."
            rows={4}
            style={{ ...styles.input, resize: 'vertical' }}
          />
        </div>

        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product'}
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
  submitBtn:        { width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '8px' },
};

export default AddProduct;