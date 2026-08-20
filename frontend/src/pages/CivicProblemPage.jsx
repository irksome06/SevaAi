import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ImagePlus, Lightbulb, MapPin, Trash2, TrafficCone, Waves, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackingApi } from '../services/api';

const categories = [
  { label: 'Road Damage', description: 'Potholes, cracked roads, or damaged sidewalks', icon: TrafficCone },
  { label: 'Water Crisis', description: 'Leaks, flooding, or water supply concerns', icon: Waves },
  { label: 'Garbage / Waste', description: 'Missed collection or overflowing bins', icon: Trash2 },
  { label: 'Street Light', description: 'Broken, flickering, or unsafe street lights', icon: Lightbulb },
];

export default function CivicProblemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [details, setDetails] = useState({ location: '', description: '' });
  const [image, setImage] = useState(null);
  const imageInputRef = useRef(null);
  const firstName = user?.fullName?.split(' ')[0] || 'Citizen';

  const openReport = (selectedCategory) => {
    setCategory(selectedCategory);
    setSubmitted(false);
    setSubmission(null);
    setSubmitError('');
    setDetails({ location: '', description: '' });
    setImage(null);
  };

  useEffect(() => () => {
    if (image?.preview) URL.revokeObjectURL(image.preview);
  }, [image]);

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return;
    setImage({ name: file.name, preview: URL.createObjectURL(file) });
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setSubmitError('');
    try {
      const response = await trackingApi.create({
        type: 'civic_report',
        title: `${category.label} report`,
        category: category.label,
        status: 'Submitted',
        sourceModule: 'Report Civic Problem',
        metadata: {
          location: details.location,
          description: details.description,
          photoAttached: Boolean(image),
          nextAction: 'Your report has been sent to the relevant ward service team for acknowledgement.',
        },
        initialNote: 'Your civic report was submitted and is awaiting acknowledgement.',
      });
      setSubmission(response.record);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Unable to submit your report. Please try again.');
    }
  };

  return (
    <div className="civic-page">
      <header className="civic-topbar">
        <button type="button" className="civic-back" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /> Dashboard</button>
        <strong>CivicLink</strong>
        <span>Citizen portal</span>
      </header>

      <main className="civic-main">
        <section className="civic-intro">
          <p>WARD SERVICES · CITIZEN PORTAL</p>
          <h1>Good day, {firstName}</h1>
          <span>What would you like to report today?</span>
        </section>

        <section className="civic-category-grid" aria-label="Civic problem categories">
          {categories.map((item) => {
            const Icon = item.icon;
            return <button type="button" className="civic-category" key={item.label} onClick={() => openReport(item)}>
              <i><Icon size={34} /></i><b>{item.label}</b><small>{item.description}</small>
            </button>;
          })}
        </section>

        <section className="civic-updates">
          <div><p>LIVE UPDATES</p><h2>Recent activity in your area</h2></div>
          <span className="civic-live-dot">Active</span>
          <ul><li><i />Pothole repair reported nearby <time>2h ago</time></li><li><i />Streetlight issue resolved <time>5h ago</time></li></ul>
        </section>
      </main>

      {category && <div className="civic-modal-backdrop" onClick={() => setCategory(null)} role="presentation">
        <form className="civic-modal" onSubmit={submitReport} onClick={(event) => event.stopPropagation()}>
          <button type="button" className="civic-close" onClick={() => setCategory(null)} aria-label="Close report form"><X size={20} /></button>
          {submitted ? <div className="civic-success"><CheckCircle2 size={42} /><h2>Report submitted</h2><p>Your {category.label.toLowerCase()} report is now in My Applications &amp; Reports.</p>{submission?.trackingId && <strong>Tracking ID: {submission.trackingId}</strong>}<button type="button" onClick={() => navigate('/my-applications')}>View my reports</button><button type="button" onClick={() => setCategory(null)}>Done</button></div> : <>
            <div className="civic-modal-icon"><category.icon size={28} /></div>
            <p className="civic-eyebrow">NEW COMMUNITY REPORT</p>
            <h2>Report {category.label.toLowerCase()}</h2>
            <p className="civic-copy">Add a few details so your local team can respond quickly.</p>
            <label><span><MapPin size={15} /> Location</span><input required value={details.location} onChange={(event) => setDetails({ ...details, location: event.target.value })} placeholder="Street, landmark, or nearby address" autoFocus /></label>
            <label><span>What happened?</span><textarea required rows="4" value={details.description} onChange={(event) => setDetails({ ...details, description: event.target.value })} placeholder="Share helpful details about the issue" /></label>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} hidden />
            {image ? <div className="civic-image-preview"><img src={image.preview} alt="Selected issue" /><div><strong>{image.name}</strong><button type="button" onClick={() => { URL.revokeObjectURL(image.preview); setImage(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}>Remove image</button></div></div> : <button type="button" className="civic-image-button" onClick={() => imageInputRef.current?.click()}><ImagePlus size={18} /> Add a photo <small>JPEG, PNG, or WEBP · max 5 MB</small></button>}
            {submitError && <p role="alert" style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{submitError}</p>}
            <button className="civic-submit" type="submit">Submit report</button>
          </>}
        </form>
      </div>}
    </div>
  );
}
