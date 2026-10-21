import { useState } from 'react';
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const demoCredentials = {
  officer: {
    username: 'officer',
    password: 'CMSdemo1!',
    title: 'Admission Officer',
  },
  vc: {
    username: 'vc',
    password: 'CMSdemo2!',
    title: 'Vice-Chairman',
  },
};

export default function LoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { auth, loginDemoUser } = useAppContext();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (!demoCredentials[role]) {
    return <Navigate to="/" replace />;
  }

  if (auth.role === role) {
    return <Navigate to={role === 'officer' ? '/officer/dashboard' : '/vc/dashboard'} replace />;
  }

  const credentialSet = demoCredentials[role];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (form.username === credentialSet.username && form.password === credentialSet.password) {
      loginDemoUser(role, form.username);
      navigate(role === 'officer' ? '/officer/dashboard' : '/vc/dashboard', { replace: true });
      return;
    }
    setError('Invalid demo credentials. Please use the supplied demo username and password.');
  };

  return (
    <main className="page-shell auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/cms-logo.png" alt="CMS College logo" className="brand-logo small" />
          <div>
            <p className="eyebrow accent">CMS College Portal</p>
            <h2>{credentialSet.title} Login</h2>
          </div>
        </div>

        <div className="security-banner">
          <ShieldCheck size={18} />
          <span>Demo-only credentials. Production authentication must be implemented by the backend.</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Enter username"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter password"
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" className="primary-btn full-width">
            <LogIn size={18} /> Sign in
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-row">
            <LockKeyhole size={16} />
            <span>Username: <strong>{credentialSet.username}</strong></span>
          </div>
          <div className="demo-row">
            <LockKeyhole size={16} />
            <span>Password: <strong>{credentialSet.password}</strong></span>
          </div>
        </div>
      </div>
    </main>
  );
}
