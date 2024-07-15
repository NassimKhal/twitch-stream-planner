// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch('/api/check_auth')
      .then(response => response.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
      })
      .catch(error => {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    // En attendant la vérification de l'authentification
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/home" replace />;
};

export default ProtectedRoute;
