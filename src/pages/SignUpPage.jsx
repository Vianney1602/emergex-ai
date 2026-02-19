import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Auth.css';

export default function SignUpPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await register({
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
            });
            navigate('/profile'); // Go to profile to add emergency contacts
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
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Sign up to enable real-time emergency alerts</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" type="text" required placeholder="John Doe" />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input name="email" type="email" required placeholder="john@example.com" />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input name="phone" type="tel" required placeholder="+1234567890" />
                            <small>Required for emergency callbacks</small>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" type="password" required minLength={6} placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className="btn btn--primary btn--lg btn--block">
                            {loading ? 'Creating Account…' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
