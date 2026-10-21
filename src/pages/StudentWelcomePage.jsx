import { ArrowRight, CheckCircle2, Copy, GraduationCap, ShieldCheck, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';

const courseHighlights = [
  'Industry-ready engineering programs',
  'Career guidance and campus experience',
  'Transparent admission process',
];

function getRegistrationUrl(configuredUrl, isDevelopment, currentOrigin) {
  const candidateUrl = configuredUrl || (isDevelopment ? currentOrigin : '');
  if (!candidateUrl) return null;

  try {
    const url = new URL(candidateUrl);
    const hostname = url.hostname.toLowerCase();
    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    const validIpv4 = ipv4 && ipv4.slice(1).every((octet) => Number(octet) <= 255);
    if (ipv4 && !validIpv4) return null;
    const isPrivateIpv4 = validIpv4 && (
      Number(ipv4[1]) === 10
      || (Number(ipv4[1]) === 172 && Number(ipv4[2]) >= 16 && Number(ipv4[2]) <= 31)
      || (Number(ipv4[1]) === 192 && Number(ipv4[2]) === 168)
    );
    const isLocalHostname = hostname === 'localhost'
      || hostname.endsWith('.localhost')
      || hostname.endsWith('.local')
      || hostname.endsWith('.internal')
      || hostname === '[::1]';
    const isDevelopmentLanUrl = isDevelopment && url.protocol === 'http:' && isPrivateIpv4;
    const isPublicHttpsUrl = url.protocol === 'https:'
      && !isPrivateIpv4
      && !isLocalHostname
      && (validIpv4 || hostname.includes('.'));

    if (
      url.username
      || url.password
      || isLocalHostname
      || (!isDevelopmentLanUrl && !isPublicHttpsUrl)
    ) {
      return null;
    }

    return `${url.origin}/register`;
  } catch {
    return null;
  }
}

export default function StudentWelcomePage() {
  const registrationUrl = getRegistrationUrl(
    import.meta.env.VITE_PUBLIC_APP_URL,
    import.meta.env.DEV,
    window.location.origin,
  );

  const copyLink = async () => {
    if (!registrationUrl) return;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      alert('Registration link copied to clipboard.');
    } catch (error) {
      console.error('Unable to copy URL', error);
    }
  };

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
          <h2>Shape your future at a vibrant, future-ready campus.</h2>
          <p className="lead">
            Discover a dynamic learning environment designed for innovation, leadership, and career momentum.
          </p>

          <div className="feature-pills">
            {courseHighlights.map((item) => (
              <span key={item} className="pill"><CheckCircle2 size={16} /> {item}</span>
            ))}
          </div>

          <div className="cta-row">
            <Link to="/register" className="primary-btn">
              Register Now <ArrowRight size={18} />
            </Link>
            <button type="button" className="secondary-btn" onClick={copyLink} disabled={!registrationUrl}>
              <Copy size={16} /> Copy registration link
            </button>
          </div>
        </div>

        <aside className="qr-card">
          <div className="qr-box">
            {registrationUrl ? (
              <QRCodeSVG
                className="admission-qr-code"
                size={170}
                value={registrationUrl}
                level="H"
                marginSize={4}
                bgColor="#fff"
                fgColor="#004D38"
              />
            ) : (
              <p className="qr-unavailable">
                {import.meta.env.DEV
                  ? <>Set <code>VITE_PUBLIC_APP_URL</code> to this computer&apos;s private Wi-Fi address, for example <code>http://192.168.1.20:5173</code>. Open that address on this computer and phone, both on the same Wi-Fi.</>
                  : <>Set <code>VITE_PUBLIC_APP_URL</code> to your deployed public HTTPS domain to generate the admission QR code. Localhost and private network URLs are not allowed.</>}
              </p>
            )}
          </div>
          <p className="qr-note">
            {registrationUrl
              ? <>Scan to open the complete student application at <strong>/register</strong>.</>
              : 'The QR code appears when a mobile-reachable application URL is configured.'}
          </p>
          <Link to="/register" className="inline-link">Continue to registration</Link>
        </aside>
      </section>

      <section className="stats-strip">
        <div className="metric-card">
          <GraduationCap size={22} />
          <div>
            <strong>8+</strong>
            <span>Programs</span>
          </div>
        </div>
        <div className="metric-card">
          <ShieldCheck size={22} />
          <div>
            <strong>Transparent</strong>
            <span>Admissions</span>
          </div>
        </div>
        <div className="metric-card">
          <Smartphone size={22} />
          <div>
            <strong>Mobile-ready</strong>
            <span>Application flow</span>
          </div>
        </div>
      </section>
    </main>
  );
}
