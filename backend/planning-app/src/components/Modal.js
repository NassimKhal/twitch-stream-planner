// src/components/Modal.js
import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Modal.css';

const Modal = ({ isOpen, onClose, onConfirm, schedule }) => {
    if (!isOpen) return null;

    const handleDownload = async () => {
        const element = document.querySelector('.schedule-preview');
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 10, 10);
        pdf.save('planning.pdf');
        onConfirm();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirmer et enregistrer le planning</h2>
                <div className="schedule-preview">
                    {Object.keys(schedule).map(day => (
                        <div key={day}>
                            <h3>{day}</h3>
                            <ul>
                                {schedule[day].map((slot, index) => (
                                    <li key={index}>
                                        {slot.startTime} - {slot.endTime}: {slot.theme}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <p>Voulez-vous confirmer et enregistrer ce planning?</p>
                <div className="modal-buttons">
                    <button className="btn-confirm" onClick={handleDownload}>Confirmer</button>
                    <button className="btn-cancel" onClick={onClose}>Annuler</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
