import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import RiskBadge from './RiskBadge';
import EmergencyPanel from './EmergencyPanel';
import { useSafety } from '../context/SafetyContext';
import { generateDemoRoutes, scoreRoute, distanceToRoute } from '../services/riskEngine';
import '../styles/LiveNavigation.css';

function FlyTo({ lat, lng }) {
    const map = useMap();
    useEffect(() => { map.flyTo([lat, lng], 15, { duration: 0.8 }); }, [lat, lng, map]);
    return null;
}

export default function LiveNavigationMap({ start, end, onBack }) {
    // Ensure coordinates are arrays [lat, lng]
    const startCoords = [start.lat || start[0], start.lng || start[1]];
    const endCoords = [end.lat || end[0], end.lng || end[1]];

    const { riskGrid } = useSafety();
    const [navigating, setNavigating] = useState(false);
    const [posIndex, setPosIndex] = useState(0);
    const [logs, setLogs] = useState([]);
    const [deviated, setDeviated] = useState(false);
    const [deviationOffset, setDeviationOffset] = useState(null);
    const timerRef = useRef(null);

    // Generate route points based on passed coordinates
    // Use useMemo to avoid regenerating on every render
    const route = useRef(generateDemoRoutes(startCoords[0], startCoords[1], endCoords[0], endCoords[1])[0]).current;
    const { segments } = scoreRoute(route.waypoints, riskGrid);

    // Apply deviation offset if active
    const basePos = route.waypoints[posIndex] || route.waypoints[0];
    const currentPos = deviationOffset
        ? [basePos[0] + deviationOffset[0], basePos[1] + deviationOffset[1]]
        : basePos;

    const currentRisk = segments[posIndex] || { risk: 0, label: 'Low' };

    // Check deviation distance
    const deviationDist = deviationOffset
        ? Math.round(distanceToRoute(currentPos, route.waypoints))
        : 0;

    const addLog = useCallback((msg, color) => {
        setLogs((prev) => [{ msg, color, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));
    }, []);

    function startNav() {
        setNavigating(true);
        setPosIndex(0);
        setLogs([]);
        setDeviated(false);
        setDeviationOffset(null);
        addLog('Navigation started', 'var(--success)');
    }

    function stopNav() {
        setNavigating(false);
        clearInterval(timerRef.current);
        setDeviated(false);
        setDeviationOffset(null);
        addLog('Navigation stopped', 'var(--danger)');
    }

    function simulateDeviation() {
        const offset = [0.003, 0.004]; // ~300m offset
        setDeviationOffset(offset);
        setDeviated(true);
    }

    useEffect(() => {
        if (deviated && deviationOffset) {
            addLog(`⚠ Route deviation detected (${deviationDist}m off course)`, 'var(--danger)');
        }
    }, [deviated, deviationOffset, deviationDist, addLog]);

    function returnToRoute() {
        setDeviationOffset(null);
        setDeviated(false);
        addLog('Returned to planned route', 'var(--success)');
    }

    useEffect(() => {
        if (!navigating) return;
        timerRef.current = setInterval(() => {
            setPosIndex((prev) => {
                const next = prev + 1;
                if (next >= route.waypoints.length) {
                    clearInterval(timerRef.current);
                    setNavigating(false);
                    addLog('Destination reached!', 'var(--success)');
                    return prev;
                }
                const seg = segments[next];
                if (seg && seg.label === 'High') {
                    addLog(`⚠ High-risk zone entered (risk: ${seg.risk})`, 'var(--danger)');
                } else if (seg && seg.label === 'Medium') {
                    addLog(`Moderate risk area (risk: ${seg.risk})`, 'var(--warning)');
                }
                return next;
            });
        }, 1200);
        return () => clearInterval(timerRef.current);
    }, [navigating, route.waypoints.length, segments, addLog]);

    const progress = Math.round((posIndex / (route.waypoints.length - 1)) * 100);
    const safetyScore = 100 - Math.round(segments.reduce((acc, s) => acc + s.risk, 0) / segments.length);

    return (
        <div className="live-nav-map-component">
            <div className="live-nav__body" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Map */}
                <div className="live-nav__map">
                    <MapContainer center={currentPos} zoom={15} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; OSM'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {navigating && <FlyTo lat={currentPos[0]} lng={currentPos[1]} />}
                        <Polyline positions={route.waypoints} pathOptions={{ color: '#22c55e', weight: 4 }} />
                        <CircleMarker
                            center={currentPos}
                            radius={10}
                            pathOptions={{
                                color: deviated ? '#ef4444' : '#3b82f6',
                                fillColor: deviated ? '#ef4444' : '#3b82f6',
                                fillOpacity: 1,
                            }}
                        >
                            <Popup>
                                <strong>Current Position</strong>
                                <br />
                                Risk: {currentRisk.risk} — <RiskBadge level={currentRisk.label} />
                                {deviated && <><br /><span style={{ color: '#ef4444' }}>⚠ Off route by {deviationDist}m</span></>}
                            </Popup>
                        </CircleMarker>
                    </MapContainer>
                </div>

                {/* Sidebar */}
                <aside className="live-nav__sidebar">
                    <button className="btn btn--ghost" onClick={onBack} style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}>
                        ← Back to Route Selection
                    </button>

                    {/* Status */}
                    <div className="nav-status">
                        <div className="nav-status__item">
                            <div className="nav-status__value" style={{ color: 'var(--accent)' }}>{safetyScore}/100</div>
                            <div className="nav-status__label">Safety Score</div>
                        </div>
                        <div className="nav-status__item">
                            <div className="nav-status__value">{progress}%</div>
                            <div className="nav-status__label">Progress</div>
                        </div>
                        <div className="nav-status__item">
                            <div className="nav-status__value">
                                <RiskBadge level={currentRisk.label} />
                            </div>
                            <div className="nav-status__label">Current Zone</div>
                        </div>
                    </div>

                    {/* Deviation warning */}
                    {deviated && (
                        <div className="deviation-warning">
                            <div className="deviation-warning__icon">⚠</div>
                            <div className="deviation-warning__text">
                                Route deviation detected — {deviationDist}m off course
                            </div>
                            <button className="btn btn--sm btn--primary" onClick={returnToRoute}>
                                Return to Route
                            </button>
                        </div>
                    )}

                    {/* Toggle navigation */}
                    <div className="nav-controls">
                        <button
                            className={`nav-toggle ${navigating ? 'nav-toggle--stop' : 'nav-toggle--start'}`}
                            onClick={navigating ? stopNav : startNav}
                        >
                            {navigating ? '■ Stop Navigation' : '▶ Start Navigation'}
                        </button>
                        {navigating && !deviated && (
                            <button
                                className="btn btn--outline btn--sm"
                                onClick={simulateDeviation}
                                style={{ marginTop: '0.5rem', width: '100%' }}
                            >
                                🔀 Simulate Deviation
                            </button>
                        )}
                    </div>

                    {/* Activity log */}
                    <div className="activity-log" style={{ flex: 1, overflowY: 'auto' }}>
                        <div className="activity-log__title">📋 Activity Log</div>
                        <div className="activity-log__list">
                            {logs.length === 0 && (
                                <div className="activity-log__item" style={{ color: 'var(--text-muted)' }}>
                                    Start navigation to see real-time events…
                                </div>
                            )}
                            {logs.map((l, i) => (
                                <div key={i} className="activity-log__item">
                                    <div className="activity-log__dot" style={{ background: l.color }} />
                                    <span>
                                        <strong>{l.time}</strong> — {l.msg}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <EmergencyPanel />
                </aside>
            </div>
        </div>
    );
}
