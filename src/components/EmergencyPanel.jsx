import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getContacts,
  saveContacts,
  sendEmergencyAlert,
  getCurrentPosition,
  buildEmergencyMessage,
} from '../services/emergencyService';
import { useSafety } from '../context/SafetyContext';
import { useAuth } from '../context/AuthContext';
import '../styles/EmergencyPanel.css';

const COUNTDOWN_SECONDS = 5;

export default function EmergencyPanel() {
  const { privacyConsent, setPrivacyConsent, setEmergencyMode } = useSafety();
  const { user, token } = useAuth();

  const [localContacts, setLocalContacts] = useState(getContacts);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Use user contacts if logged in, otherwise local storage
  const contacts = user?.emergencyContacts || localContacts;

  // Countdown state
  const [countdown, setCountdown] = useState(null); // null = inactive
  const countdownRef = useRef(null);
  const posRef = useRef(null);

  function addContact() {
    if (!newName.trim() || !newPhone.trim()) return;
    const newContact = { name: newName.trim(), phone: newPhone.trim() };

    // If logged in, this should ideally update profile via API, but for now we encourage profile usage
    if (user) {
      alert('Please update contacts in your Profile page when logged in.');
      return;
    }

    const updated = [...localContacts, newContact];
    setLocalContacts(updated);
    saveContacts(updated);
    setNewName('');
    setNewPhone('');
  }

  function removeContact(idx) {
    if (user) return; // Managed in profile
    const updated = localContacts.filter((_, i) => i !== idx);
    setLocalContacts(updated);
    saveContacts(updated);
  }

  // Start countdown
  async function startCountdown() {
    if (!privacyConsent) {
      alert('Please provide location consent before sending an alert.');
      return;
    }
    // Logic refinement: Include unsaved inputs if they are filled and valid
    let finalContacts = [...contacts];
    if (newName.trim() && newPhone.trim()) {
      finalContacts.push({ name: newName.trim(), phone: newPhone.trim() });
    }

    if (!finalContacts.length) {
      alert(user ? 'Add emergency contacts in your Profile.' : 'Please add or enter at least one emergency contact.');
      return;
    }

    // Pre-fetch position during countdown
    try {
      posRef.current = await getCurrentPosition();
    } catch {
      posRef.current = { lat: 13.0827, lng: 80.2707 };
    }

    setCountdown(COUNTDOWN_SECONDS);
    setResult(null);
  }

  // Cancel countdown
  function cancelCountdown() {
    setCountdown(null);
    clearInterval(countdownRef.current);
  }

  const triggerAlert = useCallback(async () => {
    setCountdown(null);
    setSending(true);
    setEmergencyMode(true);

    // Recalculate final contacts including unsaved inputs
    let finalContacts = [...contacts];
    if (newName.trim() && newPhone.trim()) {
      finalContacts.push({ name: newName.trim(), phone: newPhone.trim() });
    }

    try {
      const pos = posRef.current || { lat: 13.0827, lng: 80.2707 };
      const res = await sendEmergencyAlert({
        lat: pos.lat,
        lng: pos.lng,
        contacts: finalContacts,
        message: 'Emergency alert from EmergeX AI user',
        token,
      });
      setResult(res);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setSending(false);
      setTimeout(() => setEmergencyMode(false), 5000);
    }
  }, [contacts, newName, newPhone, setEmergencyMode, token]);

  // Countdown tick
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      triggerAlert();
      return;
    }
    countdownRef.current = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(countdownRef.current);
  }, [countdown, triggerAlert]);



  function openSmsLink() {
    if (!result?.smsLink) return;
    window.open(result.smsLink, '_blank');
  }

  function copyMapLink() {
    if (!result?.mapLink) return;
    navigator.clipboard.writeText(result.mapLink).then(() => {
      alert('Map link copied to clipboard!');
    });
  }

  const isCountingDown = countdown !== null && countdown > 0;

  return (
    <div className="emergency-panel">
      <h3 className="emergency-panel__title">🚨 Emergency Alert</h3>

      {/* Consent toggle */}
      <label className="emergency-panel__consent">
        <input
          type="checkbox"
          checked={privacyConsent}
          onChange={(e) => setPrivacyConsent(e.target.checked)}
        />
        <span>I consent to share my location during emergencies</span>
      </label>

      {/* Contacts */}
      <div className="emergency-panel__contacts">
        <h4>Emergency Contacts</h4>
        {contacts.map((c, i) => (
          <div key={i} className="emergency-panel__contact">
            <span>{c.name} — {c.phone}</span>
            <button onClick={() => removeContact(i)} className="btn btn--sm btn--ghost">✕</button>
          </div>
        ))}
        <div className="emergency-panel__add">
          <input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <button onClick={addContact} className="btn btn--sm btn--outline">Add</button>
        </div>
      </div>

      {/* Countdown timer */}
      {isCountingDown && (
        <div className="emergency-panel__countdown">
          <div className="countdown-ring">
            <svg viewBox="0 0 100 100">
              <circle className="countdown-ring__bg" cx="50" cy="50" r="42" />
              <circle
                className="countdown-ring__progress"
                cx="50"
                cy="50"
                r="42"
                style={{
                  strokeDasharray: 264,
                  strokeDashoffset: 264 * (1 - countdown / COUNTDOWN_SECONDS),
                }}
              />
            </svg>
            <div className="countdown-ring__number">{countdown}</div>
          </div>
          <p className="countdown-label">Sending alert in {countdown}s…</p>
          <button
            className="btn btn--outline btn--sm"
            onClick={cancelCountdown}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Trigger / sending */}
      {!isCountingDown && (
        <button
          onClick={startCountdown}
          disabled={sending}
          className="btn btn--danger btn--lg emergency-panel__trigger"
        >
          {sending ? 'Sending Alert…' : '🆘 Send Emergency Alert'}
        </button>
      )}

      {/* Result + SMS & Map links */}
      {result && (
        <div className={`emergency-panel__result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <>
              <div className="emergency-panel__result-header">
                ✅ Alert {result.alertId} sent to {result.results.length} contact(s)
              </div>

              {/* SMS preview */}
              <div className="emergency-panel__preview">
                <pre>{buildEmergencyMessage(
                  posRef.current?.lat ?? 13.0827,
                  posRef.current?.lng ?? 80.2707
                )}</pre>
              </div>

              <div className="emergency-panel__actions">
                <button className="btn btn--primary btn--sm" onClick={openSmsLink}>
                  📱 Send via SMS
                </button>
                <button className="btn btn--outline btn--sm" onClick={copyMapLink}>
                  📋 Copy Map Link
                </button>
              </div>
            </>
          ) : (
            `Failed: ${result.error}`
          )}
        </div>
      )}
      {/* Debug Location Info */}
      <div className="emergency-panel__debug">
        <small> Sending: {posRef.current ? `${posRef.current.lat.toFixed(4)}, ${posRef.current.lng.toFixed(4)}` : 'Waiting for GPS...'} (Real GPS)</small>
      </div>
    </div>
  );
}
