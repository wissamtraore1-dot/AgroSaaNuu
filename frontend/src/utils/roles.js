// ============================================================
// AgroConnect — Roles & Permissions
// src/utils/roles.js
// ============================================================

export const ROLES = {
    BUYER:       'BUYER',
    SELLER:      'SELLER',
    TRANSPORTER: 'TRANSPORTER',
    ADMIN:       'ADMIN',
  };
  
  // Dashboard redirect per role after login
  export const ROLE_DASHBOARDS = {
    [ROLES.BUYER]:       '/buyer/dashboard',
    [ROLES.SELLER]:      '/seller/dashboard',
    [ROLES.TRANSPORTER]: '/transporter/dashboard',
    [ROLES.ADMIN]:       '/admin/dashboard',
  };
  
  // Role display labels
  export const ROLE_LABELS = {
    [ROLES.BUYER]:       'Buyer',
    [ROLES.SELLER]:      'Seller',
    [ROLES.TRANSPORTER]: 'Transporter',
    [ROLES.ADMIN]:       'Administrator',
  };
  
  // Role icons
  export const ROLE_ICONS = {
    [ROLES.BUYER]:       '🛒',
    [ROLES.SELLER]:      '🌾',
    [ROLES.TRANSPORTER]: '🚚',
    [ROLES.ADMIN]:       '⚙️',
  };
  
  // Check if user has a given role
  export const hasRole = (user, role) => user?.role?.toUpperCase() === role?.toUpperCase();
  
  // Get dashboard URL for a user
  export const getDashboard = (user) =>
    ROLE_DASHBOARDS[user?.role?.toUpperCase()] || '/';
