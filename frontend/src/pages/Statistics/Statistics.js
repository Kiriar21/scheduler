/**
 * Strona wyświetlająca statystyki miesięczne grafiku.
 * @component
 */
import React, { useContext, useState, useEffect } from 'react';
import styles from './Statistics.module.scss';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';
import axiosInstance from '../../api/axiosInstance';


const StatisticsPage = () => {
  // Pobranie danych z kontekstu grafiku
  const { availableSchedulers, selectedDate, changeScheduler } = useContext(SchedulerContext);

  // Stan przechowujący aktualnie wybrany grafik (miesiąc i rok)
  const [selectedSchedule, setSelectedSchedule] = useState(`${selectedDate.month} ${selectedDate.year}`);
  // Statystyki użytkowników
  const [statistics, setStatistics] = useState([]);
  // Całkowity czas zespołu
  const [totalTeamHours, setTotalTeamHours] = useState(0);
  // ID obecnego użytkownika
  const [currentUserId, setCurrentUserId] = useState('');
  // Flaga ładowania
  const [isLoading, setIsLoading] = useState(false);

/**
 * Pobiera statystyki dla wybranego miesiąca i roku.
 * @async
 * @function fetchStatistics
 * @param {string} month - Nazwa miesiąca
 * @param {number} year - Rok
 * @returns {Promise<void>}
 */

  const fetchStatistics = async (month, year) => {
    setIsLoading(true); // Ustawia stan ładowania na true
    try {
      const token = localStorage.getItem('token'); // Pobranie tokenu z localStorage

      // Wykonanie żądania do API
      const response = await axiosInstance.get('/scheduler/statistics', {
        headers: { Authorization: `Bearer ${token}` }, // Dodanie nagłówka autoryzacji
        params: { month, year }, // Przekazanie parametrów do API
      });

      // Ustawienie danych w stanie
      setCurrentUserId(response.data.currentUserId);
      setStatistics(response.data.statistics);
      setTotalTeamHours(response.data.totalTeamHours);
    } catch (error) {
      console.error('Error fetching statistics:', error); // Logowanie błędu w konsoli
    } finally {
      setIsLoading(false); // Ustawienie stanu ładowania na false
    }
  };


  useEffect(() => {
    const [month, year] = selectedSchedule.split(' '); // Rozdzielenie miesiąca i roku
    fetchStatistics(month, year); // Pobranie statystyk
  }, [selectedSchedule]); // Wywoływany przy zmianie `selectedSchedule`

/**
 * Obsługuje zmianę wybranego grafiku w statystykach.
 * @function handleSelectChange
 * @param {object} e - Obiekt zdarzenia
 */

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value; // Pobranie wybranej wartości
    setSelectedSchedule(selectedValue); // Ustawienie stanu z wybraną wartością
    const [month, year] = selectedValue.split(' '); // Rozdzielenie miesiąca i roku
    changeScheduler(month, parseInt(year, 10)); // Wywołanie funkcji zmieniającej grafik w kontekście
  };

  return (
    <div className={styles.content}>
      <h2>Statystyki Miesięczne</h2>

      {/* Sekcja wyboru grafiku */}
      <div className={styles.selector}>
        <select value={selectedSchedule} onChange={handleSelectChange}>
          {availableSchedulers.map((schedule, index) => (
            <option key={index} value={`${schedule.month} ${schedule.year}`}>
              {schedule.month} {schedule.year}
            </option>
          ))}
        </select>

        {/* Wyświetlenie sumy godzin zespołu */}
        <p className={styles.total}>Suma godzin zespołu: <span>{totalTeamHours}</span></p>
      </div>

      {/* Wyświetlanie statystyk */}
      {isLoading ? (
        // Wiadomość o ładowaniu
        <p>Ładowanie statystyk...</p>
      ) : statistics.length > 0 ? (
        <>
          {/* Tabela z wynikami */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Suma godzin</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat) => (
                <tr
                  key={stat.userId}
                  className={stat.userId === currentUserId ? styles.highlight : ''}
                >
                  <td>{stat.name}</td>
                  <td>{stat.surname}</td>
                  <td><span>{stat.totalHours}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Brak statystyk do wyświetlenia.</p>
      )}
    </div>
  );
};

export default StatisticsPage;
