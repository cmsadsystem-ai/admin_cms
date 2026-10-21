export function calculateCutoff({ mathematics = 0, physicsTheory = 0, physicsPractical = 0, chemistryTheory = 0, chemistryPractical = 0 }) {
  const physicsTotal = Number(physicsTheory || 0) + Number(physicsPractical || 0);
  const chemistryTotal = Number(chemistryTheory || 0) + Number(chemistryPractical || 0);
  const mathematicsValue = Number(mathematics || 0);
  return mathematicsValue + (physicsTotal + chemistryTotal) / 2;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function generateDemoFormNumber() {
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `CMS-${new Date().getFullYear()}-${seq}`;
}

export function escapeCsvValue(value) {
  const text = value == null ? '' : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportApplicationsCsv(rows = []) {
  const headers = ['Application ID', 'Student Name', 'EMIS ID', 'Course Preference', 'Admission Category', 'Submitted / Confirmation Date', 'Status'];
  const lines = [headers.map(escapeCsvValue).join(',')];

  rows.forEach((row) => {
    lines.push([
      row.id,
      row.studentName,
      row.emisId,
      row.coursePreference?.firstPreference || row.coursePreference || '',
      row.admissionCategory || '',
      row.confirmedAt || row.submittedAt || '',
      row.status || 'Enquiring',
    ].map(escapeCsvValue).join(','));
  });

  return `\uFEFF${lines.join('\r\n')}`;
}

export function downloadApplicationsCsv(rows, filename) {
  const blob = new Blob([exportApplicationsCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function getInitialDraft() {
  return {
    formNumber: generateDemoFormNumber(),
    applicationDate: new Date().toISOString().slice(0, 10),
    admissionCategory: 'Government Quota',
    firstGraduate: 'No',
    studentName: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    dateOfBirth: '',
    gender: 'Male',
    aadhaar: '',
    studentMobile: '',
    parentMobile: '',
    community: '',
    bloodGroup: '',
    emisId: '',
    communicationAddress: '',
    district: 'Namakkal',
    state: 'Tamil Nadu',
    pinCode: '',
    schoolName: '',
    schoolAddress: '',
    mathematics: '',
    physicsTheory: '',
    physicsPractical: '',
    chemistryTheory: '',
    chemistryPractical: '',
    cutOffMarks: 0,
    totalMarks: 0,
    coursePreference: {
      firstPreference: '',
      additionalPreferences: [],
    },
    hostelAccommodation: 'No',
    boardingPlace: '',
    busRoute: '',
    hostelApplication: 'No',
    transportApplication: 'No',
    transportRequirements: '',
    certificates: {
      SSLC: 'Original',
      HSC: 'Original',
      TC: 'Original',
      CC: 'Original',
      NativityCertificate: 'Original',
      IncomeCertificate: 'Original',
      AadhaarCard: 'Original',
      FirstGraduateCertificate: 'Not Submitted',
      PassportSizePhotographs: 'Original',
    },
    documents: {},
    fees: {
      AdmissionFees: 5000,
      ConsortiumFees: 550,
      RRAAmount: 2500,
      SportsFees: 625,
      GroupInsurance: 100,
      SyllabusFees: 200,
      NSSFees: 25,
      LabCoat: 500,
      IDCard: 100,
      HostelTransportApplicationForm: 50,
      TuitionFee: 'To be confirmed by college',
      HostelFee: 'To be confirmed by college',
      TransportFee: 'To be confirmed by college',
      SemesterFee: 'To be confirmed by college',
    },
    declaration: false,
    parentDeclaration: false,
    signature: null,
    correctionNotes: '',
  };
}
