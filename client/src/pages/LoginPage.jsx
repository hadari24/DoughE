import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    if (!password || password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      const user = res.data.data;
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('firstName', user.firstName);
      localStorage.setItem('userRole', user.userRole);
      localStorage.setItem('userName', user.firstName);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>🥖 Dough-E</h1>
        <h2>Welcome back!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button type="button" className="guest-button" onClick={() => {
          localStorage.setItem('userId', 'guest');
          localStorage.setItem('firstName', 'Guest');
          localStorage.setItem('userRole', 'user');
          navigate('/dashboard');
          }}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export default LoginPage;