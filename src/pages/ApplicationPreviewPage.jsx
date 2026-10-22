import { ArrowLeft, CreditCard, Printer, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ApplicationDocuments from '../components/ApplicationDocuments';
import { calculateCutoff, formatCurrency, formatDate } from '../utils/helpers';

function display(value) {
  return value === null || value === undefined || String(value).trim() === '' ? 'Not provided' : value;
}

function PreviewBlock({ title, rows }) {
  return (
    <section className="preview-block">
      <h3>{title}</h3>
      <ul>
        {rows.map(([label, value]) => (
          <li key={label}><span>{label}</span><strong>{display(value)}</strong></li>
        ))}
      </ul>
    </section>
  );
}

export default function ApplicationPreviewPage() {
  const navigate = useNavigate();
  const { draft, submitApplication } = useAppContext();
  const cutoff = calculateCutoff({
    mathematics: draft.mathematics,
    physics: draft.physicsMarks,
    chemistry: draft.chemistryMarks,
  });

  if (!draft || !draft.studentName) {
    return (
      <main className="page-shell preview-shell">
        <div className="content-panel empty-panel">
          <h2>No application found</h2>
          <p>Please complete the registration form before previewing the application.</p>
          <button type="button" className="primary-btn" onClick={() => navigate('/register')}>Back to form</button>
        </div>
      </main>
    );
  }

  const handleEnquiring = () => {
    const application = submitApplication({
      ...draft,
      cutOffMarks: cutoff ?? '',
    });
    navigate(`/application-success?id=${encodeURIComponent(application.id)}`);
  };

  return (
    <main className="page-shell preview-shell">
      <section className="content-panel application-preview">
        <div className="section-header space-between">
          <div>
            <p className="eyebrow accent">Application Preview · Page 11 of 11</p>
            <h2>Review your application</h2>
          </div>
          <div className="preview-brand">
            <img src="/cms-logo.png" alt="CMS College of Engineering logo" className="brand-logo small" />
            <span>Form No: {display(draft.formNumber)}</span>
          </div>
        </div>

        <div className="preview-grid two-column">
          <PreviewBlock title="Admission and programme" rows={[
            ['Admission category', draft.admissionCategory],
            ['Programme', draft.programme],
            ['Degree', draft.degree],
            ['Selected course', draft.coursePreference?.firstPreference],
            ['FG (First Graduate)', draft.firstGraduate],
            ['Application date', formatDate(draft.applicationDate)],
          ]} />
          <PreviewBlock title="Personal information" rows={[
            ['Full name', draft.studentName],
            ['Date of birth', formatDate(draft.dateOfBirth)],
            ['Gender', draft.gender],
            ['Aadhaar number', draft.aadhaar],
            ['Blood group', draft.bloodGroup],
            ['Community', draft.community],
            ['Mobile number', draft.studentMobile],
            ['EMIS ID', draft.emisId],
            ['Communication address', draft.communicationAddress],
            ['District', draft.district],
            ['State', draft.state],
            ['PIN code', draft.pinCode],
          ]} />
          <PreviewBlock title="Parents and guardian" rows={[
            ['Father name', draft.fatherName],
            ['Father occupation', draft.fatherOccupation],
            ['Father mobile number', draft.fatherMobile || draft.parentMobile],
            ['Mother name', draft.motherName],
            ['Mother occupation', draft.motherOccupation],
            ['Mother mobile number', draft.motherMobile],
            ['Guardian name', draft.guardianName],
            ['Guardian occupation', draft.guardianOccupation],
            ['Guardian mobile number', draft.guardianMobile],
          ]} />
          <PreviewBlock title="Accommodation" rows={[
            ['Accommodation type', draft.accommodation],
            ['Bus route', draft.accommodation === 'Day Scholar' ? draft.busRoute : ''],
            ['Transport requirements', draft.accommodation === 'Day Scholar' ? draft.transportRequirements : ''],
          ]} />
          <PreviewBlock title="School and education" rows={[
            ['School name', draft.schoolName],
            ['School address', draft.schoolAddress],
            ['Class 12 / HSC marks', draft.hscMarks],
            ['Mathematics marks', draft.mathematics],
            ['Physics marks', draft.physicsMarks],
            ['Chemistry marks', draft.chemistryMarks],
            ['Automatically calculated cutoff', cutoff === null ? 'Not calculated — enter valid subject marks' : `${cutoff.toFixed(2)} / 200`],
          ]} />
          <PreviewBlock title="Declarations" rows={[
            ['Student declaration', draft.declaration ? 'Accepted' : 'Not accepted'],
            ['Parent declaration', draft.parentDeclaration ? 'Accepted' : 'Not accepted'],
          ]} />
          <PreviewBlock title="Payment" rows={[
            ['Admission fee', formatCurrency(5000)],
            ['Payment status', 'Not paid — demo QR does not process payments'],
          ]} />
          {Object.keys(draft.certificates || {}).length ? (
            <PreviewBlock title="Certificate status" rows={Object.entries(draft.certificates)} />
          ) : null}
        </div>

        <section className="preview-block preview-upload-summary">
          <h3>Documents and signatures</h3>
          <ul className="uploaded-file-list">
            {Object.entries(draft.documents || {}).filter(([, file]) => file?.dataUrl).map(([key, file]) => (
              <li key={key}><span>{key}</span><strong>{file.name}</strong></li>
            ))}
            <li>
              <span>Student signature</span>
              <strong>{(draft.studentSignature || draft.signature)?.name || 'Not uploaded'}</strong>
            </li>
            <li><span>Parent signature</span><strong>{draft.parentSignature?.name || 'Not uploaded'}</strong></li>
          </ul>
          {!Object.values(draft.documents || {}).some((file) => file?.dataUrl)
            ? <p>No optional documents uploaded.</p>
            : null}
        </section>
        <ApplicationDocuments
          documents={draft.documents}
          signature={draft.signature}
          studentSignature={draft.studentSignature}
          parentSignature={draft.parentSignature}
        />
        <p className="upload-storage-note">Uploaded files and this application are stored in this browser demo only; they are not sent to a server.</p>

        <div className="form-actions preview-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/register?step=9')}>
            <ArrowLeft size={16} /> Previous
          </button>
          <button type="button" className="secondary-btn" onClick={() => window.print()}>
            <Printer size={16} /> Print / Save as PDF
          </button>
          <button type="button" className="secondary-btn" onClick={() => navigate('/payment')}>
            <CreditCard size={16} /> Confirm Seat
          </button>
          <button type="button" className="primary-btn" onClick={handleEnquiring}>
            <Send size={16} /> Enquiring
          </button>
        </div>
      </section>
    </main>
  );
}
