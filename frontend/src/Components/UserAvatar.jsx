// ============================================================
// AgroConnect — User Avatar Component
// src/components/UserAvatar.jsx
// ============================================================
import { useState } from 'react';
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
            <div className="user-rating">
              {'⭐'.repeat(Math.floor(user.rating))}
              <span className="rating-number">{user.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
