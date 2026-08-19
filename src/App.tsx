import { useState } from 'react';
import {
  Bell,
  ClipboardList,
  Home,
  Lightbulb,
  Map,
  Menu,
  Plus,
  TrafficCone,
  Trash2,
  UserRound,
  Waves,
  X,
} from 'lucide-react';

type ReportCategory = {
  label: string;
  icon: typeof TrafficCone;
  description: string;
};

type NavItem = {
  label: string;
  icon: typeof Home;
};

const categories: ReportCategory[] = [
  { label: 'Road Damage', icon: TrafficCone, description: 'Potholes, cracked roads, or damaged sidewalks' },
  { label: 'Water Crisis', icon: Waves, description: 'Leaks, flooding, or water supply concerns' },
  { label: 'Garbage/Waste', icon: Trash2, description: 'Missed collection or overflowing bins' },
  { label: 'Street Light', icon: Lightbulb, description: 'Broken, flickering, or unsafe street lights' },
];

const navItems: NavItem[] = [
  { label: 'Home', icon: Home },
  { label: 'My Reports', icon: ClipboardList },
  { label: 'Map', icon: Map },
  { label: 'Profile', icon: UserRound },
];

function App() {
  const [activeNav, setActiveNav] = useState('Home');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openReport = (category?: ReportCategory) => {
    setSelectedCategory(category ?? null);
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <button
          className="icon-button menu-button"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={28} strokeWidth={2.4} />
        </button>
        <h1>CivicLink</h1>
        <button className="icon-button" aria-label="View notifications">
          <Bell size={29} strokeWidth={2.2} />
          <span className="notification-dot" />
        </button>
      </header>

      {menuOpen && (
        <button className="mobile-menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
          <span className="mobile-menu" onClick={(event) => event.stopPropagation()}>
            <span className="mobile-menu-heading">Quick navigation</span>
            {navItems.map(({ label, icon: Icon }) => (
              <span
                className={`mobile-menu-item ${activeNav === label ? 'active' : ''}`}
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  setMenuOpen(false);
                }}
              >
                <Icon size={20} />
                {label}
              </span>
            ))}
          </span>
        </button>
      )}

      <main className="page-content">
        <aside className="sidebar">
          <div className="profile-summary">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV8YZCB1DCM66a_RlYHy835EqYcC70TZ8ZV6BR63xpZvYX8N83Gm6wODo-P5y4ukmplffpFAo0SsDn8YzWUivQbg-vPnh6qc8pD2LlQWP_jWHfpggwOcDMImVJTkfHOxCo5UT_W2ywuAxzTt98IYZ2E4KuO09SO30P5P_nnJu9iz2RX7MJD3ErSHUrMYfr5c3MINI7YNCb6xyprIY0nVZSR0IkMk0JgsCbUGHoQ3GcyjAhHBfjmbLZ"
              alt="Alex Johnson"
            />
            <div>
              <h2>Alex Johnson</h2>
              <p>Verified Citizen</p>
            </div>
          </div>
          <nav className="side-nav" aria-label="Main navigation">
            {navItems.slice(0, 3).map(({ label, icon: Icon }) => (
              <button
                className={`side-nav-item ${activeNav === label ? 'active' : ''}`}
                key={label}
                onClick={() => setActiveNav(label)}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="main-panel">
          <section className="welcome-section">
            <p className="eyebrow">WARD 12 · CITIZEN PORTAL</p>
            <h2>Good morning, Alex</h2>
            <p>What would you like to report today?</p>
          </section>

          <section className="category-grid" aria-label="Report categories">
            {categories.map(({ label, icon: Icon, description }) => (
              <button className="category-card" key={label} onClick={() => openReport(categories.find((category) => category.label === label))}>
                <span className="category-icon"><Icon size={37} strokeWidth={2.1} /></span>
                <span className="category-label">{label}</span>
                <span className="category-description">{description}</span>
              </button>
            ))}
          </section>

          <section className="activity-card">
            <div className="activity-heading">
              <div>
                <p className="eyebrow">LIVE UPDATES</p>
                <h3>Recent Activity in Ward 12</h3>
              </div>
              <span className="activity-status"><span /> Active</span>
            </div>
            <div className="activity-list">
              <div className="activity-row">
                <span className="activity-marker" />
                <p>Pothole fixed on Elm St.</p>
                <time>2h ago</time>
              </div>
              <div className="activity-row">
                <span className="activity-marker" />
                <p>Streetlight reported on Oak Ave.</p>
                <time>5h ago</time>
              </div>
            </div>
          </section>

          <button className="desktop-report-button" onClick={() => openReport()}>
            <Plus size={21} />
            Report New Problem
          </button>
        </section>
      </main>

      <button className="floating-report-button" aria-label="Report new problem" onClick={() => openReport()}>
        <Plus size={34} strokeWidth={2.2} />
      </button>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            className={`bottom-nav-item ${activeNav === label ? 'active' : ''}`}
            key={label}
            onClick={() => setActiveNav(label)}
          >
            <span><Icon size={21} strokeWidth={activeNav === label ? 2.5 : 2} /></span>
            <strong>{label === 'My Reports' ? 'My Reports' : label}</strong>
          </button>
        ))}
      </nav>

      {selectedCategory && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedCategory(null)}>
          <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label="Close report form" onClick={() => setSelectedCategory(null)}><X size={21} /></button>
            <span className="modal-icon"><selectedCategory.icon size={28} /></span>
            <p className="eyebrow">NEW COMMUNITY REPORT</p>
            <h2 id="report-title">Report {selectedCategory.label.toLowerCase()}</h2>
            <p className="modal-copy">{selectedCategory.description}. Add a few details so your local team can respond quickly.</p>
            <label>
              Location
              <input type="text" placeholder="Street, landmark, or nearby address" autoFocus />
            </label>
            <label>
              What happened?
              <textarea placeholder="Share any helpful details" rows={3} />
            </label>
            <button className="modal-submit" onClick={() => setSelectedCategory(null)}>Continue Report <Plus size={18} /></button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
