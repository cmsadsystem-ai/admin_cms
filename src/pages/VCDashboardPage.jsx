import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { downloadApplicationsCsv, formatDate } from '../utils/helpers';

export default function VCDashboardPage() {
  const navigate = useNavigate();
  const { applications, auth, logoutDemoUser } = useAppContext();
  const confirmed = applications.filter((app) => app.status === 'Confirmed');
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredConfirmed = confirmed.filter((app) => [
    app.id,
    app.studentName,
    app.emisId,
    app.coursePreference?.firstPreference,
    app.admissionCategory,
  ].some((field) => String(field || '').toLocaleLowerCase().includes(normalizedSearch)));

  const handleLogout = () => {
    logoutDemoUser();
    navigate('/login/vc', { replace: true });
  };

  const handleCsvExport = () => {
    downloadApplicationsCsv(filteredConfirmed, 'cms-confirmed-applications.csv');
  };

  return (
    <main className="page-shell admin-shell vc-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/cms-logo.png" alt="CMS logo" className="brand-logo small" />
          <div>
            <p className="eyebrow accent">VC Portal</p>
            <strong>Vice-Chairman</strong>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/vc/dashboard" className="nav-item active">Confirmed list</Link>
          <button type="button" className="nav-item button-link" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow accent">Chairman&apos;s view</p>
            <h2>{auth.username || 'Vice-Chairman'}</h2>
          </div>
          <div className="toolbar">
            <button type="button" className="secondary-btn compact" onClick={handleCsvExport}><Download size={16} /> Export Excel/CSV</button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card"><span>Confirmed</span><strong>{confirmed.length}</strong></div>
          <div className="stat-card"><span>Matching confirmed records</span><strong>{filteredConfirmed.length}</strong></div>
        </div>

        <div className="content-panel table-card">
          <div className="section-header space-between">
            <h3>Confirmed applications only</h3>
            <div className="mini-control"><Search size={14} /> <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search confirmed students" aria-label="Search confirmed students" /></div>
          </div>

          <table className="data-table">
            <thead>
              <tr><th>App ID</th><th>Student</th><th>EMIS ID</th><th>Course</th><th>Category</th><th>Confirmation Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredConfirmed.length ? filteredConfirmed.map((app) => (
                <tr key={app.id}><td>{app.id}</td><td>{app.studentName}</td><td>{app.emisId}</td><td>{app.coursePreference?.firstPreference || '—'}</td><td>{app.admissionCategory || '—'}</td><td>{formatDate(app.confirmedAt || app.submittedAt)}</td><td><span className="badge badge-success">Confirmed</span></td><td><Link to={`/vc/confirmed/${app.id}`}>Open</Link></td></tr>
              )) : <tr><td colSpan="8">{confirmed.length ? 'No confirmed applications match your search.' : 'No confirmed applications to display.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
