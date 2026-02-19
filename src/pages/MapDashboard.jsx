import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, useMap } from 'react-leaflet';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import { useSafety } from '../context/SafetyContext';
import { getModelMetrics } from '../services/riskEngine';
import '../styles/MapDashboard.css';

function riskColor(risk) {
  if (risk < 0.3) return 'rgba(34,197,94,0.35)';
  if (risk < 0.6) return 'rgba(245,158,11,0.40)';
  return 'rgba(239,68,68,0.45)';
}

function riskBorder(risk) {
  if (risk < 0.3) return '#22c55e';
  if (risk < 0.6) return '#f59e0b';
  return '#ef4444';
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  map.setView([lat, lng], map.getZoom());
  return null;
}

export default function MapDashboard() {
  const { center, riskGrid, refreshGrid } = useSafety();
  const [hour, setHour] = useState(new Date().getHours());
  const modelMetrics = getModelMetrics();

  const stats = useMemo(() => {
    const low = riskGrid.filter((c) => c.label === 'Low').length;
    const med = riskGrid.filter((c) => c.label === 'Medium').length;
    const high = riskGrid.filter((c) => c.label === 'High').length;
    const avg = (riskGrid.reduce((s, c) => s + c.risk, 0) / riskGrid.length).toFixed(2);
    return { low, med, high, total: riskGrid.length, avg };
  }, [riskGrid]);

  function handleTimeChange(e) {
    const h = parseInt(e.target.value, 10);
    setHour(h);
    refreshGrid(center.lat, center.lng, h);
  }

  const cellDeg = 0.5 / 111.32;

  return (
    <div className="map-dashboard">
      <Navbar />
      <div className="map-dashboard__body">
        {/* Sidebar */}
        <aside className="map-dashboard__sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section__title">🕐 Time Simulation</div>
            <input
              type="range"
              min="0"
              max="23"
              value={hour}
              onChange={handleTimeChange}
              className="time-slider"
            />
            <div className="time-label">
              {hour.toString().padStart(2, '0')}:00
              {hour >= 22 || hour < 5 ? ' — Night (higher risk)' : hour >= 18 ? ' — Evening' : ' — Day'}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section__title">📊 Grid Statistics</div>
            <div className="risk-stats">
              <div className="risk-stat-card">
                <div className="risk-stat-card__value" style={{ color: 'var(--success)' }}>{stats.low}</div>
                <div className="risk-stat-card__label">Low Risk</div>
              </div>
              <div className="risk-stat-card">
                <div className="risk-stat-card__value" style={{ color: 'var(--warning)' }}>{stats.med}</div>
                <div className="risk-stat-card__label">Medium Risk</div>
              </div>
              <div className="risk-stat-card">
                <div className="risk-stat-card__value" style={{ color: 'var(--danger)' }}>{stats.high}</div>
                <div className="risk-stat-card__label">High Risk</div>
              </div>
              <div className="risk-stat-card">
                <div className="risk-stat-card__value">{stats.avg}</div>
                <div className="risk-stat-card__label">Avg Risk</div>
              </div>
            </div>
          </div>

          {/* Model Validation Metrics */}
          <div className="sidebar-section model-info">
            <div className="sidebar-section__title">🤖 Model Validation</div>
            <div className="model-info__grid">
              <div className="model-info__item">
                <div className="model-info__label">Model</div>
                <div className="model-info__value">{modelMetrics.modelType}</div>
              </div>
              <div className="model-info__item">
                <div className="model-info__label">ROC-AUC</div>
                <div className="model-info__value" style={{ color: modelMetrics.rocAuc >= 0.8 ? 'var(--success)' : 'var(--warning)' }}>
                  {modelMetrics.rocAuc.toFixed(2)}
                </div>
              </div>
              <div className="model-info__item">
                <div className="model-info__label">CV Folds</div>
                <div className="model-info__value">{modelMetrics.crossValidationFolds}-fold</div>
              </div>
              <div className="model-info__item">
                <div className="model-info__label">Resolution</div>
                <div className="model-info__value">{modelMetrics.gridResolution}</div>
              </div>
            </div>
            <div className="model-info__features">
              <div className="model-info__label" style={{ marginBottom: '0.3rem' }}>Features</div>
              {modelMetrics.features.map((f) => (
                <span className="model-info__tag" key={f}>{f.replace(/_/g, ' ')}</span>
              ))}
            </div>
            <div className="model-info__refresh">
              Last refreshed: {new Date(modelMetrics.lastRefreshed).toLocaleDateString()}
              {' · '}Every {modelMetrics.refreshIntervalHours}h
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section__title">🏷️ Legend</div>
            <div className="risk-legend">
              <div className="risk-legend__item">
                <div className="risk-legend__dot" style={{ background: '#22c55e' }} />
                Low (0 – 0.29)
              </div>
              <div className="risk-legend__item">
                <div className="risk-legend__dot" style={{ background: '#f59e0b' }} />
                Medium (0.3 – 0.59)
              </div>
              <div className="risk-legend__item">
                <div className="risk-legend__dot" style={{ background: '#ef4444' }} />
                High (0.6 – 1.0)
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section__title">ℹ️ About</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Each grid cell represents a ~0.5 km² area. Risk scores are computed from historical
              incident data with temporal weighting. Night hours (22:00 – 05:00) apply a 1.4× multiplier.
            </p>
          </div>
        </aside>

        {/* Map */}
        <div className="map-dashboard__map">
          <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <RecenterMap lat={center.lat} lng={center.lng} />
            {riskGrid.map((cell, i) => (
              <Rectangle
                key={i}
                bounds={[
                  [cell.lat - cellDeg / 2, cell.lng - cellDeg / 2],
                  [cell.lat + cellDeg / 2, cell.lng + cellDeg / 2],
                ]}
                pathOptions={{
                  color: riskBorder(cell.risk),
                  fillColor: riskColor(cell.risk),
                  fillOpacity: 0.55,
                  weight: 0.5,
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif' }}>
                    <strong>Risk: {cell.risk}</strong>
                    <br />
                    <RiskBadge level={cell.label} />
                    <br />
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {cell.lat.toFixed(4)}, {cell.lng.toFixed(4)}
                    </span>
                  </div>
                </Popup>
              </Rectangle>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
