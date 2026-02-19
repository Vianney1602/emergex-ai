/**
 * EmergeX AI — Consent-based Emergency Alert Service
 *
 * Implements privacy-preserving alerts:
 *  - No location shared until user gives explicit consent
 *  - Configurable contacts
 *  - SOS confirmation countdown
 *  - SMS link generation with secure map link
 *  - Simulated SMS / notification dispatch
 */

const STORAGE_KEY = 'emergex_emergency_contacts';

export function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

/**
 * Generate a Google Maps link for the given coordinates.
 * This is the "secure map link" described in the proposal.
 */
export function generateMapLink(lat, lng) {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Build a pre-filled SMS URI containing the emergency message,
 * live GPS coordinates, and a secure map link.
 * Compatible with mobile `sms:` protocol.
 */
export function generateSmsLink(lat, lng, contacts, customMessage) {
  const mapLink = generateMapLink(lat, lng);
  const body = [
    customMessage || '🚨 Emergency alert from EmergeX AI user',
    '',
    `📍 Live Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    `🗺️ Map: ${mapLink}`,
    '',
    `⏱️ Sent at: ${new Date().toLocaleString()}`,
  ].join('\n');

  const phones = contacts.map((c) => c.phone).join(',');
  // Encode the body for URI safety
  return `sms:${phones}?body=${encodeURIComponent(body)}`;
}

/**
 * Build the emergency SMS text (for preview / clipboard).
 */
export function buildEmergencyMessage(lat, lng) {
  const mapLink = generateMapLink(lat, lng);
  return [
    '🚨 Emergency Alert — EmergeX AI',
    '',
    `📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    `🗺️ Map: ${mapLink}`,
    '',
    `⏱️ Time: ${new Date().toLocaleString()}`,
    '',
    'This alert was sent with explicit user consent via EmergeX AI.',
  ].join('\n');
}


/**
 * Trigger an emergency alert (simulated or real).
 * Returns a promise that resolves with a status object.
 */
export async function sendEmergencyAlert({ lat, lng, contacts, message, token }) {
  if (token) {
    return sendRealAlert({ lat, lng, message, token });
  }

  // Fallback to simulation
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 800));

  const timestamp = new Date().toISOString();
  const mapLink = generateMapLink(lat, lng);

  // In production this would call a backend API
  const results = contacts.map((c) => ({
    contact: c.name,
    phone: c.phone,
    status: 'sent',
    timestamp,
  }));

  console.info('[EmergeX] Emergency alert dispatched (simulated)', {
    location: { lat, lng },
    mapLink,
    message,
    results,
  });

  return {
    success: true,
    alertId: `EMG-${Date.now()}`,
    mapLink,
    smsLink: generateSmsLink(lat, lng, contacts, message),
    results,
  };
}

/**
 * Send real alert via backend API.
 */
async function sendRealAlert({ lat, lng, message, token }) {
  try {
    const res = await fetch('/api/emergency/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lat, lng, message }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send alert');

    return {
      success: data.success,
      alertId: data.alertId,
      mapLink: data.mapLink,
      results: data.results,
      mode: data.mode, // 'live' or 'simulated' (if server lacks creds)
      warning: data.warning,
    };
  } catch (err) {
    console.error('[Emergency] Real alert failed:', err);
    throw err;
  }
}


/**
 * Check whether the browser supports geolocation.
 */
export function isGeolocationAvailable() {
  return 'geolocation' in navigator;
}

/**
 * Request current position with user consent.
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
