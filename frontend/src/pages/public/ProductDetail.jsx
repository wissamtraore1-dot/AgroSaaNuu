// ============================================================
// AgroConnect — Product Detail (Public)
// src/pages/public/ProductDetail.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../../services/product.service';
import useCart from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';

const ProductDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { handleAddItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty,     setQty]     = useState(1);

  useEffect(() => {
    ProductService.getOne(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
      Loading...
    </div>
  );

  if (!product) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
      Product not found
    </div>
  );

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

      <div style={styles.layout}>
        {/* Image */}
        <div style={styles.imageCol}>
          <img
            src={product.image || '/assets/images/placeholder.png'}
            alt={product.name}
            style={styles.image}
          />
        </div>

        {/* Info */}
        <div style={styles.infoCol}>
          <div style={styles.category}>{product.category_name}</div>
          <h2 style={styles.name}>{product.name}</h2>

          <div style={styles.sellerRow}>
            <div style={styles.sellerAvatar}>
              {product.seller_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={styles.sellerName}>{product.seller_name}</div>
              <div style={styles.sellerLabel}>Seller</div>
            </div>
          </div>

          <div style={styles.price}>{formatPrice(product.price)}</div>

          <div style={{
            ...styles.stockBadge,
            background: product.stock > 0 ? '#EAF3DE' : '#FEF2F2',
            color:      product.stock > 0 ? '#3B6D11'  : '#9B1C1C',
          }}>
            {product.stock > 0
              ? `✓ In stock — ${product.stock} available`
              : '✗ Out of stock'}
          </div>

          {product.description && (
            <p style={styles.description}>{product.description}</p>
          )}

          {/* Qty selector */}
          {product.stock > 0 && (
            <div style={styles.qtyRow}>
              <button
                style={styles.qtyBtn}
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >−</button>
              <span style={styles.qtyVal}>{qty}</span>
              <button
                style={styles.qtyBtn}
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              >+</button>
            </div>
          )}

          <button
            style={{
              ...styles.addBtn,
              opacity: product.stock === 0 ? 0.5 : 1,
              cursor:  product.stock === 0 ? 'not-allowed' : 'pointer',
            }}
            onClick={() => product.stock > 0 && handleAddItem(product, qty)}
            disabled={product.stock === 0}
          >
            🛒 Add to Cart
          </button>

          <div style={styles.escrowNote}>
            🔒 Secure payment — funds released only after delivery
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:         { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
  backBtn:      { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '20px', padding: 0 },
  layout:       { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  imageCol:     { flex: 1, minWidth: '280px' },
  image:        { width: '100%', borderRadius: '16px', objectFit: 'cover', maxHeight: '400px' },
  infoCol:      { flex: 1, minWidth: '280px' },
  category:     { fontSize: '12px', color: '#16A34A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' },
  name:         { fontSize: '26px', fontWeight: 700, color: '#1F2937', marginBottom: '16px' },
  sellerRow:    { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sellerAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  sellerName:   { fontSize: '14px', fontWeight: 600, color: '#1F2937' },
  sellerLabel:  { fontSize: '12px', color: '#6B7280' },
  price:        { fontSize: '28px', fontWeight: 700, color: '#16A34A', marginBottom: '12px' },
  stockBadge:   { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 500, marginBottom: '16px' },
  description:  { fontSize: '14px', color: '#374151', lineHeight: 1.7, marginBottom: '20px' },
  qtyRow:       { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  qtyBtn:       { width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #D1D5DB', background: '#F9FAFB', fontSize: '18px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyVal:       { fontSize: '18px', fontWeight: 700, minWidth: '30px', textAlign: 'center' },
  addBtn:       { width: '100%', padding: '14px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', marginBottom: '12px' },
  escrowNote:   { fontSize: '13px', color: '#6B7280', textAlign: 'center', background: '#F9FAFB', borderRadius: '8px', padding: '10px' },
};

export default ProductDetail;