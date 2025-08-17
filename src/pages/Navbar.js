import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
        Fashion Dashboard
      </div>
      <ul className="navbar-menu">
        <li onClick={() => navigate('/dashboard')}>Home</li>
        <li onClick={() => navigate('/orders')}>Orders</li>
        <li onClick={() => navigate('/cart')}>Cart 🛒</li>
        <li onClick={() => navigate('/profile')}>Profile</li>
        <li onClick={() => navigate('/')}>Logout</li>
      </ul>
    </nav>
  );
}

export default Navbar;
