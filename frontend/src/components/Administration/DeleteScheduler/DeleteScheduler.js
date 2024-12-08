/**
 * Komponent formularza do usuwania istniejącego grafiku.
 * @component
 */
import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

//Usuwanie grafiku - komponent
const DeleteScheduler = () => {
  const { teams } = useContext(AdminContext); // Pobieramy zespoły z kontekstu
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamDates, setTeamDates] = useState([]); // Daty dla wybranego zespołu
  const [selectedDate, setSelectedDate] = useState({ year: '', month: '' });
  const [error, setError] = useState(''); // Obsługa błędów

  /**
 * Pobiera dostępne daty grafików dla wybranego zespołu.
 * @async
 * @function fetchTeamDates
 * @param {string} teamId - Identyfikator zespołu
 * @returns {Promise<void>}
 */
// Pobierz daty grafików dla wybranego zespołu
  const fetchTeamDates = async (teamId) => {
    try {
      setError('');
      setTeamDates([]); // Resetuj daty przy każdej zmianie zespołu
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/schedulers/${teamId}/dates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamDates(response.data.dates);
    } catch (error) {
      console.error('Error fetching team dates:', error);
      setError('Nie znaleziono grafików dla tego zespołu.');
    }
  };

  /**
 * Obsługuje usunięcie wybranego grafiku na podstawie zespołu, roku i miesiąca.
 * @async
 * @function handleDelete
 * @param {object} e - Obiekt zdarzenia
 * @returns {Promise<void>}
 */
// Obsługa usuwania grafiku
  const handleDelete = async (e) => {
    e.preventDefault();
    const { year, month } = selectedDate;

    if (!selectedTeam || !year || !month) {
      alert('Proszę wybrać zespół, rok i miesiąc.');
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      await axiosInstance.delete('/scheduler/delete', {
        headers: { Authorization: `Bearer ${token}` },
        data: { teamId: selectedTeam, year, month },
      });

      alert('Scheduler został pomyślnie usunięty.');
      fetchTeamDates(selectedTeam); // Odśwież listę dat po usunięciu
      setSelectedDate({ year: '', month: '' });
    } catch (error) {
      console.error('Error deleting scheduler:', error);
      setError('Wystąpił błąd podczas usuwania grafiku.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleDelete}>
        <h3>Usuń grafik</h3>



        {/* Wybór zespołu */}
        <div className={styles.input}>
          <label>Zespół:</label>
          <select
            value={selectedTeam}
            onChange={(e) => {
              const teamId = e.target.value;
              setSelectedTeam(teamId);
              setSelectedDate({ year: '', month: '' }); // Resetuj daty
              if (teamId) {
                fetchTeamDates(teamId); // Pobierz daty dla zespołu
              } else {
                setTeamDates([]); // Resetuj daty, jeśli brak wyboru
              }
            }}
            required
          >
            <option value="">Wybierz zespół</option>
            {teams.length === 0 ? (
              <option value="" disabled>
                Brak zespołów
              </option>
            ) : (
              teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Wybór roku */}
        {teamDates.length > 0 && (
          <div className={styles.input}>
            <label>Rok:</label>
            <select
              value={selectedDate.year}
              onChange={(e) =>
                setSelectedDate((prev) => ({ ...prev, year: e.target.value }))
              }
              required
            >
              <option value="">Wybierz rok</option>
              {[...new Set(teamDates.map((date) => date.year))].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Wybór miesiąca */}
        {selectedDate.year && (
          <div className={styles.input}>
            <label>Miesiąc:</label>
            <select
              value={selectedDate.month}
              onChange={(e) =>
                setSelectedDate((prev) => ({ ...prev, month: e.target.value }))
              }
              required
            >
              <option value="">Wybierz miesiąc</option>
              {teamDates
                .filter((date) => date.year === parseInt(selectedDate.year, 10))
                .map((date) => (
                  <option key={date.month} value={date.month}>
                    {date.month}
                  </option>
                ))}
            </select>
          </div>
        )}
        {/* Obsługa błędów */}
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.deleteButton} disabled={!teamDates.length}>
          Usuń
        </button>
      </form>
    </div>
  );
};

export default DeleteScheduler;
