// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import html2canvas from 'html2canvas';
import './App.css';
import Profile from './components/Profile';  // Importer le composant Profile
import Home from './components/Home';  // Importer le composant Home

function App() {
    const [schedules, setSchedules] = useState({});
    const [currentDay, setCurrentDay] = useState('');
    const [currentStartTime, setCurrentStartTime] = useState(null);
    const [currentEndTime, setCurrentEndTime] = useState(null);
    const [currentTheme, setCurrentTheme] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    const handleSaveSlot = (day) => {
        if (!currentStartTime || !currentEndTime || !currentTheme) {
            alert('Tous les champs doivent être remplis.');
            return;
        }

        const newSchedule = {
            startTime: currentStartTime.toLocaleTimeString(),
            endTime: currentEndTime.toLocaleTimeString(),
            theme: currentTheme,
        };

        setSchedules({
            ...schedules,
            [day]: [...(schedules[day] || []), newSchedule],
        });

        setCurrentStartTime(null);
        setCurrentEndTime(null);
        setCurrentTheme('');
    };

    const handleDeleteSlot = (day, index) => {
        const newDaySchedule = schedules[day].filter((_, i) => i !== index);
        setSchedules({
            ...schedules,
            [day]: newDaySchedule,
        });
    };

    const handleShowModal = () => {
        setModalVisible(true);
        const canvas = document.createElement('canvas');
        html2canvas(document.querySelector("#schedulePreview")).then((canvas) => {
            setModalContent(canvas.toDataURL('image/jpeg'));
        });
    };

    const handleTweet = () => {
        // Logique pour tweeter
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Gestion de Planning</h1>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/schedule">Schedule</Link></li>
                            <li><Link to="/profile">Profile</Link></li>
                        </ul>
                    </nav>
                </header>
                <Switch>
                    <Route path="/schedule">
                        <div className="container">
                            {daysOfWeek.map((day, index) => (
                                <div key={index} className="day-row">
                                    <div className="day-name">{day}</div>
                                    <div className="time-picker">
                                        <label>Heure de début</label>
                                        <Clock value={currentStartTime} onChange={setCurrentStartTime} />
                                    </div>
                                    <div className="time-picker">
                                        <label>Heure de fin</label>
                                        <Clock value={currentEndTime} onChange={setCurrentEndTime} />
                                    </div>
                                    <input type="text" placeholder="Thème" value={currentTheme} onChange={(e) => setCurrentTheme(e.target.value)} />
                                    <button className="save-slot" onClick={() => handleSaveSlot(day)}>Valider</button>
                                </div>
                            ))}
                        </div>
                        <div id="schedulePreview">
                            {daysOfWeek.map((day, index) => (
                                <div key={index} className="day-schedule">
                                    <h3>{day}</h3>
                                    {(schedules[day] || []).map((slot, i) => (
                                        <div key={i} className="time-slot">
                                            {slot.startTime} - {slot.endTime}: {slot.theme}
                                            <button onClick={() => handleDeleteSlot(day, i)} className="delete-slot">Supprimer</button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <button className="save-schedule" onClick={handleShowModal}>Enregistrer</button>
                        <button className="publish-twitter" onClick={handleTweet}>Tweeter</button>
                        {modalVisible && (
                            <div className="modal">
                                <div className="modal-content">
                                    <h3>Voulez-vous confirmer et enregistrer ce planning?</h3>
                                    <img src={modalContent} alt="Planning Preview" />
                                    <button className="confirm-button">Confirmer</button>
                                    <button className="cancel-button" onClick={() => setModalVisible(false)}>Annuler</button>
                                </div>
                            </div>
                        )}
                    </Route>
                    <Route path="/profile" component={Profile} />
                    <Route path="/" component={Home} />
                </Switch>
            </div>
        </Router>
    );
}

export default App;
