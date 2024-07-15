import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    fetch('/api/check_auth')
      .then(response => response.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setTwitchUsername(data.username);
          setProfileImageUrl(data.profile_image_url);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(error => console.error('Error checking authentication:', error));
  }, []);

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/home">Accueil</Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            {!isAuthenticated ? (
              <li className="nav-item">
                <a className="btn-twitch" href="/login">
                  <img src="/static/twitch_logo.png" alt="Twitch Logo" style={{ height: '20px', width: '20px', marginRight: '5px' }} />
                  Se connecter avec Twitch
                </a>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">Gestion du Profil</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/schedule">Planning</Link>
                </li>
                <li className="nav-item dropdown">
                  <div className="dropdown-toggle nav-link" onClick={toggleLogout}>
                    Connecté en tant que : {twitchUsername} 
                    <img src={profileImageUrl} alt="Profile" className="rounded-circle profile-image" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                  </div>
                  {showLogout && (
                    <div className="dropdown-menu dropdown-menu-right show">
                      <button className="dropdown-item" onClick={handleLogout}>Déconnexion</button>
                    </div>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
