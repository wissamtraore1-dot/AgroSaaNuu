// ============================================================
// AgroSaaNuu — User Avatar Component
// src/components/UserAvatar.jsx
// ============================================================
import { useState } from 'react';
import { Star } from 'lucide-react';
import './UserAvatar.css';

export default function UserAvatar({ 
  user, 
  size = 'medium', 
  showName = true, 
  clickable = false,
  onClick = null
}) {
  const [imageError, setImageError] = useState(false);

  // Use uploaded avatar if available, otherwise initials
  const hasAvatar = user?.avatar_url && !imageError;
  const initials = user ? 
    `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <div 
      className={`user-avatar size-${size} ${clickable ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {hasAvatar ? (
        <img
          src={user.avatar_url}
          alt={`${user.first_name} ${user.last_name}`}
          onError={() => setImageError(true)}
          className="avatar-image"
        />
      ) : (
        <div className={`avatar-initials bg-color-${user?.id % 6}`}>
          {initials}
        </div>
      )}

      {showName && (
        <div className="user-info">
          <p className="user-name">
            {user?.first_name} {user?.last_name}
          </p>
          {user?.rating && (
            <div className="user-rating" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {Array.from({ length: Math.floor(user.rating) }).map((_, i) => (
                <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />
              ))}
              <span className="rating-number">{user.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
