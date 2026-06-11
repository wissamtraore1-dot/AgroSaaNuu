import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Ce formulaire est intégré dans EnregistrerVehicule (3 étapes complètes).
export default function AddVehicle() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/transporter/enregistrer-vehicule', { replace: true }); }, [navigate]);
  return null;
}
