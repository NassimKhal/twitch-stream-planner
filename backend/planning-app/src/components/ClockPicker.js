// src/components/ClockPicker.js
import React, { useState } from 'react';
import './ClockPicker.css';

const ClockPicker = ({ onTimeSelect }) => {
    const [time, setTime] = useState("");

    const handleTimeChange = (event) => {
        setTime(event.target.value);
        if (onTimeSelect) {
            onTimeSelect(event.target.value);
        }
    };

    return (
        <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="clock-picker"
        />
    );
};

export default ClockPicker;
