// src/pages/auth/Auth.jsx
// Route /auth — redirige vers la page de connexion
import { Navigate } from 'react-router-dom';

export default function Auth() {
  return <Navigate to="/auth/login" replace />;
}
