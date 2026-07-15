// ============================================================
// AgroSaaNuu — News Detail (Public)
// src/pages/public/NewsDetail.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatPrice';
import NewsService from '../../services/news.service';

const NewsDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    NewsService.getOne(id)
      .then(data => setArticle(data.actualite || data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
      Loading article...
    </div>
  );

  if (!article) return (
    <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
      Article not found
    </div>
  );

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => navigate('/news')}>
        ← Back to News
      </button>

      {/* Cover image */}
      {article.image && (
        <img src={article.image} alt={article.titre} style={styles.cover} />
      )}

      {/* Meta */}
      <div style={styles.meta}>
        {article.categorie_nom && (
          <span style={styles.category}>{article.categorie_nom}</span>
        )}
        <span style={styles.date}>{formatDate(article.created_at, false)}</span>
        {article.auteur_nom && (
          <span style={styles.author}>par {article.auteur_nom}</span>
        )}
      </div>

      {/* Title */}
      <h1 style={styles.title}>{article.titre}</h1>

      {/* Summary */}
      {article.extrait && (
        <p style={styles.summary}>{article.extrait}</p>
      )}

      {/* Body */}
      <div
        style={styles.body}
        dangerouslySetInnerHTML={{ __html: article.contenu }}
      />

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div style={styles.tagsRow}>
          {article.tags.map((tag, i) => (
            <span key={i} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrap:     { maxWidth: '760px', margin: '0 auto', padding: '24px 16px' },
  backBtn:  { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6B7280', marginBottom: '20px', padding: 0 },
  cover:    { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '20px' },
  meta:     { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' },
  category: { background: '#EAF3DE', color: '#3B6D11', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  date:     { fontSize: '13px', color: '#6B7280' },
  author:   { fontSize: '13px', color: '#6B7280' },
  title:    { fontSize: '28px', fontWeight: 700, color: '#1F2937', lineHeight: 1.3, marginBottom: '16px' },
  summary:  { fontSize: '16px', color: '#374151', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '3px solid #16A34A', paddingLeft: '16px', marginBottom: '24px' },
  body:     { fontSize: '15px', color: '#374151', lineHeight: 1.8 },
  tagsRow:  { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' },
  tag:      { background: '#F3F4F6', color: '#374151', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' },
};

export default NewsDetail;
