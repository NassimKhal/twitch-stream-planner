import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import SchedulePage from './components/SchedulePage';
import { UserProvider } from './UserContext';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/login" element={<Home />} /> {/* Ajout de cette ligne */}
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
