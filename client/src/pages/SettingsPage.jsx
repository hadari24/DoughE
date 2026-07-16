import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/settingsService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function SettingsPage() {
  const [form, setForm] = useState({
    userName: localStorage.getItem('userName') || '',
    email: '',
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSettings()
      .then(res => setForm(res.data.data))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.email || !form.theme) {
      return setError('All fields are required');
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
        await updateSettings(form);
        localStorage.setItem('userName', form.userName);
        localStorage.setItem('theme', form.theme);
        if (form.theme === 'dark') {
            document.body.classList.add('dark');
            document.body.classList.remove('pink');
        } else if (form.theme === 'pink') {
            document.body.classList.add('pink');
            document.body.classList.remove('dark');
        } else {
            document.body.classList.remove('dark');
            document.body.classList.remove('pink');
        }
        window.dispatchEvent(new Event('storage'));
        setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="settings-content">
        <h1>Settings</h1>
        {loading && <p>Loading...</p>}
        {!loading && (
          <form onSubmit={handleSubmit} className="settings-form">
            <label>Username</label>
            <input name="userName" value={form.userName} onChange={handleChange} />

            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />

            <label>Theme</label>
            <select name="theme" value={form.theme} onChange={handleChange}>
              <option value="light">Light</option>
              <option value="pink">Pink</option>
              <option value="dark">Dark</option>
            </select>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default SettingsPage;