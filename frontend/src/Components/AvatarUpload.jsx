// ============================================================
// AgroConnect — Avatar Upload Component
// src/components/AvatarUpload.jsx
// ============================================================
import { useState, useRef } from 'react';
import AuthService from '../services/auth.service';
import './AvatarUpload.css';

export default function AvatarUpload({ currentAvatar, onUploadSuccess }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Sélectionnez une image valide (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await AuthService.modifierProfil(formData);
      
      setSuccess('Avatar mis à jour avec succès!');
      if (onUploadSuccess) {
        onUploadSuccess(response.avatar_url);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'avatar');
      console.error(err);
      setPreview(currentAvatar);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        {preview ? (
          <img src={preview} alt="Avatar preview" className="preview-image" />
        ) : (
          <div className="preview-placeholder">
            <span>📷</span>
            <p>Pas d'avatar</p>
          </div>
        )}
      </div>

      <div className="upload-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
        />

        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ Upload...' : '📁 Changer l\'avatar'}
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
      </div>
    </div>
  );
}
