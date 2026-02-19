import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById, createUser, updateUser } from '../lib/db.js';
import { generateToken, authenticateToken } from '../lib/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account.
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, emergencyContacts } = req.body;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'Name, email, password, and phone are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check duplicate email
        if (findUserByEmail(email)) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user record
        const user = createUser({
            id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            passwordHash,
            emergencyContacts: emergencyContacts || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                emergencyContacts: user.emergencyContacts,
            },
        });
    } catch (err) {
        console.error('[Auth] Register error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

/**
 * POST /api/auth/login
 * Authenticate with email & password.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                emergencyContacts: user.emergencyContacts,
            },
        });
    } catch (err) {
        console.error('[Auth] Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

/**
 * GET /api/auth/profile
 * Get the logged-in user's profile.
 */
router.get('/profile', authenticateToken, (req, res) => {
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emergencyContacts: user.emergencyContacts,
        createdAt: user.createdAt,
    });
});

/**
 * PUT /api/auth/profile
 * Update the logged-in user's profile.
 */
router.put('/profile', authenticateToken, (req, res) => {
    const { name, phone, emergencyContacts } = req.body;

    const updated = updateUser(req.user.id, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(emergencyContacts && { emergencyContacts }),
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({
        message: 'Profile updated',
        user: {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            emergencyContacts: updated.emergencyContacts,
        },
    });
});

export default router;
