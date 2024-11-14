import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axios from 'axios';

const DeleteScheduler = () => {
  const { fetchSchedulers } = useContext(AdminContext);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const months = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!year || !month) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('/scheduler/delete', {
        headers: { Authorization: `Bearer ${token}` },
        data: { year, month }
      });
      fetchSchedulers();
      setYear('');
      setMonth('');
    } catch (error) {
      console.error('Error deleting scheduler:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleDelete}>
        <h3>Usuń grafik</h3>
        <div className={styles.input}>
          <label>Rok:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} required>
            <option value="">Wybierz rok</option>
            {[2023, 2024, 2025].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.input}>
          <label>Miesiąc:</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} required>
            <option value="">Wybierz miesiąc</option>
            {months.map((mnth) => (
              <option key={mnth} value={mnth}>
                {mnth}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.deleteButton}>Usuń</button>
      </form>
    </div>
  );
};

export default DeleteScheduler;
