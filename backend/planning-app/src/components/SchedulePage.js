import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import html2canvas from 'html2canvas';
import './SchedulePage.css';
import ClockPicker from './ClockPicker';
import Modal from './Modal';
import TweetModal from './TweetModal';
import Header from './Header';

const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const initialSchedule = [
  { day: 'Lundi', slots: [], startTime: '', endTime: '', theme: '' },
  { day: 'Mardi', slots: [], startTime: '', endTime: '', theme: '' },
  { day: 'Mercredi', slots: [], startTime: '', endTime: '', theme: '' },
  { day: 'Jeudi', slots: [], startTime: '', endTime: '', theme: '' },
  { day: 'Vendredi', slots: [], startTime: '', endTime: '', theme: '' },
  { day: 'Samedi', slots: [], startTime: '', endTime: '', theme: '' },
  { day: 'Dimanche', slots: [], startTime: '', endTime: '', theme: '' },
];

const MINUTES_IN_DAY = 24 * 60; // Nombre total de minutes dans une journée

const colors = ['#4CAF50', '#FF9800', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4', '#795548']; // Couleurs utilisées pour les créneaux

const SchedulePage = () => {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [tweetMessage, setTweetMessage] = useState("Voici mon planning!");
  const [showSlots, setShowSlots] = useState(true);
  const [twitchUsername, setTwitchUsername] = useState('');
  const [current, setCurrent] = useState({ day: "", startTime: "", endTime: "", theme: "" });
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [isTwitterLinked, setIsTwitterLinked] = useState(false); // Nouvel état pour vérifier la liaison de Twitter

  useEffect(() => {
    fetch('/api/twitch_username')
      .then(response => response.json())
      .then(data => setTwitchUsername(data.twitch_username))
      .catch(error => console.error('Error fetching Twitch username:', error));

    // Vérifiez si l'utilisateur a un compte Twitter lié
    fetch('/api/check_twitter_link')
      .then(response => response.json())
      .then(data => setIsTwitterLinked(data.isLinked))
      .catch(error => console.error('Error checking Twitter link:', error));
  }, []);

  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => { img.src = e.target.result; };
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(callback, file.type, 1);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    resizeImage(file, 1920, 1080, (blob) => setBackgroundImage(URL.createObjectURL(blob)));
  };

  const handleInputChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleValidation = (index) => {
    const { startTime, endTime, theme } = schedule[index];
    let valid = true;
    let errors = {};

    if (!startTime) {
      valid = false;
      errors.startTime = "Heure de début est requise.";
    }
    if (!endTime) {
      valid = false;
      errors.endTime = "Heure de fin est requise.";
    }
    if (!theme) {
      valid = false;
      errors.theme = "Thème est requis.";
    }
    if (valid) {
      if (startTime >= endTime) {
        valid = false;
        errors.general = "Format horaire incorrect.";
      } else if (schedule[index].slots.some(slot => (startTime < slot.endTime && endTime > slot.startTime))) {
        valid = false;
        errors.general = "Créneau invalide.";
      }
    }

    if (valid) {
      const newSchedule = [...schedule];
      newSchedule[index].slots.push({ startTime, endTime, theme });
      newSchedule[index].slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      newSchedule[index].startTime = '';
      newSchedule[index].endTime = '';
      newSchedule[index].theme = '';
      setErrors({});
      setSchedule(newSchedule);
    } else {
      setErrors(errors);
    }
  };

  const handleSlotDelete = (dayIndex, slotIndex) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(newSchedule);
    toast.info('Créneau supprimé.');
  };

  const handleSave = () => {
    const hasSlots = schedule.some(day => day.slots.length > 0);
    if (!hasSlots) {
      toast.error('Il faut au minimum un créneau horaire d\'établi pour pouvoir générer un planning.');
      return;
    }

    const planningElement = document.querySelector('.planning-preview');
    if (planningElement) {
      html2canvas(planningElement).then(canvas => {
        const link = document.createElement('a');
        link.download = 'planning.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
        toast.success('Planning enregistré avec succès.');
      });
    }
  };

  const handleTweet = () => {
    if (!previewImage) {
      html2canvas(document.querySelector('.planning-preview')).then(canvas => {
        const imageData = canvas.toDataURL('image/jpeg');
        setPreviewImage(imageData);
        setIsTweetModalOpen(true);
      });
    } else {
      fetch('/publish_to_twitter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: tweetMessage, image: previewImage }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          toast.success('Tweet publié avec succès!');
          setIsTweetModalOpen(false); // Close the modal only on successful tweet
        } else {
          toast.error(`Erreur lors de la publication: ${data.message}`);
        }
      })
      .catch(error => {
        toast.error(`Erreur lors de la publication: ${error.message}`);
      });
    }
  };

  const openTweetModal = () => {
    if (!isTwitterLinked) {
      toast.error('Vous devez lier votre compte Twitter pour publier un tweet.');
      return;
    }
    html2canvas(document.querySelector('.planning-preview')).then(canvas => {
      const imageData = canvas.toDataURL('image/jpeg');
      setPreviewImage(imageData);
      setIsTweetModalOpen(true);
    });
  };

  const isTimeValid = (startTime, endTime) => startTime < endTime;

  const isSlotValid = (slots, newSlot) => !slots.some(slot =>
    (newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
    (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
    (newSlot.startTime < slot.startTime && newSlot.endTime > slot.startTime)
  );

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
const PLANNING_HEIGHT = 600; // Ajuster cette valeur pour augmenter la hauteur

  return (
    <div className="app">
      <Header />
      <div className="planning-container">
        {errors.general && <div className="error">{errors.general}</div>}
        <div className="form-group img-upl">
          <label htmlFor="backgroundImage">Télécharger une image de fond</label>
          <input
            type="file"
            id="backgroundImage"
            className="form-control"
            onChange={handleBackgroundImageUpload}
          />
        </div>
        <table className="planning-table">
          <thead>
            <tr>
              <th>Jour</th>
              <th>Heure de début</th>
              <th>Heure de fin</th>
              <th>Thème</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((day, index) => (
              <tr key={index}>
                <td>{day.day}</td>
                <td>
                  <ClockPicker
                    value={day.startTime}
                    onTimeSelect={(time) => handleInputChange(index, 'startTime', time)}
                  />
                </td>
                <td>
                  <ClockPicker
                    value={day.endTime}
                    onTimeSelect={(time) => handleInputChange(index, 'endTime', time)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={day.theme}
                    onChange={(e) => handleInputChange(index, 'theme', e.target.value)}
                    placeholder="Thème"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => handleValidation(index)}
                  >
                    Valider
                  </button>
                  {errors.startTime && <div className="error">{errors.startTime}</div>}
                  {errors.endTime && <div className="error">{errors.endTime}</div>}
                  {errors.theme && <div className="error">{errors.theme}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-responsive img-upl">
          <h2>
            Créneaux enregistrés
            <button className="btn btn-link" onClick={() => setShowSlots(!showSlots)}>
              {showSlots ? 'Réduire' : 'Agrandir'}
            </button>
          </h2>
          {showSlots && (
            <table className="table">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Heure de début</th>
                  <th>Heure de fin</th>
                  <th>Thème</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedule.flatMap((day, dayIndex) =>
                  day.slots.map((slot, slotIndex) => (
                    <tr key={`${day.day}-${slotIndex}`}>
                      <td>{day.day}</td>
                      <td>{slot.startTime}</td>
                      <td>{slot.endTime}</td>
                      <td>{slot.theme}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleSlotDelete(dayIndex, slotIndex)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="planning-preview" style={{ position: 'relative', height: `${PLANNING_HEIGHT + 60}px` }}>
          <div
            className="background-overlay"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <table className="planning-table">
            <thead>
              <tr>
                {schedule.map((day, index) => (
                  <th key={index} className="day-plan">{day.day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {schedule.map((day, dayIndex) => (
                  <td
                    key={dayIndex}
                    className="day-column"
                    style={{
                      height: `${PLANNING_HEIGHT}px`, // Ajuster la hauteur pour le planning
                      position: 'relative',
                      overflow: 'hidden',
                      // backgroundColor: day.slots.length === 0 ? 'white' : 'transparent',
                    }}
                  >
                    {day.slots.map((slot, slotIndex) => {
                      const { height, top } = ((startTime, endTime) => {
                        const start = convertTimeToMinutes(startTime);
                        const end = convertTimeToMinutes(endTime);
                        const duration = end - start;
                        const height = (duration / MINUTES_IN_DAY) * (PLANNING_HEIGHT - 60); // Calculer la hauteur en pixels
                        const top = (start / MINUTES_IN_DAY) * (PLANNING_HEIGHT - 60); // Calculer la position en pixels
                        return { height, top };
                      })(slot.startTime, slot.endTime);
                      return (
                        <div
                          key={slotIndex}
                          className="slot"
                          style={{
                            height: `${height}px`,
                            top: `${top}px`,
                            backgroundColor: colors[slotIndex % colors.length],
                            width: '95%',
                            position: 'absolute',
                            left: '2.5%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <div className="slot-time">{slot.startTime} - {slot.endTime}</div>
                          <div className="slot-theme">{slot.theme}</div>
                        </div>
                      );
                    })}
                    {day.slots.length === 0 && (
                      <div className="day-off">
                        <div className="day-off-text">O F F</div>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="twitch-info">
            <img src="/static/twitch_logo.png" alt="Twitch Logo" className="twitch-logo" />
            <span className="twitch-text">Twitch.tv/{twitchUsername}</span>
          </div>
        </div>
        <div className="buttons-container">
          <button className="btn btn-enregis mt-3" onClick={handleSave}>Enregistrer</button>
          <button className="btn btn-tweet mt-3" onClick={openTweetModal}>Tweeter</button>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleSave}
          schedule={schedule}
        />
        <TweetModal
          isOpen={isTweetModalOpen}
          handleClose={() => setIsTweetModalOpen(false)}
          handleTweet={handleTweet}
          tweetMessage={tweetMessage}
          setTweetMessage={setTweetMessage}
          previewImage={previewImage}
        />
        <ToastContainer />
      </div>
    </div>
  );
};

export default SchedulePage;

