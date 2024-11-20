import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

const AddScheduler = () => {
  const { teams, fetchTeams } = useContext(AdminContext);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState({ text: '', type: '' }); // Jeden stan dla komunikatów
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    'styczeń',
    'luty',
    'marzec',
    'kwiecień',
    'maj',
    'czerwiec',
    'lipiec',
    'sierpień',
    'wrzesień',
    'październik',
    'listopad',
    'grudzień',
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const handleCreateScheduler = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Resetuj komunikaty
    setIsLoading(true);

    if (!selectedTeam || !selectedMonth || !selectedYear) {
      setMessage({ text: 'Proszę wypełnić wszystkie pola.', type: 'error' });
      setIsLoading(false);
      return;
    }

    const selectedMonthIndex = months.indexOf(selectedMonth);
    if (
      selectedYear < currentYear ||
      (selectedYear === currentYear && selectedMonthIndex < currentMonth)
    ) {
      setMessage({
        text: 'Grafiki mogą być tworzone tylko dla bieżącego lub przyszłego miesiąca.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        '/scheduler/create',
        {
          teamId: selectedTeam,
          month: selectedMonth,
          year: selectedYear,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: response.data.message || 'Grafik został pomyślnie utworzony.', type: 'success' });
      fetchTeams(); // Odśwież zespoły po utworzeniu
      setSelectedTeam('');
      setSelectedMonth('');
      setSelectedYear(currentYear);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage({ text: error.response.data.error, type: 'error' });
      } else {
        setMessage({ text: 'Wystąpił błąd podczas tworzenia grafiku.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleCreateScheduler}>
        <h3>Dodaj Grafik</h3>

        {/* Wybór zespołu */}
        <div className={styles.input}>
          <label>Zespół:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            required
          >
            <option value="">Wybierz zespół</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Wybór roku */}
        <div className={styles.input}>
            <label>Rok:</label>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                required
            >
                {[...Array(5)].map((_, index) => (
                <option key={index} value={currentYear + index}>
                    {currentYear + index}
                </option>
                ))}
            </select>
        </div>


        {/* Wybór miesiąca */}
        <div className={styles.input}>
          <label>Miesiąc:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            required
          >
            <option value="">Wybierz miesiąc</option>
            {months.map((month, index) => (
              <option
                key={index}
                value={month}
                disabled={selectedYear === currentYear && index < currentMonth}
              >
                {month}
              </option>
            ))}
          </select>
        </div>

       
        {/* Animacja ładowania */}
        {isLoading && (
          <div className={styles.loader}>
            <span className={styles.spinner}></span>
          </div>
        )}

        {/* Wyświetlanie komunikatów */}
        {message.text && (
          <p className={message.type === 'success' ? styles.success : styles.error}>
            {message.text}
          </p>
        )}

        {/* Przycisk tworzenia grafiku */}
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Tworzenie...' : 'Utwórz Grafik'}
        </button>
      </form>
    </div>
  );
};

export default AddScheduler;
