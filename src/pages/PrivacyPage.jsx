import Navbar from '../components/Navbar';
import '../styles/PrivacyPage.css';

const SECTIONS = [
  {
    icon: '🔒',
    title: 'No Persistent Location Storage',
    text: `EmergeX AI processes your location data exclusively on-device for real-time risk assessment. 
           Your GPS coordinates are never transmitted to any server or stored in any database. 
           Once you close the application, all location data is permanently discarded.`,
  },
  {
    icon: '✅',
    title: 'Consent-Based Emergency Sharing',
    text: `Location data is shared with your chosen emergency contacts only when:
           <ul>
             <li>You explicitly enable the location consent toggle</li>
             <li>You manually trigger the emergency alert button</li>
             <li>The data is sent directly to your contacts — not through our servers</li>
           </ul>
           You are always in full control of when and with whom your location is shared.`,
  },
  {
    icon: '📊',
    title: 'Differential-Privacy-Inspired Risk Models',
    text: `Our grid-based risk scoring uses aggregated, anonymized historical incident data. 
           Individual reports cannot be reverse-engineered from the published grid scores. 
           The risk model applies noise injection techniques inspired by differential privacy 
           to prevent re-identification of specific incidents.`,
  },
  {
    icon: '⚖️',
    title: 'Fairness-Aware Scoring',
    text: `Risk models are regularly audited for demographic and socioeconomic bias. We employ:
           <ul>
             <li>Equalized-odds constraints to prevent disproportionate flagging of specific neighborhoods</li>
             <li>Proxy variable detection to exclude income or ethnicity-correlated features</li>
             <li>Transparent fairness scores displayed in the route comparison interface</li>
           </ul>`,
  },
  {
    icon: '🚫',
    title: 'No Third-Party Tracking',
    text: `EmergeX AI does not integrate any third-party analytics, advertising SDKs, or tracking pixels. 
           We use no cookies. The application runs entirely in your browser with no external data collection. 
           Map tiles are fetched from OpenStreetMap — the only external network request made.`,
  },
  {
    icon: '📜',
    title: 'Open & Transparent',
    text: `Our risk scoring algorithms, fairness audit methodology, and privacy architecture 
           are fully documented. We believe safety intelligence should be transparent and 
           auditable by the communities it serves.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="privacy">
      <Navbar />

      <section className="privacy__hero">
        <h1>Privacy & Fairness</h1>
        <p>
          EmergeX AI is built on the principle that safety intelligence must never come at the cost
          of personal privacy or equitable treatment.
        </p>
      </section>

      <div className="privacy__content">
        {SECTIONS.map((s, i) => (
          <div className="privacy-section" key={i}>
            <div className="privacy-section__icon">{s.icon}</div>
            <div className="privacy-section__title">{s.title}</div>
            <div
              className="privacy-section__text"
              dangerouslySetInnerHTML={{ __html: s.text }}
            />
          </div>
        ))}
      </div>

      <footer className="footer" style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} EmergeX AI — Privacy-first urban safety intelligence.
      </footer>
    </div>
  );
}
