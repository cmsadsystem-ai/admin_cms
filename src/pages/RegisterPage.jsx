import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, Save, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import FileUploadField from '../components/FileUploadField';
import { fetchDemoStudent } from '../services/emisService';
import { calculateCutoff } from '../utils/helpers';

const steps = [
  'Student details',
  'Address and school',
  'Academic marks',
  'Course preference',
  'Hostel & transport',
  'Certificates',
  'Fees & review',
];

const certificateOptions = ['Original', 'Xerox', 'Not Submitted'];
const certificateLabels = {
  SSLC: 'SSLC certificate',
  HSC: 'HSC certificate',
  TC: 'Transfer Certificate (TC)',
  CC: 'Community Certificate (CC)',
  NativityCertificate: 'Nativity Certificate',
  IncomeCertificate: 'Income Certificate',
  AadhaarCard: 'Aadhaar Card',
  FirstGraduateCertificate: 'First Graduate Certificate',
  PassportSizePhotographs: 'Passport-size photographs',
};
const courseOptions = [
  'Artificial Intelligence & Data Science',
  'Computer Science & Engineering',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Biomedical Engineering',
  'CSE – Cyber Security',
  'Electrical and Electronics Engineering',
  'Artificial Intelligence & Machine Learning',
];

const initialFieldError = {};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { draft, saveDraft, dismissDraft } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState(initialFieldError);
  const [emisStatus, setEmisStatus] = useState('idle');
  const [emisMessage, setEmisMessage] = useState('');
  const [isFetchingEmis, setIsFetchingEmis] = useState(false);

  const [formData, setFormData] = useState(() => ({
    ...draft,
    coursePreference: {
      firstPreference: draft?.coursePreference?.firstPreference || '',
      additionalPreferences: draft?.coursePreference?.additionalPreferences || [],
    },
    certificates: draft?.certificates || {},
    documents: draft?.documents || {},
    fees: draft?.fees || {},
  }));

  useEffect(() => {
    saveDraft(formData);
  }, [formData]);

  const cutOffValue = useMemo(() => calculateCutoff({
    mathematics: formData.mathematics,
    physicsTheory: formData.physicsTheory,
    physicsPractical: formData.physicsPractical,
    chemistryTheory: formData.chemistryTheory,
    chemistryPractical: formData.chemistryPractical,
  }), [formData.mathematics, formData.physicsTheory, formData.physicsPractical, formData.chemistryTheory, formData.chemistryPractical]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      cutOffMarks: Number(cutOffValue || 0).toFixed(2),
      totalMarks: Number(
        (Number(prev.mathematics || 0) + Number(prev.physicsTheory || 0) + Number(prev.physicsPractical || 0) + Number(prev.chemistryTheory || 0) + Number(prev.chemistryPractical || 0)).toFixed(2),
      ),
    }));
  }, [cutOffValue]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCourseSelection = (course) => {
    setFormData((prev) => {
      const current = prev.coursePreference || { firstPreference: '', additionalPreferences: [] };
      const isSelected = current.additionalPreferences.includes(course);
      const nextPreferences = isSelected
        ? current.additionalPreferences.filter((item) => item !== course)
        : [...current.additionalPreferences, course];

      return {
        ...prev,
        coursePreference: {
          firstPreference: current.firstPreference === course ? '' : current.firstPreference,
          additionalPreferences: nextPreferences,
        },
      };
    });
  };

  const selectFirstPreference = (course) => {
    setFormData((prev) => ({
      ...prev,
      coursePreference: {
        firstPreference: course,
        additionalPreferences: (prev.coursePreference?.additionalPreferences || []).filter((item) => item !== course),
      },
    }));
  };

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 1) {
      ['studentName', 'dateOfBirth', 'studentMobile'].forEach((field) => {
        if (!formData[field]) nextErrors[field] = 'This field is required.';
      });
    }

    if (currentStep === 2) {
      ['communicationAddress', 'schoolName'].forEach((field) => {
        if (!formData[field]) nextErrors[field] = 'This field is required.';
      });
    }

    if (currentStep === 3) {
      ['mathematics', 'physicsTheory', 'physicsPractical', 'chemistryTheory', 'chemistryPractical'].forEach((field) => {
        if (formData[field] === '' || formData[field] === null || Number(formData[field]) < 0 || Number(formData[field]) > 100) {
          nextErrors[field] = 'Enter valid marks from 0 to 100.';
        }
      });
    }

    if (currentStep === 4) {
      if (!formData.coursePreference?.firstPreference) {
        nextErrors.firstPreference = 'Choose a first preference.';
      }
    }

    if (currentStep === 7) {
      if (!formData.declaration) nextErrors.declaration = 'You must agree to the declaration.';
      if (!formData.parentDeclaration) nextErrors.parentDeclaration = 'Parent declaration is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length));
  };

  const goPrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
    setErrors({});
  };

  const handleSaveDraft = () => {
    saveDraft(formData);
    alert('Draft saved locally in this browser.');
  };

  const handleFetchEmis = async () => {
    setIsFetchingEmis(true);
    setEmisStatus('loading');
    setEmisMessage('Loading demo EMIS data...');

    try {
      const result = await fetchDemoStudent(formData.emisId);
      const record = result?.student;

      if (result.ok && record) {
        setFormData((prev) => ({
          ...prev,
          studentName: record.studentName,
          fatherName: record.fatherName,
          fatherOccupation: record.fatherOccupation,
          motherName: record.motherName,
          motherOccupation: record.motherOccupation,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          aadhaar: record.aadhaar,
          studentMobile: record.studentMobile,
          parentMobile: record.parentMobile,
          community: record.community,
          bloodGroup: record.bloodGroup,
          communicationAddress: record.communicationAddress,
          district: record.district,
          state: record.state,
          pinCode: record.pinCode,
          schoolName: record.schoolName,
          schoolAddress: record.schoolAddress,
          mathematics: record.mathematics,
          physicsTheory: record.physicsTheory,
          physicsPractical: record.physicsPractical,
          chemistryTheory: record.chemistryTheory,
          chemistryPractical: record.chemistryPractical,
          admissionCategory: record.category,
          firstGraduate: record.firstGraduate,
          coursePreference: record.coursePreference || {
            firstPreference: '',
            additionalPreferences: [],
          },
        }));
        setEmisStatus('success');
        setEmisMessage(result.message);
      } else {
        setEmisStatus('error');
        setEmisMessage(result.error || 'No matching EMIS record found.');
      }
    } catch (error) {
      setEmisStatus('error');
      setEmisMessage('Unable to fetch the demo EMIS details. Manual entry is still available.');
    } finally {
      setIsFetchingEmis(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-grid two-column">
            <div className="field-group full-width">
              <label htmlFor="emisId">EMIS ID (optional)</label>
              <div className="inline-field-row">
                <input id="emisId" value={formData.emisId || ''} onChange={(event) => updateField('emisId', event.target.value.toUpperCase())} />
                <button type="button" className="secondary-btn compact" onClick={handleFetchEmis} disabled={isFetchingEmis}>
                  <Search size={16} /> {isFetchingEmis ? 'Fetching...' : 'Fetch Details'}
                </button>
              </div>
              {errors.emisId ? <small className="error-text">{errors.emisId}</small> : null}
              {emisStatus !== 'idle' ? <small className={emisStatus === 'success' ? 'success-text' : 'error-text'}>{emisMessage}</small> : null}
            </div>

            <div className="field-group"><label>Form number</label><input value={formData.formNumber || ''} readOnly /></div>
            <div className="field-group"><label>Application date</label><input type="date" value={formData.applicationDate || ''} onChange={(event) => updateField('applicationDate', event.target.value)} /></div>
            <div className="field-group">
              <label htmlFor="admissionCategory">Admission category</label>
              <select id="admissionCategory" value={formData.admissionCategory || 'Government Quota'} onChange={(event) => updateField('admissionCategory', event.target.value)}>
                <option value="Government Quota">Government Quota (GQ)</option>
                <option value="Management Quota">Management Quota (MQ)</option>
              </select>
            </div>
            <div className="field-group"><label htmlFor="firstGraduate">First Graduate</label><select id="firstGraduate" value={formData.firstGraduate || 'No'} onChange={(event) => updateField('firstGraduate', event.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
            <div className="field-group full-width"><label htmlFor="studentName">Student name <span className="required-indicator">*</span></label><input id="studentName" required value={formData.studentName || ''} onChange={(event) => updateField('studentName', event.target.value)} />{errors.studentName ? <small className="error-text">{errors.studentName}</small> : null}</div>
            <div className="field-group"><label htmlFor="fatherName">Father's name (optional)</label><input id="fatherName" value={formData.fatherName || ''} onChange={(event) => updateField('fatherName', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="fatherOccupation">Father's occupation (optional)</label><input id="fatherOccupation" value={formData.fatherOccupation || ''} onChange={(event) => updateField('fatherOccupation', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="motherName">Mother's name (optional)</label><input id="motherName" value={formData.motherName || ''} onChange={(event) => updateField('motherName', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="motherOccupation">Mother's occupation</label><input id="motherOccupation" value={formData.motherOccupation || ''} onChange={(event) => updateField('motherOccupation', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="dateOfBirth">Date of birth <span className="required-indicator">*</span></label><input id="dateOfBirth" type="date" required value={formData.dateOfBirth || ''} onChange={(event) => updateField('dateOfBirth', event.target.value)} />{errors.dateOfBirth ? <small className="error-text">{errors.dateOfBirth}</small> : null}</div>
            <div className="field-group"><label htmlFor="gender">Gender</label><select id="gender" value={formData.gender || 'Male'} onChange={(event) => updateField('gender', event.target.value)}><option value="Male">Male</option><option value="Female">Female</option><option value="Transgender">Transgender</option><option value="Prefer not to say">Prefer not to say</option></select></div>
            <div className="field-group"><label htmlFor="aadhaar">Aadhaar number (optional)</label><input id="aadhaar" value={formData.aadhaar || ''} onChange={(event) => updateField('aadhaar', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="studentMobile">Student mobile number <span className="required-indicator">*</span></label><input id="studentMobile" type="tel" required value={formData.studentMobile || ''} onChange={(event) => updateField('studentMobile', event.target.value)} />{errors.studentMobile ? <small className="error-text">{errors.studentMobile}</small> : null}</div>
            <div className="field-group"><label htmlFor="parentMobile">Parent mobile number (optional)</label><input id="parentMobile" type="tel" value={formData.parentMobile || ''} onChange={(event) => updateField('parentMobile', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="community">Community (optional)</label><input id="community" value={formData.community || ''} onChange={(event) => updateField('community', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="bloodGroup">Blood group (optional)</label><input id="bloodGroup" value={formData.bloodGroup || ''} onChange={(event) => updateField('bloodGroup', event.target.value)} /></div>
          </div>
        );
      case 2:
        return (
          <div className="form-grid two-column">
            <div className="field-group full-width"><label htmlFor="communicationAddress">Communication address <span className="required-indicator">*</span></label><textarea id="communicationAddress" required value={formData.communicationAddress || ''} onChange={(event) => updateField('communicationAddress', event.target.value)} rows="3" />{errors.communicationAddress ? <small className="error-text">{errors.communicationAddress}</small> : null}</div>
            <div className="field-group"><label htmlFor="district">District (optional)</label><input id="district" value={formData.district || ''} onChange={(event) => updateField('district', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="state">State (optional)</label><input id="state" value={formData.state || ''} onChange={(event) => updateField('state', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="pinCode">PIN code (optional)</label><input id="pinCode" inputMode="numeric" value={formData.pinCode || ''} onChange={(event) => updateField('pinCode', event.target.value)} /></div>
            <div className="field-group full-width"><label htmlFor="schoolName">School name <span className="required-indicator">*</span></label><input id="schoolName" required value={formData.schoolName || ''} onChange={(event) => updateField('schoolName', event.target.value)} />{errors.schoolName ? <small className="error-text">{errors.schoolName}</small> : null}</div>
            <div className="field-group full-width"><label htmlFor="schoolAddress">School address (optional)</label><textarea id="schoolAddress" value={formData.schoolAddress || ''} onChange={(event) => updateField('schoolAddress', event.target.value)} rows="3" /></div>
          </div>
        );
      case 3:
        return (
          <div className="form-grid two-column">
            {['mathematics', 'physicsTheory', 'physicsPractical', 'chemistryTheory', 'chemistryPractical'].map((field) => (
              <div className="field-group" key={field}>
                <label htmlFor={field}>{field === 'mathematics' ? 'Mathematics marks' : field === 'physicsTheory' ? 'Physics theory marks' : field === 'physicsPractical' ? 'Physics practical marks' : field === 'chemistryTheory' ? 'Chemistry theory marks' : 'Chemistry practical marks'} <span className="required-indicator">*</span></label>
                <input id={field} type="number" min="0" max="100" required value={formData[field] ?? ''} onChange={(event) => updateField(field, event.target.value)} />
                {errors[field] ? <small className="error-text">{errors[field]}</small> : null}
              </div>
            ))}
            <div className="field-group full-width summary-box">
              <p><strong>Cut-off marks:</strong> {Number(formData.cutOffMarks || 0).toFixed(2)} </p>
              <p><strong>Total marks:</strong> {Number(formData.totalMarks || 0).toFixed(2)}</p>
              <small>Formula used: Mathematics + (Physics total + Chemistry total) / 2. Marks must be valid numbers between 0 and 100.</small>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="card-list">
            <div className="field-group full-width">
              <label>First preference <span className="required-indicator">*</span></label>
              <div className="choice-grid">
                {courseOptions.map((course) => (
                  <button type="button" key={course} className={`choice-card ${formData.coursePreference?.firstPreference === course ? 'active' : ''}`} onClick={() => selectFirstPreference(course)}>
                    {course}
                  </button>
                ))}
              </div>
              {errors.firstPreference ? <small className="error-text">{errors.firstPreference}</small> : null}
            </div>
            <div className="field-group full-width">
              <label>Additional preferences (optional)</label>
              <div className="choice-grid">
                {courseOptions.map((course) => (
                  <button type="button" key={`${course}-add`} className={`choice-card ${formData.coursePreference?.additionalPreferences?.includes(course) ? 'active' : ''}`} onClick={() => updateCourseSelection(course)}>
                    {course}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="form-grid two-column">
            <div className="field-group"><label htmlFor="hostelAccommodation">Hostel accommodation</label><select id="hostelAccommodation" value={formData.hostelAccommodation || 'No'} onChange={(event) => updateField('hostelAccommodation', event.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
            <div className="field-group"><label htmlFor="boardingPlace">Boarding place</label><input id="boardingPlace" value={formData.boardingPlace || ''} onChange={(event) => updateField('boardingPlace', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="busRoute">Bus route</label><input id="busRoute" value={formData.busRoute || ''} onChange={(event) => updateField('busRoute', event.target.value)} /></div>
            <div className="field-group"><label htmlFor="hostelApplication">Hostel application choice</label><select id="hostelApplication" value={formData.hostelApplication || 'No'} onChange={(event) => updateField('hostelApplication', event.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
            <div className="field-group"><label htmlFor="transportApplication">Transport application choice</label><select id="transportApplication" value={formData.transportApplication || 'No'} onChange={(event) => updateField('transportApplication', event.target.value)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
            <div className="field-group full-width"><label htmlFor="transportRequirements">Transport requirements</label><input id="transportRequirements" value={formData.transportRequirements || ''} onChange={(event) => updateField('transportRequirements', event.target.value)} /></div>
          </div>
        );
      case 6:
        return (
          <div className="table-card">
            <p>Select each certificate's status if known, then optionally attach a scan or PDF from your camera, gallery, or Files app.</p>
            <table className="certificate-table">
              <thead>
                <tr><th>Certificate</th><th>Original</th><th>Xerox</th><th>Not Submitted</th></tr>
              </thead>
              <tbody>
                {Object.entries(certificateLabels).map(([key, label]) => (
                  <tr key={key}>
                    <td>{label}</td>
                    {certificateOptions.map((option) => (
                      <td key={`${key}-${option}`}>
                        <input
                          type="radio"
                          name={key}
                          aria-label={`${label}: ${option}`}
                          checked={(formData.certificates?.[key] || 'Original') === option}
                          onChange={() => setFormData((prev) => ({
                            ...prev,
                            certificates: {
                              ...prev.certificates,
                              [key]: option,
                            },
                          }))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="certificate-upload-grid">
              {Object.entries(certificateLabels).map(([key, label]) => (
                <FileUploadField
                  key={key}
                  label={label}
                  value={formData.documents?.[key] || null}
                  onChange={(file) => setFormData((prev) => ({
                    ...prev,
                    documents: { ...prev.documents, [key]: file },
                  }))}
                />
              ))}
            </div>
            <p className="upload-storage-note">Attachments are kept in this browser demo and may be limited by browser storage. Durable uploads and cross-device access require the future backend.</p>
          </div>
        );
      case 7:
        return (
          <div className="fee-layout">
            <div className="fee-table-wrap">
              <table className="fee-table">
                <thead>
                  <tr><th>Fee head</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  {Object.entries({
                    'Admission fees – one time': 5000,
                    'Consortium fees – one time': 550,
                    'RRA amount – one time': 2500,
                    'Sports fees – one time': 625,
                    'Group insurance – one time': 100,
                    'Syllabus fees – one time': 200,
                    'NSS fees': 25,
                    'Lab coat': 500,
                    'ID card': 100,
                    'Hostel / transport application form': 50,
                    'Tuition fees': 'To be confirmed by college',
                    'Hostel fees': 'To be confirmed by college',
                    'Transport fees': 'To be confirmed by college',
                    'Semester fees': 'To be confirmed by college',
                  }).map(([label, amount]) => (
                    <tr key={label}><td>{label}</td><td>{typeof amount === 'string' ? amount : `₹${amount.toLocaleString('en-IN')}`}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="declaration-panel">
              <label className="checkbox-row"><input type="checkbox" checked={!!formData.declaration} onChange={(event) => updateField('declaration', event.target.checked)} /> Student declaration <span className="required-indicator">*</span></label>
              {errors.declaration ? <small className="error-text">{errors.declaration}</small> : null}
              <label className="checkbox-row"><input type="checkbox" checked={!!formData.parentDeclaration} onChange={(event) => updateField('parentDeclaration', event.target.checked)} /> Parent declaration <span className="required-indicator">*</span></label>
              {errors.parentDeclaration ? <small className="error-text">{errors.parentDeclaration}</small> : null}
              <FileUploadField
                label="Student signature (optional)"
                signature
                value={formData.signature && typeof formData.signature === 'object' ? formData.signature : null}
                onChange={(file) => updateField('signature', file)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="page-shell register-shell">
      <section className="content-panel form-panel">
        <div className="section-header space-between">
          <div>
            <p className="eyebrow accent">Admissions Portal</p>
            <h2>Student Admission Form</h2>
          </div>
          <button type="button" className="secondary-btn compact" onClick={dismissDraft}>
            <FileText size={16} /> New draft
          </button>
        </div>

        <div className="stepper" aria-label="Application steps">
          {steps.map((step, index) => (
            <div key={step} className={`step-item ${currentStep === index + 1 ? 'active' : index + 1 < currentStep ? 'complete' : ''}`}>
              <span>{index + 1}</span>
              <small>{step}</small>
            </div>
          ))}
        </div>

        <div className="progress-bar">
          <span style={{ width: `${(currentStep / steps.length) * 100}%` }} />
        </div>
        <p className="required-fields-note"><span className="required-indicator">*</span> Required fields. Other fields and document uploads are optional.</p>

        {renderStep()}

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={goPrevious} disabled={currentStep === 1}>
            <ArrowLeft size={16} /> Previous
          </button>
          <button type="button" className="secondary-btn" onClick={handleSaveDraft}>
            <Save size={16} /> Save Draft
          </button>
          {currentStep < steps.length ? (
            <button type="button" className="primary-btn" onClick={goNext}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="primary-btn" onClick={() => navigate('/application-preview')}>
              Preview application <Check size={16} />
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
