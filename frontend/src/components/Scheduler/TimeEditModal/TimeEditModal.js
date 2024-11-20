// components/TimeEditModal/TimeEditModal.js
import React, { useState, useEffect } from 'react';
import styles from './TimeEditModal.module.scss';

const TimeEditModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [startHour, setStartHour] = useState(initialData.start_hour || 0);
  const [endHour, setEndHour] = useState(initialData.end_hour || 0);

  useEffect(() => {
    if (isOpen) {
      setStartHour(initialData.start_hour || 0);
      setEndHour(initialData.end_hour || 0);
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({
      start_hour: parseInt(startHour),
      end_hour: parseInt(endHour),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Edytuj godziny</h2>
        <div className={styles.inputGroup}>
          <label>Godzina rozpoczęcia:</label>
          <input
            type="number"
            min="0"
            max="23"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Godzina zakończenia:</label>
          <input
            type="number"
            min="0"
            max="23"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={handleSave}>Zapisz</button>
          <button onClick={onClose}>Anuluj</button>
        </div>
      </div>
    </div>
  );
};

export default TimeEditModal;
