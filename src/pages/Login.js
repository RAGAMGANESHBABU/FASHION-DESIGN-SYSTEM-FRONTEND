import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Login page ki velle prathi sari, localStorage clear avvadam
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${BASE_URL}/users/login`, { email, password });

    if (res.data?.user) {
      const user = res.data.user;

      // Store user and token properly
      localStorage.setItem('token', 'yes'); // replace with JWT if available
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on isAdmin
      if (!user.isAdmin) {
        navigate('/dashboard'); // admin dashboard
      } else {
        navigate('/admin'); // normal user dashboard
      }
    } else {
      alert('Invalid login response from server.');
    }
  } catch (error) {
    console.error('Login error:', error);

    if (error.response) {
      alert(error.response.data?.error || 'Invalid credentials');
    } else if (error.request) {
      alert('No response from server. Check your backend or internet.');
    } else {
      alert('Error: ' + error.message);
    }
  }
};



  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <p className="redirect-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
