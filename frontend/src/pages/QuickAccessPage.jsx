import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  ExternalLink,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldAlert,
  Shield,
  Clock,
  PhoneCall,
  CheckCircle2,
  Info
} from 'lucide-react';
import { quickAccessApi } from '../services/api';
import '../styles/quick-access.css';

const categoryIcons = {
  Emergency: ShieldAlert,
  'Cyber Safety': ShieldAlert,
  Transport: Navigation,
  'Disaster Management': AlertTriangle,
  'Women & Child Support': Phone,
  'Public Grievance': Building2,
  'Government Office': Building2,
};

const prettyDate = (date) =>
  date &&
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

const phoneLink = (phone) => `tel:${phone.replace(/[^+\d]/g, '')}`;

export default function QuickAccessPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({
    states: [],
    cities: [],
    districts: [],
    categories: [],
  });
  const [values, setValues] = useState({
    search: '',
    category: '',
    state: '',
    city: '',
    district: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [entriesRes, filterRes] = await Promise.all([
        quickAccessApi.getAll(values),
        quickAccessApi.getFilters(),
      ]);
      setEntries(entriesRes.entries || []);
      setFilters(filterRes.filters || { states: [], cities: [], districts: [], categories: [] });
    } catch (err) {
      setError(err.message || 'Quick Access could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(load, 160);
    return () => clearTimeout(timeout);
  }, [values.search, values.category, values.state, values.city, values.district]);

  const update = (key, value) =>
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'state' ? { city: '', district: '' } : {}),
      ...(key === 'city' ? { district: '' } : {}),
    }));

  const availableCities = useMemo(
    () =>
      filters.cities.filter(
        (city) =>
          !values.state ||
          entries.some((entry) => entry.state === values.state && entry.city === city)
      ),
    [filters.cities, values.state, entries]
  );

  const availableDistricts = useMemo(
    () =>
      filters.districts.filter(
        (district) =>
          (!values.state ||
            entries.some(
              (entry) => entry.state === values.state && entry.district === district
            )) &&
          (!values.city ||
            entries.some(
              (entry) => entry.city === values.city && entry.district === district
            ))
      ),
    [filters.districts, values.state, values.city, entries]
  );

  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser.');
      return;
    }
    setLocationMessage('Getting your current location…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationMessage('Location ready for navigation directions.');
      },
      () => {
        setLocationMessage('Location permission was not granted. You can still open directions.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const directionsUrl = (entry) => {
    const params = new URLSearchParams({
      api: '1',
      destination: entry.coordinates?.latitude
        ? `${entry.coordinates.latitude},${entry.coordinates.longitude}`
        : entry.address,
    });
    if (location) params.set('origin', `${location.latitude},${location.longitude}`);
    return `https://www.google.com/maps/dir/?${params}`;
  };

  return (
    <div className="quick-page">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Topbar */}
      <header className="quick-header">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>

        <div className="quick-brand-title">
          <Shield size={18} strokeWidth={2.4} />
          <strong>SevaAI</strong>
          <em>Quick Access Directory</em>
        </div>

        <button
          className="quick-location-button"
          type="button"
          onClick={useLocation}
        >
          <LocateFixed size={16} />
          <span>Use my location</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="quick-main">
        {/* Hero Banner */}
        <section className="quick-hero">
          <div>
            <p>VERIFIED PUBLIC CONTACT DIRECTORY</p>
            <h1>Emergency &amp; Helpline Directory</h1>
            <span>
              Emergency hotlines, government administrative office contacts, and verified office directions from official portals.
            </span>
          </div>
          <ShieldAlert size={54} />
        </section>

        {/* Immediate Emergency 112 Banner */}
        <section className="quick-emergency">
          <div className="emergency-icon-wrap">
            <AlertTriangle size={24} />
          </div>
          <div className="emergency-text-wrap">
            <strong>In an immediate life or safety emergency, call 112</strong>
            <span>
              India’s single national emergency response system for Police, Fire, and Medical Assistance.
            </span>
          </div>
          <a href="tel:112" className="btn-emergency-call">
            <PhoneCall size={16} /> Call 112
          </a>
        </section>

        {/* Directory Section */}
        <section className="quick-directory">
          <div className="quick-directory-heading">
            <div>
              <h2>Public Service Directory</h2>
              <p>Each listing shows its official government source and date last verified.</p>
            </div>
            {locationMessage && <span className="quick-location-note">{locationMessage}</span>}
          </div>

          <div className="quick-filters">
            <label className="quick-search">
              <Search size={18} />
              <input
                value={values.search}
                onChange={(event) => update('search', event.target.value)}
                placeholder="Search by name, service, or phone number..."
              />
            </label>

            <select
              value={values.category}
              onChange={(event) => update('category', event.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {filters.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={values.state}
              onChange={(event) => update('state', event.target.value)}
              aria-label="Filter by State or UT"
            >
              <option value="">All States / UTs</option>
              {filters.states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={values.city}
              onChange={(event) => update('city', event.target.value)}
              aria-label="Filter by city"
            >
              <option value="">All Cities</option>
              {availableCities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={values.district}
              onChange={(event) => update('district', event.target.value)}
              aria-label="Filter by district"
            >
              <option value="">All Districts</option>
              {availableDistricts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="quick-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={load}>
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="quick-loading">
              <span className="spinner spinner-dark" />
              <span>Loading verified public contacts…</span>
            </div>
          ) : (
            <div className="quick-grid">
              {entries.map((entry) => {
                const Icon = categoryIcons[entry.category] || Building2;
                return (
                  <article className="quick-card" key={entry._id}>
                    <div className="quick-card-top">
                      <span className="quick-card-icon">
                        <Icon size={20} />
                      </span>
                      <span
                        className={`quick-category ${
                          entry.isEmergency ? 'urgent' : ''
                        }`}
                      >
                        {entry.category}
                      </span>
                    </div>

                    <h3>{entry.name}</h3>
                    <p>{entry.description}</p>

                    <dl className="quick-contact-dl">
                      <div>
                        <dt>
                          <Phone size={14} /> Phone
                        </dt>
                        <dd>
                          <a href={phoneLink(entry.phone)}>{entry.phone}</a>
                        </dd>
                      </div>
                      {entry.address && (
                        <div>
                          <dt>
                            <MapPin size={14} /> Location
                          </dt>
                          <dd>{entry.address}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="quick-card-actions">
                      <a className="btn btn-primary quick-call" href={phoneLink(entry.phone)}>
                        <Phone size={15} /> Call
                      </a>
                      {entry.address && (
                        <a
                          className="btn btn-secondary quick-map"
                          href={directionsUrl(entry)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation size={15} /> Directions
                        </a>
                      )}
                    </div>

                    <footer>
                      <a href={entry.officialSource} target="_blank" rel="noreferrer">
                        Official source <ExternalLink size={12} />
                      </a>
                      <span>Verified {prettyDate(entry.lastVerified)}</span>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && !entries.length && (
            <div className="quick-empty">
              <Building2 size={38} />
              <h3>No matching contacts found</h3>
              <p>Try clearing a filter or searching for another authority, helpline, or service.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
