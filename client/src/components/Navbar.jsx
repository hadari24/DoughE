import { Link, useNavigate } from 'react-router-dom';
import { logout, getMe } from '../services/authService';
import { useState, useEffect } from 'react';
import logo from '../logo.png';

function Navbar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId && userId !== 'guest') {
      getMe(userId).then(res => setUserName(res.data.data.userName));
    }

    const handleStorage = () => setUserName(localStorage.getItem('userName'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="navbar-logo">
          <img src={logo} alt="Dough-E logo" className="navbar-logo-img" />
          Dough-E
        </Link>
        <Link to="/dashboard">Home</Link>
        <Link to="/profile">Profile</Link>
        {localStorage.getItem('userRole') === 'admin' && (
          <Link to="/admin/users">Manage Users</Link>
        )}
        <Link to="/settings">Settings</Link>
      </div>
      <div className="navbar-user">
        <span>Hello, {userName}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;