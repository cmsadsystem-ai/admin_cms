import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentWelcomePage() {
  const navigate = useNavigate();

  return (
    <main className="page-shell home-shell">
      <header className="topbar topbar-public">
        <div className="brand-block">
          <img src="/cms-logo.png" alt="CMS College of Engineering logo" className="brand-logo" />
          <div>
            <p className="eyebrow">Academic Excellence</p>
            <h1>CMS College of Engineering</h1>
          </div>
        </div>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow accent">Admissions Open 2026</p>
          <h2>Begin your admission application.</h2>
          <div className="cta-row">
            <button type="button" className="primary-btn" onClick={() => navigate('/register')}>
              Register <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
