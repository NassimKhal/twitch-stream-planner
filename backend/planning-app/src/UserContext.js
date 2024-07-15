// src/UserContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/check_auth')
      .then(response => response.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser({
            username: data.username,
            profileImageUrl: data.profile_image_url,
          });
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(error => console.error('Error checking authentication:', error));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};
