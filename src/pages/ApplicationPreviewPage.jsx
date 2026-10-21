import { Printer, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ApplicationDocuments from '../components/ApplicationDocuments';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function ApplicationPreviewPage() {
  const navigate = useNavigate();
  const { draft, submitApplication } = useAppContext();

  if (!draft || !draft.studentName) {
    return (
      <main className="page-shell preview-shell">
        <div className="content-panel empty-panel">
          <h2>No application found</h2>
          <p>Please complete the registration form before you preview the admission application.</p>
          <button type="button" className="primary-btn" onClick={() => navigate('/register')}>Back to form</button>
        </div>
      </main>
    );
  }

  const handleSubmit = () => {
    const app = submitApplication({
      ...draft,
      id: draft.id || `CMS-${Date.now()}`,
      studentName: draft.studentName,
      emisId: draft.emisId,
      admissionCategory: draft.admissionCategory,
      formNumber: draft.formNumber,
      applicationDate: draft.applicationDate,
      status: 'Enquiring',
    });
    navigate(`/application-success?id=${encodeURIComponent(app.id)}`);
  };

  return (
    <main className="page-shell preview-shell">
      <section className="content-panel application-preview">
        <div className="section-header space-between">
          <div>
            <p className="eyebrow accent">Application Preview</p>
            <h2>CMS College Admission Form Review</h2>
          </div>
          <div className="preview-brand"><img src="/cms-logo.png" alt="CMS logo" className="brand-logo small" /> <span>Form No: {draft.formNumber}</span></div>
        </div>

        <div className="preview-grid two-column">
          <div className="preview-block">
            <h3>Student details</h3>
            <ul>
              <li><span>Student name</span><strong>{draft.studentName}</strong></li>
              <li><span>EMIS ID</span><strong>{draft.emisId}</strong></li>
              <li><span>Admission category</span><strong>{draft.admissionCategory}</strong></li>
              <li><span>Application date</span><strong>{formatDate(draft.applicationDate)}</strong></li>
              <li><span>Father</span><strong>{draft.fatherName}</strong></li>
              <li><span>Mother</span><strong>{draft.motherName}</strong></li>
              <li><span>Date of birth</span><strong>{formatDate(draft.dateOfBirth)}</strong></li>
              <li><span>Gender</span><strong>{draft.gender}</strong></li>
              <li><span>Aadhaar</span><strong>{draft.aadhaar}</strong></li>
              <li><span>Student mobile</span><strong>{draft.studentMobile}</strong></li>
              <li><span>Parent mobile</span><strong>{draft.parentMobile}</strong></li>
            </ul>
          </div>

          <div className="preview-block">
            <h3>Academic and course details</h3>
            <ul>
              <li><span>Mathematics</span><strong>{draft.mathematics}</strong></li>
              <li><span>Physics theory</span><strong>{draft.physicsTheory}</strong></li>
              <li><span>Physics practical</span><strong>{draft.physicsPractical}</strong></li>
              <li><span>Chemistry theory</span><strong>{draft.chemistryTheory}</strong></li>
              <li><span>Chemistry practical</span><strong>{draft.chemistryPractical}</strong></li>
              <li><span>Cut-off</span><strong>{Number(draft.cutOffMarks || 0).toFixed(2)}</strong></li>
              <li><span>First preference</span><strong>{draft.coursePreference?.firstPreference}</strong></li>
              <li><span>Additional preferences</span><strong>{(draft.coursePreference?.additionalPreferences || []).join(', ') || '—'}</strong></li>
            </ul>
          </div>

          <div className="preview-block">
            <h3>Address and school</h3>
            <ul>
              <li><span>Communication address</span><strong>{draft.communicationAddress}</strong></li>
              <li><span>District & state</span><strong>{draft.district}, {draft.state}</strong></li>
              <li><span>PIN code</span><strong>{draft.pinCode}</strong></li>
              <li><span>School</span><strong>{draft.schoolName}</strong></li>
              <li><span>School address</span><strong>{draft.schoolAddress}</strong></li>
            </ul>
          </div>

          <div className="preview-block">
            <h3>Hostel, transport and certificates</h3>
            <ul>
              <li><span>Hostel accommodation</span><strong>{draft.hostelAccommodation}</strong></li>
              <li><span>Boarding place</span><strong>{draft.boardingPlace || '—'}</strong></li>
              <li><span>Bus route</span><strong>{draft.busRoute || '—'}</strong></li>
              <li><span>Certificates</span><strong>{Object.entries(draft.certificates || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}</strong></li>
            </ul>
          </div>
        </div>

        <ApplicationDocuments documents={draft.documents} signature={draft.signature} />

        <div className="fee-table-wrap preview-fees">
          <h3>Fee structure</h3>
          <table className="fee-table">
            <thead>
              <tr><th>Fee head</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {Object.entries(draft.fees || {}).map(([label, value]) => (
                <tr key={label}><td>{label}</td><td>{typeof value === 'number' ? formatCurrency(value) : value}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-actions preview-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/register')}>
            Edit Application
          </button>
          <button type="button" className="secondary-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save as PDF
          </button>
          <button type="button" className="primary-btn" onClick={handleSubmit}>
            <Send size={16} /> Submit Application
          </button>
        </div>
      </section>
    </main>
  );
}
