import { Router } from 'express';
import twilio from 'twilio';
import { findUserById } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = Router();

/**
 * Initialize Twilio client.
 * Returns null if credentials are missing / placeholder.
 */
function getTwilioClient() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token || sid === 'your_account_sid_here' || token === 'your_auth_token_here') {
        return null;
    }
    return twilio(sid, token);
}

/**
 * Build the emergency SMS body.
 */
function buildSmsBody(user, lat, lng) {
    const mapLink = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    return [
        `🚨 EMERGENCY ALERT from ${user.name}`,
        '',
        `📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        `🗺️ Map: ${mapLink}`,
        `📞 Call back: ${user.phone}`,
        '',
        `⏱️ Sent at: ${new Date().toLocaleString()}`,
        '',
        'This alert was sent via EmergeX AI with user consent.',
    ].join('\n');
}

/**
 * POST /api/emergency/alert
 * Send real SMS alerts to the user's emergency contacts via Twilio.
 */
router.post('/alert', authenticateToken, async (req, res) => {
    try {
        const { lat, lng, message } = req.body;

        if (lat == null || lng == null) {
            return res.status(400).json({ error: 'Location (lat, lng) is required' });
        }

        // Get full user record with emergency contacts
        const user = findUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const contacts = user.emergencyContacts || [];
        if (contacts.length === 0) {
            return res.status(400).json({ error: 'No emergency contacts configured. Add contacts in your profile.' });
        }

        const client = getTwilioClient();
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        const smsBody = message || buildSmsBody(user, lat, lng);
        const alertId = `EMG-${Date.now()}`;
        const mapLink = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

        const results = [];

        if (!client) {
            // Twilio not configured — simulate and warn
            console.warn('[Emergency] Twilio not configured — simulating SMS delivery');
            for (const contact of contacts) {
                results.push({
                    contact: contact.name,
                    phone: contact.phone,
                    status: 'simulated',
                    message: 'Twilio credentials not configured — SMS simulated',
                });
            }

            return res.json({
                success: true,
                alertId,
                mapLink,
                mode: 'simulated',
                warning: 'Twilio credentials not configured. Update server/.env with real credentials for live SMS.',
                results,
            });
        }

        // Send real SMS via Twilio
        for (const contact of contacts) {
            try {
                const msg = await client.messages.create({
                    body: smsBody,
                    from: twilioPhone,
                    to: contact.phone,
                });

                results.push({
                    contact: contact.name,
                    phone: contact.phone,
                    status: 'delivered',
                    sid: msg.sid,
                    twilioStatus: msg.status,
                });

                console.log(`[Emergency] SMS sent to ${contact.name} (${contact.phone}) — SID: ${msg.sid}`);
            } catch (err) {
                console.error(`[Emergency] Failed to SMS ${contact.phone}:`, err.message);
                results.push({
                    contact: contact.name,
                    phone: contact.phone,
                    status: 'failed',
                    error: err.message,
                });
            }
        }

        const successCount = results.filter((r) => r.status === 'delivered').length;

        res.json({
            success: successCount > 0,
            alertId,
            mapLink,
            mode: 'live',
            totalContacts: contacts.length,
            delivered: successCount,
            failed: contacts.length - successCount,
            results,
        });
    } catch (err) {
        console.error('[Emergency] Alert error:', err);
        res.status(500).json({ error: 'Failed to send emergency alert' });
    }
});

/**
 * GET /api/emergency/status
 * Check if Twilio is configured and ready.
 */
router.get('/status', authenticateToken, (req, res) => {
    const client = getTwilioClient();
    res.json({
        twilioConfigured: !!client,
        twilioPhone: client ? process.env.TWILIO_PHONE_NUMBER : null,
    });
});

export default router;
