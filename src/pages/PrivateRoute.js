import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) return <Navigate to="/login" />;

  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" />;

  return children;
};

export default PrivateRoute;
