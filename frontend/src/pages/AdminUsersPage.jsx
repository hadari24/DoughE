import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/usersService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ROLES = ['user', 'manager', 'admin'];
const empty = { firstName: '', lastName: '', email: '', password: '', userRole: 'user' };

function AdminUsersPage() {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const myId = parseInt(localStorage.getItem('userId'));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    getUsers()
      .then(res => setUsers(res.data.data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const create = async (e) => {
    e.preventDefault();
    setFormError(''); setFormOk('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) return setFormError('All fields are required');
    if (form.password.length < 6) return setFormError('Password must be at least 6 characters');
    setSaving(true);
    try {
      await createUser(form);
      setFormOk(`Created ${form.firstName} (${form.userRole})`);
      setForm(empty);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (u, userRole) => {
    try {
      await updateUser(u.userId, { firstName: u.firstName, lastName: u.lastName, userRole });
      setUsers(list => list.map(x => (x.userId === u.userId ? { ...x, userRole } : x)));
    } catch {
      alert('Failed to update role');
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.firstName} ${u.lastName}?`)) return;
    try {
      await deleteUser(u.userId);
      setUsers(list => list.filter(x => x.userId !== u.userId));
    } catch {
      alert('Failed to delete user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="page">
        <Navbar />
        <div className="dashboard-content">
          <h1>Manage Users</h1>
          <p>Only administrators can access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const S = styles;
  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-content">
        <h1>Manage Users</h1>

        <form onSubmit={create} style={S.form}>
          <h3 style={{ margin: '0 0 10px', color: 'var(--accent)' }}>Add a new user</h3>
          <div style={S.grid}>
            <input style={S.input} placeholder="First name" value={form.firstName} onChange={e => setF('firstName', e.target.value)} />
            <input style={S.input} placeholder="Last name" value={form.lastName} onChange={e => setF('lastName', e.target.value)} />
            <input style={S.input} type="email" placeholder="Email" value={form.email} onChange={e => setF('email', e.target.value)} />
            <input style={S.input} type="password" placeholder="Password (min 6)" value={form.password} onChange={e => setF('password', e.target.value)} />
            <select style={S.input} value={form.userRole} onChange={e => setF('userRole', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" style={S.createBtn} disabled={saving}>{saving ? 'Creating...' : 'Create user'}</button>
          </div>
          {formError && <p className="error-message" style={{ marginTop: 8 }}>{formError}</p>}
          {formOk && <p style={{ color: '#4a7c3a', marginTop: 8 }}>{formOk}</p>}
        </form>

        <h3 style={{ color: 'var(--accent)' }}>All users</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>ID</th>
                <th style={S.th}>Name</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Role / Permissions</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId}>
                  <td style={S.td}>{u.userId}</td>
                  <td style={S.td}>{u.firstName} {u.lastName}</td>
                  <td style={S.td}>{u.email}</td>
                  <td style={S.td}>
                    <select style={S.roleSelect} value={u.userRole} onChange={e => changeRole(u, e.target.value)}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={S.td}>
                    {u.userId !== myId && (
                      <button style={S.delBtn} onClick={() => remove(u)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  form: { background: 'rgba(255,248,235,0.97)', border: '1px solid #eee2d6', borderRadius: 12, padding: 16, margin: '10px 0 24px', maxWidth: 760 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 },
  input: { border: '1px solid #d8cfc4', borderRadius: 8, padding: '9px 11px', fontSize: 14, outline: 'none' },
  createBtn: { background: 'var(--accent)', color: 'var(--accent-contrast)', border: 'none', borderRadius: 8, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' },
  table: { width: '100%', maxWidth: 900, borderCollapse: 'collapse', background: 'rgba(255,248,235,0.97)', borderRadius: 10, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '10px 12px', background: 'var(--accent)', color: 'var(--accent-contrast)', fontSize: 14 },
  td: { padding: '9px 12px', borderBottom: '1px solid #eee2d6', fontSize: 14 },
  roleSelect: { border: '1px solid #d8cfc4', borderRadius: 6, padding: '5px 8px', fontSize: 14 },
  delBtn: { background: '#c0492f', color: 'white', border: 'none', borderRadius: 14, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 },
};

export default AdminUsersPage;
