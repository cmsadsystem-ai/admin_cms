import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, Save, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ApplicationDocuments from '../components/ApplicationDocuments';
import { formatDate } from '../utils/helpers';

export default function OfficerApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, updateApplication, confirmApplication, correctionHistory } = useAppContext();
  const application = useMemo(() => applications.find((item) => item.id === id), [applications, id]);
  const [draftApplication, setDraftApplication] = useState(application || {});
  const [note, setNote] = useState('');

  useEffect(() => {
    setDraftApplication(application || {});
  }, [application]);

  if (!application) {
    return (
      <main className="page-shell preview-shell">
        <div className="content-panel empty-panel">
          <h2>Application not found</h2>
          <p>The requested student record could not be located in local demo storage.</p>
          <button type="button" className="primary-btn" onClick={() => navigate('/officer/dashboard')}>Back to dashboard</button>
        </div>
      </main>
    );
  }

  const history = correctionHistory.filter((entry) => entry.applicationId === id);

  const handleSave = () => {
    updateApplication(id, draftApplication, note, 'Admission Officer');
    setNote('');
    alert('Changes saved locally and logged in the demo history.');
  };

  const handleConfirm = () => {
    const confirmed = window.confirm('Confirm this application and move it to the confirmed list?');
    if (!confirmed) return;
    confirmApplication(id, 'Admission Officer');
    navigate('/officer/dashboard', { replace: true });
  };

  return (
    <main className="page-shell admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/cms-logo.png" alt="CMS logo" className="brand-logo small" />
          <div>
            <p className="eyebrow accent">Officer View</p>
            <strong>{application.studentName}</strong>
          </div>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow accent">Application review</p>
            <h2>{application.id}</h2>
          </div>
          <div className="toolbar">
            <button type="button" className="primary-btn compact" onClick={handleConfirm}><CheckCheck size={16} /> Confirm Application</button>
          </div>
        </header>

        <div className="content-panel form-panel detail-panel">
          <div className="preview-grid two-column">
            <div className="field-group"><label>Student name</label><input value={draftApplication.studentName || ''} onChange={(event) => setDraftApplication((prev) => ({ ...prev, studentName: event.target.value }))} /></div>
            <div className="field-group"><label>EMIS ID</label><input value={draftApplication.emisId || ''} onChange={(event) => setDraftApplication((prev) => ({ ...prev, emisId: event.target.value }))} /></div>
            <div className="field-group"><label>Application date</label><input type="date" value={draftApplication.applicationDate || ''} onChange={(event) => setDraftApplication((prev) => ({ ...prev, applicationDate: event.target.value }))} /></div>
            <div className="field-group"><label>Status</label><input value={draftApplication.status || ''} readOnly /></div>
            <div className="field-group full-width"><label>Correction notes</label><textarea value={note} onChange={(event) => setNote(event.target.value)} rows="3" placeholder="Add officer corrections or notes" /></div>
            <div className="field-group full-width"><label>Student declaration</label><textarea value={draftApplication.declaration ? 'Accepted' : 'Not accepted'} readOnly /></div>
          </div>

          <ApplicationDocuments
            documents={draftApplication.documents}
            signature={draftApplication.signature}
            studentSignature={draftApplication.studentSignature}
            parentSignature={draftApplication.parentSignature}
          />

          <div className="detail-history">
            <h3>History</h3>
            {history.length ? history.map((entry) => (
              <div className="history-item" key={entry.id}><strong>{entry.actor}</strong><span>{formatDate(entry.createdAt)}</span><p>{entry.note}</p></div>
            )) : <p>No correction history exists yet.</p>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/officer/dashboard')}>
            Back to dashboard
          </button>
          <button type="button" className="primary-btn" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      </section>
    </main>
  );
}
