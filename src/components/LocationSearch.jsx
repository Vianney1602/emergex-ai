import { useState, useEffect, useRef } from 'react';
import '../styles/LocationSearch.css';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function LocationSearch({ label, defaultValue, onSelect }) {
    const [query, setQuery] = useState(defaultValue || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);

    // Debounced search
    function handleChange(e) {
        const val = e.target.value;
        setQuery(val);

        clearTimeout(debounceRef.current);
        if (val.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${NOMINATIM_URL}?format=json&limit=5&q=${encodeURIComponent(val)}`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data = await res.json();
                setSuggestions(
                    data.map((d) => ({
                        lat: parseFloat(d.lat),
                        lng: parseFloat(d.lon),
                        name: d.display_name,
                    }))
                );
                setShowDropdown(true);
            } catch {
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    }

    function selectItem(item) {
        setQuery(item.name.split(',').slice(0, 2).join(','));
        setShowDropdown(false);
        onSelect({ lat: item.lat, lng: item.lng, name: item.name });
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="location-search" ref={wrapperRef}>
            {label && <div className="location-search__label">{label}</div>}
            <input
                className="location-search__input"
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder={`Search ${label || 'location'}…`}
            />
            {loading && <div className="location-search__spinner" />}
            {showDropdown && suggestions.length > 0 && (
                <ul className="location-search__dropdown">
                    {suggestions.map((s, i) => (
                        <li key={i} onClick={() => selectItem(s)}>
                            <span className="location-search__pin">📍</span>
                            <span className="location-search__text">{s.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
