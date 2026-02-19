import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSafety } from '../context/SafetyContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import '../styles/NavbarAuth.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { apiRequestCount, rateLimit, rateLimitReached } = useSafety();
  const { user, logout } = useAuth();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/map', label: 'Risk Map' },
    { to: '/routes', label: 'Navigation' },
    { to: '/privacy', label: 'Privacy' },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <img src="/EmergeX img.jpeg" alt="EmergeX Logo" className="navbar__logo-img" style={{ height: '32px', marginRight: '10px' }} />
        <span className="navbar__title">EmergeX AI</span>
      </Link>

      <ul className="navbar__links">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className={`navbar__link ${pathname === l.to ? 'navbar__link--active' : ''}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar__actions">
        {user ? (
          <>
            <Link to="/profile" className="navbar__user">
              👤 {user.name.split(' ')[0]}
            </Link>
            <button onClick={handleLogout} className="navbar__btn navbar__btn--logout">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar__btn navbar__btn--login">
            Log In
          </Link>
        )}
      </div>

      <div className={`navbar__rate ${rateLimitReached ? 'navbar__rate--warn' : ''}`}>
        <span className="navbar__rate-icon">⚡</span>
        <span className="navbar__rate-count">{apiRequestCount}/{rateLimit}</span>
        <span className="navbar__rate-label">req</span>
      </div>
    </nav>
  );
}
