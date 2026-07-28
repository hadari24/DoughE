import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/authService';
import logo from '../logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const applyTheme = (theme) => {
    document.body.classList.remove('dark', 'pink');
    if (theme === 'dark') document.body.classList.add('dark');
    else if (theme === 'pink') document.body.classList.add('pink');
  };

  const storeAndGo = (user) => {
    const theme = user.theme || 'light';
    localStorage.setItem('userId', user.userId);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('userRole', user.userRole);
    localStorage.setItem('userName', user.firstName);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    navigate('/dashboard');
  };

  const validate = () => {
    if (isSignup && (!firstName || !lastName)) return 'First and last name are required';
    if (!email || !/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    if (!password || password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    setError('');
    try {
      if (isSignup) {
        const res = await signup({ firstName, lastName, email, password });
        storeAndGo(res.data.data);
      } else {
        const res = await login(email, password);
        storeAndGo(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || (isSignup ? 'Could not create account' : 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img src={logo} alt="Dough-E logo" className="login-logo-img" />
        <h1>Dough-E</h1>
        <h2>{isSignup ? 'Create your account' : 'Welcome back!'}</h2>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? (isSignup ? 'Creating...' : 'Logging in...') : (isSignup ? 'Sign up' : 'Login')}
          </button>
        </form>

        <p style={{ marginTop: 12, fontSize: 14 }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={switchMode}
            style={{ background: 'none', border: 'none', color: 'var(--accent, #8B5E34)', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>

        <button type="button" className="guest-button" onClick={() => {
          localStorage.setItem('userId', 'guest');
          localStorage.setItem('firstName', 'Guest');
          localStorage.setItem('userRole', 'user');
          localStorage.setItem('theme', 'light');
          applyTheme('light');
          navigate('/dashboard');
        }}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
