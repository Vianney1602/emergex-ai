import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/LandingPage.css';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Grid-Based Risk Scoring',
    desc: 'Geospatial grid cells scored probabilistically from historical incident data and temporal patterns — updated periodically.',
  },
  {
    icon: '🔀',
    title: 'Safety-Aware Route Comparison',
    desc: 'Compare route alternatives ranked by both travel efficiency and predictive safety risk, so you never trade safety for speed blindly.',
  },
  {
    icon: '📍',
    title: 'Live GPS Monitoring',
    desc: 'Real-time position tracking with continuous risk assessment. Get alerts when entering higher-risk zones or deviating from your route.',
  },
  {
    icon: '🚨',
    title: 'Consent-Based Emergency Alerts',
    desc: 'SOS with 5-second countdown that generates a pre-filled SMS with live GPS and secure map link — no data leaves without consent.',
  },
  {
    icon: '🔒',
    title: 'Privacy-Preserving Design',
    desc: 'No persistent location storage, no third-party tracking, and aggregated grid outputs only — pinpoint incident markers are never exposed.',
  },
  {
    icon: '⚖️',
    title: 'Fairness-Aware Scoring',
    desc: 'Bias-audited risk models with FPR/FNR disparity monitoring (≤5% threshold) across time-of-travel groups.',
  },
];

const STEPS = [
  { title: 'View the Risk Map', desc: 'Explore your city grid with color-coded safety scores that shift with time of day.' },
  { title: 'Compare Routes', desc: 'Enter origin and destination to see routes ranked by safety score alongside distance and ETA.' },
  { title: 'Navigate Safely', desc: 'Start live GPS navigation and receive real-time risk updates and emergency tools along your route.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <span className="hero__badge animate-in">🛡️ AI-Powered Urban Safety</span>
        <h1 className="hero__title animate-in delay-1">
          Navigate Smarter with <span>Predictive Safety Intelligence</span>
        </h1>
        <p className="hero__subtitle animate-in delay-2">
          EmergeX AI combines grid-based geospatial risk scoring, real-time route comparison,
          and privacy-preserving emergency alerts — empowering every traveler to make safer decisions.
        </p>
        <div className="hero__actions animate-in delay-3">
          <Link to="/map" className="hero__btn hero__btn--primary">
            Open Risk Map
          </Link>
          <Link to="/routes" className="hero__btn hero__btn--outline">
            Compare Routes
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-strip">
        <div className="stat animate-in delay-1">
          <div className="stat__value">400+</div>
          <div className="stat__label">Grid Cells Scored</div>
        </div>
        <div className="stat animate-in delay-2">
          <div className="stat__value">0.83</div>
          <div className="stat__label">ROC-AUC Validated</div>
        </div>
        <div className="stat animate-in delay-3">
          <div className="stat__value">24/7</div>
          <div className="stat__label">Temporal Risk Modeling</div>
        </div>
        <div className="stat animate-in delay-4">
          <div className="stat__value">0</div>
          <div className="stat__label">User Data Stored</div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="features__heading">Core Capabilities</h2>
        <p className="features__sub">
          Every feature is built around one principle: give travelers structured safety intelligence
          without compromising their privacy.
        </p>
        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <div className={`feature-card animate-in delay-${i + 1}`} key={i}>
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <h2 className="how-section__heading">How It Works</h2>
        <div className="how-steps">
          {STEPS.map((s, i) => (
            <div className={`how-step animate-in delay-${i + 1}`} key={i}>
              <div className="how-step__num">{i + 1}</div>
              <div className="how-step__title">{s.title}</div>
              <div className="how-step__desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section animate-in">
        <h2 className="cta-section__heading">Ready to Travel Safer?</h2>
        <p className="cta-section__sub">
          Start exploring the risk map or compare routes now — no sign-up, no data collection.
        </p>
        <Link to="/map" className="hero__btn hero__btn--primary">
          Get Started
        </Link>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} EmergeX AI — Privacy-first urban safety intelligence.
      </footer>
    </div>
  );
}
