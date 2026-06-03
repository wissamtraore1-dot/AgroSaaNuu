// src/Components/transport/TransportTracker.jsx
// Suivi en temps réel de l'état du transport (statut timeline).
import { Truck, Clock, CheckCircle, XCircle, Package, MapPin } from 'lucide-react';

const GREEN  = '#1a5c2a';
const YELLOW = '#f0c040';

const ETAPES = [
  { statut: 'EN_ATTENTE', label: 'En attente',           Icon: Clock,        color: '#f59e0b' },
  { statut: 'ACCEPTEE',   label: 'Acceptée',             Icon: Package,      color: '#3b82f6' },
  { statut: 'EN_COURS',   label: 'En cours de livraison', Icon: Truck,        color: '#8b5cf6' },
  { statut: 'TERMINEE',   label: 'Livrée',               Icon: CheckCircle,  color: GREEN     },
];

const ORDER = ['EN_ATTENTE', 'ACCEPTEE', 'EN_COURS', 'TERMINEE'];

/**
 * Props:
 *  - mission : objet mission (statut, ville_depart, ville_arrivee, transporteur_nom, date_depart, date_arrivee, tarif_str)
 *  - compact : bool — affichage compact (sans timeline complète)
 */
export default function TransportTracker({ mission, compact = false }) {
  if (!mission) return null;

  const currentIdx = ORDER.indexOf(mission.statut);
  const isAnnulee  = mission.statut === 'ANNULEE';

  if (compact) {
    const current = ETAPES.find(e => e.statut === mission.statut);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: isAnnulee ? '#fef2f2' : `${current?.color}15`, borderRadius: '8px', border: `1px solid ${isAnnulee ? '#fecaca' : `${current?.color}40`}` }}>
        {isAnnulee ? <XCircle size={16} color="#dc2626" /> : current && <current.Icon size={16} color={current.color} />}
        <span style={{ fontSize: '0.84rem', fontWeight: '600', color: isAnnulee ? '#dc2626' : current?.color }}>
          {isAnnulee ? 'Annulée' : current?.label}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#6b7280', marginLeft: '4px' }}>
          {mission.ville_depart} → {mission.ville_arrivee}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '1.2rem', marginTop: '1rem' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1a2e10', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={16} color={GREEN} /> Suivi du transport
          </h4>
          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
            Transporteur : <strong>{mission.transporteur_nom}</strong>
          </p>
        </div>
        {mission.tarif_str && (
          <span style={{ fontWeight: '800', color: GREEN, fontSize: '1rem' }}>{mission.tarif_str}</span>
        )}
      </div>

      {/* Itinéraire */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', background: '#f9fafb', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.84rem', color: '#374151' }}>
        <MapPin size={14} color="#9ca3af" />
        <strong>{mission.ville_depart}</strong>
        <span style={{ flex: 1, height: '1px', background: '#d1d5db', margin: '0 4px' }} />
        <Truck size={14} color={GREEN} />
        <span style={{ flex: 1, height: '1px', background: '#d1d5db', margin: '0 4px' }} />
        <MapPin size={14} color={GREEN} />
        <strong style={{ color: GREEN }}>{mission.ville_arrivee}</strong>
      </div>

      {/* Timeline des statuts */}
      {isAnnulee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', background: '#fef2f2', padding: '0.7rem 1rem', borderRadius: '10px' }}>
          <XCircle size={18} /> <span style={{ fontWeight: '600' }}>Mission annulée</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {ETAPES.map((etape, idx) => {
            const done    = idx < currentIdx;
            const current = idx === currentIdx;
            const future  = idx > currentIdx;
            return (
              <div key={etape.statut} style={{ display: 'flex', alignItems: 'center', flex: idx < ETAPES.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: done ? GREEN : current ? etape.color : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: current ? `0 0 0 4px ${etape.color}25` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    <etape.Icon size={16} color={done || current ? 'white' : '#9ca3af'} />
                  </div>
                  <span style={{ fontSize: '0.68rem', marginTop: '4px', textAlign: 'center', color: done ? GREEN : current ? etape.color : '#9ca3af', fontWeight: current ? '700' : '400', lineHeight: 1.2 }}>
                    {etape.label}
                  </span>
                </div>
                {idx < ETAPES.length - 1 && (
                  <div style={{ flex: 1, height: '3px', background: done ? GREEN : '#e5e7eb', marginBottom: '18px', transition: 'background 0.3s' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dates */}
      {(mission.date_depart || mission.date_arrivee) && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '1rem', fontSize: '0.78rem', color: '#6b7280', flexWrap: 'wrap' }}>
          {mission.date_depart && (
            <span>Départ : <strong>{new Date(mission.date_depart).toLocaleString('fr-FR')}</strong></span>
          )}
          {mission.date_arrivee && (
            <span>Arrivée : <strong>{new Date(mission.date_arrivee).toLocaleString('fr-FR')}</strong></span>
          )}
        </div>
      )}
    </div>
  );
}
