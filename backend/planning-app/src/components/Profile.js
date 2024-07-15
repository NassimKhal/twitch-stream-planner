// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({});
  const [twitterLinked, setTwitterLinked] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [bioPreview, setBioPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/profile')
      .then(response => {
        setUser(response.data.user);
        setTwitterLinked(response.data.twitter_linked);
        setNewBio(response.data.user.bio);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
        navigate('/home', { state: { message: 'Vous devez être connecté pour accéder à cette page.' } });
      });
  }, [navigate]);

  const handleBioChange = (e) => {
    setNewBio(e.target.value);
    setBioPreview(e.target.value);
  };

  const handleBioUpdate = () => {
    axios.post('/api/profile', { bio: newBio })
      .then(response => {
        setUser({ ...user, bio: newBio });
        alert('Profil mis à jour avec succès');
      })
      .catch(error => console.error('Erreur lors de la mise à jour du profil:', error));
  };

  const handleUnlinkTwitter = () => {
    axios.post('/api/unlink_twitter')
      .then(response => {
        if (response.data.status === 'success') {
          setTwitterLinked(false);
          alert('Compte Twitter délié avec succès');
        } else {
          alert('Erreur lors du déliement du compte Twitter');
        }
      })
      .catch(error => console.error('Erreur lors du déliement du compte Twitter:', error));
  };

  return (
    <div>
      <Header />
      <div className="profile-container">
        <h1>Profil</h1>
        <div className="profile-header">
          <img src={user.profile_image_url} alt="Image de profil" className="profile-image" />
          {twitterLinked ? (
            <div className="twitter-linked">
              <p><strong>Compte Twitter lié :</strong> {user.twitter_username}</p>
              <button className="btn btn-danger" onClick={handleUnlinkTwitter}>Délier Twitter</button>
            </div>
          ) : (
            <div className="twitter-link">
              <a href="/link_twitter" className="btn btn-dark twitter-btn">
                <img src="/static/twitter_favicon.ico" alt="Logo Twitter" />
                Lier Twitter
              </a>
            </div>
          )}
        </div>
        <div className="profile-details">
          <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Abonnés :</strong> {user.followers}</p>
          <p><strong>Bio :</strong> {user.bio}</p>
          <p><strong>Date du dernier stream :</strong> {user.last_stream_date}</p>
          <p><strong>Nom du dernier stream :</strong> {user.last_stream_name}</p>
          <p><strong>Thème du dernier stream :</strong> {user.last_stream_theme}</p>
        </div>
        <form className="bio-form">
          <div className="form-group">
            <label htmlFor="bioTextarea">Mettre à jour la bio</label>
            <textarea
              id="bioTextarea"
              className="form-control"
              value={newBio}
              onChange={handleBioChange}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleBioUpdate}>Mettre à jour la bio</button>
        </form>
        <div className="bio-preview">
          <h3>Aperçu de la bio :</h3>
          <p>{bioPreview}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
