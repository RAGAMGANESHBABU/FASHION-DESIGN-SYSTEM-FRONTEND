import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-content">
        <div className="admin-logo">🛒 Admin Panel</div>
        <ul className="admin-nav-links">
          <li onClick={() => navigate('/admin')}>Products</li>
          <li onClick={() => navigate('/admin/orders')}>Orders</li>
          <li onClick={() => navigate('/admin/users')}>Users</li> {/* ✅ new link */}
          <li onClick={() => navigate('/')}>Logout</li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
