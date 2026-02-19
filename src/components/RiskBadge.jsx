import '../styles/RiskBadge.css';

export default function RiskBadge({ level, score }) {
  const cls =
    level === 'Low' ? 'risk-badge--low' : level === 'Medium' ? 'risk-badge--med' : 'risk-badge--high';

  return (
    <span className={`risk-badge ${cls}`}>
      {level} {score !== undefined && <span className="risk-badge__score">({score})</span>}
    </span>
  );
}
