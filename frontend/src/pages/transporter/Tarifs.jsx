import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Edit2, Loader, X, Check } from 'lucide-react';
import DashboardLayout from '../../Components/layout/DashboardLayout';
import TransportService from '../../services/transport.service';
import { useNotificationContext } from '../../context/NotificationContext';

const GREEN  = '#1a5c2a';
const fadeUp = { hidden: { y: 18, opacity: 0 }, show: { y: 0, opacity: 1 } };

const VILLES = [
  'Cotonou', 'Porto-Novo', 'Abomey-Calavi', 'Ouidah', 'Bohicon', 'Abomey',
  'Lokossa', 'Parakou', 'Natitingou', 'Djougou', 'Kandi', 'Malanville',
  'Save', 'Bembéréké', 'Nikki',
];

const FORM_VIDE = { ville_depart: '', ville_arrivee: '', tarif: '' };

export default function TransporterTarifs() {
  const { success, error: notifError } = useNotificationContext();
  const [tarifs,     setTarifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(FORM_VIDE);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [supprimant, setSupprimant] = useState(null);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      setLoading(true);
      const data = await TransportService.mesTarifs();
      setTarifs(data.tarifs || []);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModal = (tarif = null) => {
    if (tarif) {
      setForm({ ville_depart: tarif.ville_depart, ville_arrivee: tarif.ville_arrivee, tarif: tarif.tarif });
      setEditId(tarif.id);
    } else {
      setForm(FORM_VIDE);
      setEditId(null);
    }
    setModal(true);
  };

  const fermerModal = () => { setModal(false); setForm(FORM_VIDE); setEditId(null); };

  const handleSauvegarder = async () => {
    if (!form.ville_depart || !form.ville_arrivee || !form.tarif) {
      notifError('Tous les champs sont requis.');
      return;
    }
    if (form.ville_depart === form.ville_arrivee) {
      notifError('La ville de départ et d\'arrivée doivent être différentes.');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await TransportService.modifierTarif(editId, form);
        success('Tarif mis à jour.');
      } else {
        await TransportService.ajouterTarif(form);
        success('Tarif ajouté.');
      }
      fermerModal();
      charger();
    } catch (e) {
      notifError(e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer ce tarif ?')) return;
    setSupprimant(id);
    try {
      await TransportService.supprimerTarif(id);
      success('Tarif supprimé.');
      charger();
    } catch {
      notifError('Impossible de supprimer.');
    } finally {
      setSupprimant(null);
    }
  };

  return (
    <DashboardLayout role="transporter">
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* En-tête */}
        <motion.div variants={fadeUp} initial="hidden" animate="show"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a2e10', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={22} color={GREEN} /> Mes tarifs de livraison
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Définissez vos prix par trajet</p>
          </div>
          <motion.button onClick={() => ouvrirModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', padding: '0.7rem 1.4rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,92,42,0.3)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Plus size={16} /> Ajouter un tarif
          </motion.button>
        </motion.div>

        {/* Tableau */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: '60px', borderRadius: '12px', background: '#f3f4f6' }} />)}
          </div>
        ) : tarifs.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            style={{ background: 'white', borderRadius: '20px', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <MapPin size={48} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>Aucun tarif défini</h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Ajoutez vos prix par trajet pour apparaître dans les résultats de recherche des acheteurs.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              {/* header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 96px', padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Départ</span><span>Arrivée</span><span style={{ textAlign: 'right' }}>Tarif</span><span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {tarifs.map((t, i) => (
                <motion.div key={t.id} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: i * 0.03 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 96px', padding: '14px 16px', borderBottom: i < tarifs.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.9rem' }}>{t.ville_depart}</span>
                  <span style={{ fontWeight: '700', color: '#1a2e10', fontSize: '0.9rem' }}>{t.ville_arrivee}</span>
                  <span style={{ textAlign: 'right', fontWeight: '800', color: GREEN, fontSize: '0.92rem' }}>
                    {Number(t.tarif).toLocaleString('fr-FR')} FCFA
                  </span>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <motion.button onClick={() => ouvrirModal(t)}
                      style={{ padding: '6px 10px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <Edit2 size={13} />
                    </motion.button>
                    <motion.button onClick={() => handleSupprimer(t.id)} disabled={supprimant === t.id}
                      style={{ padding: '6px 10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      {supprimant === t.id ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Modal ajout / modification */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={e => e.target === e.currentTarget && fermerModal()}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{ background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: '800', color: '#1a2e10', margin: 0, fontSize: '1.1rem' }}>
                  {editId ? 'Modifier le tarif' : 'Ajouter un tarif'}
                </h2>
                <button onClick={fermerModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  <X size={20} />
                </button>
              </div>

              {[
                { label: 'Ville de départ', key: 'ville_depart' },
                { label: "Ville d'arrivée", key: 'ville_arrivee' },
              ].map(({ label, key }) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '5px' }}>{label} *</label>
                  <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', color: '#111827', background: 'white', outline: 'none' }}>
                    <option value="">-- Sélectionner --</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.83rem', color: '#374151', marginBottom: '5px' }}>Tarif (FCFA) *</label>
                <input
                  type="number" min="0" value={form.tarif}
                  onChange={e => setForm(f => ({ ...f, tarif: e.target.value }))}
                  placeholder="Ex : 15000"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem', color: '#111827', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={fermerModal}
                  style={{ flex: 1, padding: '0.8rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  Annuler
                </button>
                <motion.button onClick={handleSauvegarder} disabled={saving}
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.8rem', background: `linear-gradient(135deg, ${GREEN}, #2d6a4f)`, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
