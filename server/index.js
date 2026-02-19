import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import emergencyRoutes from './routes/emergency.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (Updated for production)
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://emergex-ai.vercel.app'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    });
});

export default app;

if (process.env.NODE_ENV !== 'production' || import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        console.log(`[EmergeX Server] Running on http://localhost:${PORT}`);
        console.log(`[EmergeX Server] Twilio configured: ${!!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN !== 'your_auth_token_here')}`);
    });
}
