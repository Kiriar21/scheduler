import React, { useState, useEffect, useContext } from 'react';
import styles from './Settings.module.scss';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom'; 
import { checkTokenExpiration } from '../../utils/checkTokenExpiration';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';

const SettingsPage = () => {
  // Stan dla użytkownika
  const [user, setUser] = useState(null);
  const { fetchAvailableSchedulers } = useContext(SchedulerContext);
  // Stany dla formularza schedulera
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate(); // Inicjalizacja useNavigate

  // Tablica miesięcy
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

  // Pobierz dane użytkownika po załadowaniu komponentu
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const isTokenValidFlag = checkTokenExpiration();
        if (!isTokenValidFlag) {
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
      } catch (error) {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
        setMessage({ text: 'Nie udało się pobrać danych użytkownika.', type: 'error' });
      }
    };

    fetchUserData();
  }, [navigate]);

  // Obsługa tworzenia schedulera
  const handleCreateScheduler = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setIsLoading(true);

    // Walidacja pól
    if (!selectedMonth || !selectedYear) {
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

    // Upewnij się, że user i user.team są zdefiniowane
    if (!user || !user.team) {
      setMessage({ text: 'Nie można znaleźć zespołu użytkownika.', type: 'error' });
      setIsLoading(false);
      return;
    }

    // Sprawdzenie, czy user.team jest stringiem czy obiektem
    const teamId = typeof user.team === 'string' ? user.team : user.team._id;


    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        '/scheduler/create',
        {
          teamId: teamId,
          month: selectedMonth,
          year: selectedYear,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: response.data.message || 'Grafik został pomyślnie utworzony.', type: 'success' });
      // Resetowanie formularza po sukcesie
      setSelectedMonth('');
      setSelectedYear(currentYear);
      await fetchAvailableSchedulers()
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

  // Jeżeli dane użytkownika nie zostały jeszcze załadowane
  if (!user) {
    return (
      <div className={styles.content}>
        <h2>Ustawienia Grafiku</h2>
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <h2>Ustawienia Grafiku</h2>
      
      {/* Formularz dodawania schedulera */}
      <div className={styles.container}>
        <form onSubmit={handleCreateScheduler}>
          <h3>Dodaj Grafik</h3>

          {/* Wybór roku */}
          <div className={styles.input}>
            <label htmlFor="year">Rok:</label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              required
            >
              {Array.from({ length: 5 }, (_, index) => (
                <option key={index} value={currentYear + index}>
                  {currentYear + index}
                </option>
              ))}
            </select>
          </div>

          {/* Wybór miesiąca */}
          <div className={styles.input}>
            <label htmlFor="month">Miesiąc:</label>
            <select
              id="month"
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
    </div>
  );
};

export default SettingsPage;
