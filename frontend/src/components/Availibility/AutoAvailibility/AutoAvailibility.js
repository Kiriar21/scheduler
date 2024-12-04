// components/Availibility/AutoAvailibility/AutoAvailibility.js

import React, { useState } from 'react';
import styles from './AutoAvailibility.module.scss';

const AutoFillAvailability = ({ onAutoFill }) => {
  const [prefferedHours, setPrefferedHours] = useState('');
  const [availability, setAvailability] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const daysOptions = [
    { label: 'Poniedziałek', value: 'poniedziałek' },
    { label: 'Wtorek', value: 'wtorek' },
    { label: 'Środa', value: 'środa' },
    { label: 'Czwartek', value: 'czwartek' },
    { label: 'Piątek', value: 'piątek' },
    { label: 'Sobota', value: 'sobota' },
    { label: 'Niedziela', value: 'niedziela' },
    { label: 'Cały weekend', value: 'weekend' },
    { label: 'Cały tydzień (Pon-Pt)', value: 'weekday' },
    { label: 'Cały miesiąc', value: 'all' },
  ];

  const handleDaySelection = (e) => {
    const value = e.target.value;
    let days = [];
    if (value === 'weekend') {
      days = ['sobota', 'niedziela'];
    } else if (value === 'weekday') {
      days = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek'];
    } else if (value === 'all') {
      days = ['all'];
    } else {
      days = [value];
    }
    setSelectedDays(days);
  };

  const handleApply = () => {
    if (selectedDays.length === 0) {
      alert('Wybierz dni do wypełnienia.');
      return;
    }
    onAutoFill(selectedDays, prefferedHours, availability);
    // Resetuj pola
    setPrefferedHours('');
    setAvailability('');
    setSelectedDays([]);
  };

  return (
    <div className={styles.autoFill}>
      <h3>Autouzupełnianie</h3>
      <div className={styles.form}>
        <label>Preferowane:</label>
        <input
          type="text"
          value={prefferedHours}
          onChange={(e) => setPrefferedHours(e.target.value)}
        />
      </div>
      <div className={styles.form}>
        <label>Dostępność:</label>
        <input
          type="text"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>
      <div className={styles.form}>
        <label>Wybierz dni:</label>
        <select onChange={handleDaySelection}>
          <option value="">--Wybierz--</option>
          {daysOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleApply}>Zastosuj</button>
    </div>
  );
};

export default AutoFillAvailability;
