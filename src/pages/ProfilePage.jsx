import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    const nameRef = useRef();
    const phoneRef = useRef();
    const [contacts, setContacts] = useState(user?.emergencyContacts || []);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    if (!user) return null;

    async function handleSave() {
        setSaving(true);
        setMsg(null);
        try {
            await updateProfile({
                name: nameRef.current.value,
                phone: phoneRef.current.value,
                emergencyContacts: contacts,
            });
            setMsg({ type: 'success', text: 'Profile updated successfully' });
            setEditing(false);
        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    }

    function addContact() {
        if (!newName.trim() || !newPhone.trim()) return;
        setContacts([...contacts, { name: newName.trim(), phone: newPhone.trim() }]);
        setNewName('');
        setNewPhone('');
    }

    function removeContact(idx) {
        setContacts(contacts.filter((_, i) => i !== idx));
    }

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container animate-in">
                <header className="profile-header">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="profile-name">{user.name}</h1>
                        <p className="profile-email">{user.email}</p>
                    </div>
                </header>

                {msg && (
                    <div className={`profile-msg profile-msg--${msg.type}`}>
                        {msg.text}
                    </div>
                )}

                <div className="profile-card">
                    <div className="profile-card__header">
                        <h3>Personal Details</h3>
                        {!editing && (
                            <button onClick={() => setEditing(true)} className="btn btn--sm btn--outline">
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="profile-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                ref={nameRef}
                                defaultValue={user.name}
                                disabled={!editing}
                                className={!editing ? 'input--readonly' : ''}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                ref={phoneRef}
                                defaultValue={user.phone}
                                disabled={!editing}
                                className={!editing ? 'input--readonly' : ''}
                            />
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card__header">
                        <h3>Emergency Contacts</h3>
                        <span className="badge">{contacts.length} added</span>
                    </div>

                    <p className="profile-card__sub">
                        These contacts will receive real-time SMS alerts with your location during emergencies.
                    </p>

                    <div className="contact-list">
                        {contacts.map((c, i) => (
                            <div key={i} className="contact-item">
                                <div className="contact-info">
                                    <strong>{c.name}</strong>
                                    <span>{c.phone}</span>
                                </div>
                                {editing && (
                                    <button onClick={() => removeContact(i)} className="btn btn--ghost btn--sm">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        {contacts.length === 0 && (
                            <div className="empty-contacts">No emergency contacts added yet.</div>
                        )}
                    </div>

                    {editing && (
                        <div className="add-contact">
                            <input
                                placeholder="Contact Name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <input
                                placeholder="Phone Number"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                            />
                            <button onClick={addContact} className="btn btn--sm btn--outline">Add</button>
                        </div>
                    )}
                </div>

                {editing && (
                    <div className="profile-actions">
                        <button onClick={() => setEditing(false)} className="btn btn--ghost">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="btn btn--primary">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
