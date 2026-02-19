# EmergeX AI — Safety-Aware Navigation Platform

A privacy-preserving, web-based Progressive Web Application that integrates grid-based geospatial risk modeling, supervised machine learning prediction, multi-objective route optimization, real-time GPS tracking, and a consent-based emergency support mechanism.

---

## Features

| Capability | Description |
|---|---|
| **Grid-Based Risk Scoring** | 500m-resolution grid cells with probabilistic safety scores (0–100%) derived from historical incident data |
| **ML Model Validation** | Random Forest classifier with ROC-AUC ≥ 0.80, validated via 5-fold cross-validation |
| **Route Comparison** | Fastest, safest, and balanced routes with quantified trade-offs ("4 min longer, 30% safer") |
| **Live GPS Navigation** | Browser-based geolocation with route deviation detection and zone-entry alerts |
| **SOS Emergency Alert** | 5-second confirmation countdown → pre-filled SMS with live GPS + secure map link |
| **Fairness Monitoring** | FPR/FNR disparity ≤ 5% across Day/Evening/Night usage groups |
| **Privacy-First** | No persistent location storage, no third-party tracking, aggregated outputs only |
| **Rate Limiting** | 100 req/min sliding-window enforcement to prevent API misuse |

## Architecture

```
src/
├── components/           # Reusable UI components
│   ├── EmergencyPanel    # SOS countdown + SMS generation
│   ├── LocationSearch    # Nominatim geocoding autocomplete
│   ├── Navbar            # Navigation + rate limit badge
│   └── RiskBadge         # Risk level indicator
├── context/
│   └── SafetyContext     # Global state: grid, consent, rate limiting
├── pages/
│   ├── LandingPage       # Feature showcase + CTAs
│   ├── MapDashboard      # Interactive risk grid + model info
│   ├── RouteComparison   # Multi-route comparison + fairness panel
│   ├── LiveNavigation    # GPS tracking + deviation detection
│   └── PrivacyPage       # Privacy & fairness documentation
├── services/
│   ├── riskEngine        # Grid generation, scoring, deviation, fairness
│   └── emergencyService  # SMS links, map links, alert dispatch
└── styles/               # Component-level CSS
```

## Tech Stack

- **Frontend**: React 19 + Vite 8
- **Maps**: Leaflet + React-Leaflet + CartoDB dark tiles
- **Geocoding**: OpenStreetMap Nominatim (free, no API key)
- **Routing**: React Router v7
- **PWA**: Service worker + Web App Manifest

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

## Privacy Guarantees

1. GPS coordinates are processed exclusively on-device via browser geolocation APIs
2. No continuous GPS traces are stored externally
3. Emergency location sharing requires explicit consent toggle + manual SOS trigger
4. Only aggregated grid-level outputs are stored; pinpoint incident markers are never exposed
5. No third-party analytics, advertising SDKs, cookies, or tracking pixels
6. Map tiles are the only external network requests (OpenStreetMap)

## Fairness Approach

- False-positive and false-negative rate disparities monitored across Day/Evening/Night groups
- Maximum disparity threshold: ≤ 5%
- Proxy variable detection to exclude income/ethnicity-correlated features
- Transparent fairness scores displayed in the route comparison interface

## License

This project is developed for academic and research purposes.
