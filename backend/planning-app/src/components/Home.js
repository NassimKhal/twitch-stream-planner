// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Header from './Header';

const Home = () => {
  return (
    <div>
      <Header />
      <div className="jumbotron text-center">
        <h1 className="display-4">Bienvenue sur la plateforme de gestion de streamers!</h1>
        <p className="lead">C'est un outil complet conçu pour aider les streamers Twitch à gérer leurs plannings de streaming, leurs thèmes, et plus encore.</p>
        <hr className="my-4" />
        <p>Utilisez la barre de navigation pour accéder aux différentes parties de la plateforme.</p>
        <Link className="btn btn-primary btn-lg" to="/schedule" role="button">Planifier un stream</Link>
        <a className="btn btn-secondary btn-lg" href="/login" role="button">Connexion</a>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h2>Gestion des plannings</h2>
            <p>Planifiez vos streams de manière efficace et efficiente avec nos outils de planification.</p>
            <Link className="btn btn-success" to="/schedule" role="button">Voir les détails &raquo;</Link>
          </div>
          <div className="col-md-6">
            <h2>Compte utilisateur</h2>
            <p>Gérez les paramètres de votre compte et les préférences de stream.</p>
            <a className="btn btn-info" href="/login" role="button">Gérer le compte &raquo;</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
