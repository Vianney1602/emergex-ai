import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import LocationSearch from '../components/LocationSearch';
import LiveNavigationMap from '../components/LiveNavigationMap';
import { useSafety } from '../context/SafetyContext';
import { generateDemoRoutes, scoreRoute, computeFairnessMetrics, fetchMLPrediction } from '../services/riskEngine';
import '../styles/RouteComparison.css';

const DEFAULT_START = { lat: 13.0827, lng: 80.2707, name: 'Chennai Central' };
const DEFAULT_END = { lat: 13.0478, lng: 80.2089, name: 'T. Nagar' };

export default function RouteComparison() {
  const { riskGrid } = useSafety();
  const [selected, setSelected] = useState(1);
  const [startLoc, setStartLoc] = useState(DEFAULT_START);
  const [endLoc, setEndLoc] = useState(DEFAULT_END);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mlScore, setMlScore] = useState(null);
  const [loadingMl, setLoadingMl] = useState(false);

  // Fetch ML Prediction for the selected route
  useEffect(() => {
    async function updateMlScore() {
      setLoadingMl(true);
      const score = await fetchMLPrediction({
        hour: new Date().getHours(),
        lighting_score: 8, // Simplified demo inputs
        police_stn_dist: 2.0,
        past_incidents: 5,
        crowd_density: 7
      });
      setMlScore(score);
      setLoadingMl(false);
    }
    updateMlScore();
  }, [selected, startLoc, endLoc]);

  const routes = useMemo(
    () => generateDemoRoutes(startLoc.lat, startLoc.lng, endLoc.lat, endLoc.lng),
    [startLoc, endLoc]
  );

  const scored = useMemo(
    () =>
      routes.map((r) => {
        const { score, segments } = scoreRoute(r.waypoints, riskGrid);
        return { ...r, safetyScore: score, segments };
      }),
    [routes, riskGrid]
  );

  // Fairness metrics
  const fairness = useMemo(() => computeFairnessMetrics(riskGrid), [riskGrid]);

  // Find the fastest route for quantified comparisons
  const fastest = scored.reduce((a, b) => (a.durationMin <= b.durationMin ? a : b), scored[0]);

  if (isNavigating) {
    return (
      <div className="navigation-page">
        <Navbar />
        <LiveNavigationMap
          start={startLoc}
          end={endLoc}
          onBack={() => setIsNavigating(false)}
        />
      </div>
    );
  }

  return (
    <div className="route-comparison">
      <Navbar />

      <div className="route-comparison__header">
        <h1 className="route-comparison__title">Safety-Aware Route Comparison</h1>
        <p className="route-comparison__subtitle">
          Evaluate routes by predicted safety risk alongside distance and travel time
        </p>
      </div>

      <div className="route-comparison__inputs">
        <LocationSearch
          label="Origin"
          defaultValue={`${DEFAULT_START.name} (${DEFAULT_START.lat}, ${DEFAULT_START.lng})`}
          onSelect={(loc) => setStartLoc(loc)}
        />
        <LocationSearch
          label="Destination"
          defaultValue={`${DEFAULT_END.name} (${DEFAULT_END.lat}, ${DEFAULT_END.lng})`}
          onSelect={(loc) => setEndLoc(loc)}
        />
      </div>

      <div className="route-comparison__content">
        {/* Map */}
        <div className="route-comparison__map">
          <MapContainer
            center={[
              (startLoc.lat + endLoc.lat) / 2,
              (startLoc.lng + endLoc.lng) / 2,
            ]}
            zoom={14}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {scored.map((r) => (
              <Polyline
                key={r.id}
                positions={r.waypoints}
                pathOptions={{
                  color: r.color,
                  weight: r.id === selected ? 5 : 3,
                  opacity: r.id === selected ? 1 : 0.5,
                }}
              >
                <Popup>
                  <strong>{r.name}</strong>
                  <br />
                  Safety Score: {r.safetyScore}/100
                </Popup>
              </Polyline>
            ))}
          </MapContainer>
        </div>

        {/* Side panel */}
        <aside className="route-comparison__panel">
          {scored.map((r) => {
            const level = r.safetyScore >= 70 ? 'Low' : r.safetyScore >= 40 ? 'Medium' : 'High';
            const isFastest = r.id === fastest.id;
            const timeDelta = r.durationMin - fastest.durationMin;
            const safetyDelta = r.safetyScore - fastest.safetyScore;

            return (
              <div
                key={r.id}
                className={`route-card ${r.id === selected ? 'route-card--selected' : ''}`}
                onClick={() => setSelected(r.id)}
              >
                <div className="route-card__header">
                  <div className="route-card__name">
                    <span className="route-card__color" style={{ background: r.color }} />
                    {r.name}
                  </div>
                  <div className="route-card__score" style={{ color: r.color }}>
                    {r.safetyScore}
                  </div>
                </div>
                <div className="route-card__meta">
                  <span>📏 {r.distanceKm} km</span>
                  <span>⏱️ {r.durationMin} min</span>
                  <RiskBadge level={level} />
                </div>

                <div className="route-actions" style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn--sm btn--primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNavigating(true);
                    }}
                  >
                    Start Navigation ➔
                  </button>
                </div>

                {/* Quantified comparison */}
                <div className="route-card__comparison">
                  {isFastest ? (
                    <span className="comparison-badge comparison-badge--fastest">⚡ Fastest route</span>
                  ) : (
                    <span className="comparison-badge">
                      {timeDelta > 0 ? `+${timeDelta} min` : `${timeDelta} min`}
                      {safetyDelta !== 0 && (
                        <>, <span style={{ color: safetyDelta > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {safetyDelta > 0 ? `${safetyDelta}% safer` : `${Math.abs(safetyDelta)}% less safe`}
                        </span></>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Live ML Insight Panel */}
          <div className="ml-insight" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="ml-insight__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>🤖 LIVE ML INSIGHT</span>
              <span className="dot-pulse" style={{ height: '8px', width: '8px', background: 'var(--accent)', borderRadius: '50%', opacity: loadingMl ? 1 : 0.4 }}></span>
            </div>
            <div className="ml-insight__body">
              {loadingMl ? (
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Querying Python Service...</div>
              ) : mlScore !== null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{mlScore}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    Predicted Risk Index <br /> (Random Forest Model)
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>ML Service Offline (Check app.py)</div>
              )}
            </div>
          </div>

          {/* Fairness monitoring panel */}
          <div className="fairness">
            <div className="fairness__title">⚖️ Fairness Monitoring</div>

            <table className="fairness-table">
              <thead>
                <tr>
                  <th>Time Group</th>
                  <th>FPR (%)</th>
                  <th>FNR (%)</th>
                </tr>
              </thead>
              <tbody>
                {fairness.groups.map((g) => (
                  <tr key={g.name}>
                    <td>{g.name}</td>
                    <td>{g.fpr.toFixed(1)}</td>
                    <td>{g.fnr.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fairness__disparity">
              <div className="fairness__bar">
                <div
                  className="fairness__fill"
                  style={{
                    width: `${Math.min(100, (fairness.maxDisparity / fairness.threshold) * 100)}%`,
                    background: fairness.passed ? 'var(--success)' : 'var(--danger)',
                  }}
                />
              </div>
              <div className="fairness__label">
                Max Disparity: {fairness.maxDisparity.toFixed(1)}% / {fairness.threshold}% threshold
                {' — '}
                <span style={{ color: fairness.passed ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {fairness.passed ? '✓ PASS' : '✗ FAIL'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
