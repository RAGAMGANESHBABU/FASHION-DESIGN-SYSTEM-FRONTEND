import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      setAuthorized(false);  // redirect to login
    } else if (adminOnly && role !== 'admin') {
      setAuthorized(false);  // redirect to dashboard if not admin
    } else {
      setAuthorized(true);   // allowed
    }
  }, [adminOnly]);

  if (authorized === null) {
    // while checking localStorage, show nothing or loader
    return null;
  }

  if (!authorized) {
  const token = localStorage.getItem('token');
  // check role only if needed
  const redirectPath = (token && adminOnly) ? '/dashboard' : '/';
  return <Navigate to={redirectPath} />;
}


  return children;
};

export default PrivateRoute;
