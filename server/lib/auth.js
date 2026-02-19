import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'emergex_fallback_secret';

/**
 * Generate a JWT token for a user.
 */
export function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Express middleware — verify JWT from Authorization header.
 * Attaches decoded user to `req.user`.
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}
