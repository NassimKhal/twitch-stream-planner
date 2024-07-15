import React from 'react';
import './TweetModal.css';

const TweetModal = ({ isOpen, handleClose, handleTweet, tweetMessage, setTweetMessage, previewImage }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Prévisualisation du Tweet</h3>
        <textarea 
          value={tweetMessage} 
          onChange={(e) => setTweetMessage(e.target.value)} 
          placeholder="Entrez votre message ici..."
        />
        <div className="tweet-preview">
          <p>{tweetMessage}</p>
          <img src={previewImage} alt="Aperçu du planning" />
        </div>
        <div className="modal-buttons">
          <button className="btn btn-publier" onClick={handleTweet}>Publier</button>
          <button className="btn btn-annuler" onClick={handleClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default TweetModal;
