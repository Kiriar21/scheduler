/**
 * Komponent modalnego okna do edycji godzin pracy w danym dniu.
 * @component
 * @param {boolean} isOpen - Czy modal jest otwarty
 * @param {function} onClose - Funkcja zamykająca modal
 * @param {function} onSave - Funkcja zapisująca zmiany
 * @param {object} initialData - Początkowe dane godzin
 * @param {object} dayInfo - Informacje o wybranym dniu
 */
import React, { useState, useEffect } from 'react';
import styles from './TimeEditModal.module.scss';

//Modal do edycji godzin w danym dniu
const TimeEditModal = ({ isOpen, onClose, onSave, initialData, dayInfo }) => {
  const [startHour, setStartHour] = useState(initialData.start_hour || 0);
  const [endHour, setEndHour] = useState(initialData.end_hour || 0);
  const [availability, setAvailability] = useState(initialData.availability || '');
  const [preferredHours, setPreferredHours] = useState(initialData.prefferedHours || '');

  useEffect(() => {
    if (isOpen) {
      setStartHour(initialData.start_hour || 0);
      setEndHour(initialData.end_hour || 0);
      setAvailability(initialData.availability || '');
      setPreferredHours(initialData.prefferedHours || '');
    }
  }, [isOpen, initialData]);

  /**
 * Obsługuje zapis zmian godzin w modalnym oknie.
 * @function handleSave
 */
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
        <h2>
          Edytuj godziny - Dzień {dayInfo?.dayOfMonth} ({dayInfo?.nameDayOfWeek})
        </h2>
        <div className={styles.infoGroup}>
          <p><strong>Dostępność:</strong> {availability}</p>
          <p><strong>Preferowane godziny:</strong> {preferredHours}</p>
        </div>
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
