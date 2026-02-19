import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Auth.css';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/';

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.target);
        try {
            await login(formData.get('email'), formData.get('password'));
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <Navbar />
            <div className="auth-container">
                <div className="auth-card animate-in">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Log in to your EmergeX account</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input name="email" type="email" required placeholder="john@example.com" />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" type="password" required placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className="btn btn--primary btn--lg btn--block">
                            {loading ? 'Logging in…' : 'Log In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        New to EmergeX? <Link to="/signup">Create an account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
