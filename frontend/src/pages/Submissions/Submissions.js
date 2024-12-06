import React, { useState, useEffect } from 'react';
import styles from './Submissions.module.scss';
import axiosInstance from '../../api/axiosInstance';

/**
 * Komponent odpowiedzialny za wyświetlanie raportów użytkowników oraz podsumowań miesięcznych.
 */
const Submissions = () => {
  // Stan przechowujący listę użytkowników
  const [users, setUsers] = useState([]);
  // Stan wybranego ID użytkownika
  const [selectedUserId, setSelectedUserId] = useState('');
  // Szczegółowe dane wybranego użytkownika
  const [selectedUser, setSelectedUser] = useState(null);
  // Lista dostępnych grafików
  const [availableSchedulers, setAvailableSchedulers] = useState([]);
  // Wybrany grafik (miesiąc i rok)
  const [selectedSchedule, setSelectedSchedule] = useState('');
  // Dane szczegółowego raportu użytkownika
  const [reportData, setReportData] = useState([]);
  // Dane podsumowania miesięcznego
  const [summaryData, setSummaryData] = useState([]);
  // Flaga ładowania danych
  const [isLoading, setIsLoading] = useState(false);
  // Łączna liczba godzin użytkownika
  const [totalHours, setTotalHours] = useState(0);
  // Łączna liczba godzin zespołu
  const [totalTeamHours, setTotalTeamHours] = useState(0);

  // Pobieranie listy użytkowników przy załadowaniu komponentu
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Pobierz token z localStorage
        const response = await axiosInstance.get('/team/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.users); // Ustaw listę użytkowników w stanie
      } catch (error) {
        console.error('Błąd podczas pobierania użytkowników:', error);
      }
    };
    fetchUsers();
  }, []);

  // Pobieranie dostępnych grafików
  useEffect(() => {
    const fetchSchedulers = async () => {
      try {
        const token = localStorage.getItem('token'); // Pobierz token z localStorage
        const response = await axiosInstance.get('/schedulers', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const schedulers = response.data.schedulers;
        setAvailableSchedulers(schedulers); // Ustaw listę grafików w stanie

        // Automatyczny wybór grafiku
        if (schedulers.length > 0) {
          const currentDate = new Date();
          const currentMonthIndex = currentDate.getMonth(); // Obecny miesiąc (0-11)
          const currentYear = currentDate.getFullYear();

          const months = [
            'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
            'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
          ];
          const currentMonthName = months[currentMonthIndex];

          // Znajdź grafik dla obecnego miesiąca i roku
          const currentScheduler = schedulers.find(
            (schedule) => schedule.month === currentMonthName && schedule.year === currentYear
          );

          if (currentScheduler) {
            setSelectedSchedule(`${currentScheduler.month} ${currentScheduler.year}`);
          } else {
            // Ustaw ostatni grafik, jeśli brak odpowiedniego
            const lastScheduler = schedulers[schedulers.length - 1];
            setSelectedSchedule(`${lastScheduler.month} ${lastScheduler.year}`);
          }
        }
      } catch (error) {
        console.error('Błąd podczas pobierania grafików:', error);
      }
    };
    fetchSchedulers();
  }, []);

  // Pobieranie danych podsumowania po zmianie wybranego grafiku
  useEffect(() => {
    if (selectedSchedule) {
      fetchSummaryData();
    }
  }, [selectedSchedule]);

  /**
   * Pobierz dane podsumowania dla wybranego grafiku.
   */
  const fetchSummaryData = async () => {
    setIsLoading(true);
    try {
      const [month, year] = selectedSchedule.split(' '); // Rozdziel miesiąc i rok
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler/monthlySummary', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
      });
      setSummaryData(response.data.summaryData);

      // Oblicz łączną liczbę godzin zespołu
      const totalHours = response.data.summaryData.reduce(
        (sum, userData) => sum + userData.totalHoursWorked,
        0
      );
      setTotalTeamHours(totalHours);
    } catch (error) {
      console.error('Błąd podczas pobierania danych podsumowania:', error);
      setSummaryData([]);
      setTotalTeamHours(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Pobieranie danych użytkownika po zmianie użytkownika lub grafiku
  useEffect(() => {
    if (selectedUserId && selectedSchedule) {
      fetchReportData();
    } else {
      setReportData([]);
      setTotalHours(0);
    }
  }, [selectedUserId, selectedSchedule]);

  /**
   * Pobierz dane szczegółowego raportu dla wybranego użytkownika i grafiku.
   */
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [month, year] = selectedSchedule.split(' '); // Rozdziel miesiąc i rok
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler/userMonthlyReport', {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: selectedUserId, month, year },
      });
      setReportData(response.data.reportData);
      setTotalHours(response.data.totalHours); // Ustaw łączną liczbę godzin
    } catch (error) {
      console.error('Błąd podczas pobierania danych raportu:', error);
      setReportData([]);
      setTotalHours(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Obsługa zmiany wybranego użytkownika
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    const user = users.find((u) => u._id === userId);
    setSelectedUser(user || null);
  };

  // Obsługa zmiany wybranego grafiku
  const handleScheduleChange = (e) => {
    setSelectedSchedule(e.target.value);
  };

  /**
   * Pobierz raport użytkownika w formacie XLSX.
   */
  const handleDownload = async () => {
    if (!selectedUserId || !selectedSchedule) {
      alert('Wybierz użytkownika i grafik.');
      return;
    }
    try {
      const [month, year] = selectedSchedule.split(' ');
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler/downloadUserMonthlyReport', {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: selectedUserId, month, year },
        responseType: 'blob',
      });

      // Logika pobierania pliku
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `Raport_${selectedUser.name}_${selectedUser.surname}_${month}_${year}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
      } else {
        alert('Wystąpił błąd podczas pobierania raportu.');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania raportu:', error);
      alert('Wystąpił błąd podczas pobierania raportu.');
    }
  };

  /**
   * Pobierz podsumowanie zespołu w formacie XLSX.
   */
  const handleDownloadSummary = async () => {
    if (!selectedSchedule) {
      alert('Wybierz grafik.');
      return;
    }
    try {
      const [month, year] = selectedSchedule.split(' ');
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler/downloadMonthlySummary', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
        responseType: 'blob',
      });

      // Logika pobierania pliku
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Podsumowanie_${month}_${year}.xlsx`);
        document.body.appendChild(link);
        link.click();
      } else {
        alert('Wystąpił błąd podczas pobierania podsumowania.');
      }
    } catch (error) {
      console.error('Błąd podczas pobierania podsumowania:', error);
      alert('Wystąpił błąd podczas pobierania podsumowania.');
    }
  };

  return (
    <div className={styles.content}>
      <h2>Raport Użytkownika</h2>
      {/* Formularz wyboru */}
      <div className={styles.form}>
        {/* Wybór użytkownika */}
        <div className={styles.input}>
          <label>Użytkownik:</label>
          <select value={selectedUserId} onChange={handleUserChange}>
            <option value="">-- Wybierz użytkownika --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} {user.surname}
              </option>
            ))}
          </select>
        </div>

        {/* Wybór grafiku */}
        <div className={styles.input}>
          <label>Miesiąc i rok:</label>
          <select value={selectedSchedule} onChange={handleScheduleChange}>
            {availableSchedulers.map((schedule, index) => (
              <option key={index} value={`${schedule.month} ${schedule.year}`}>
                {schedule.month} {schedule.year}
              </option>
            ))}
          </select>
        </div>

        {/* Przyciski pobierania */}
        <button className={styles.button} onClick={handleDownload}>
          Pobierz raport pracownika (XLSX)
        </button>
        <button className={styles.button} onClick={handleDownloadSummary}>
          Pobierz podsumowanie zespołu (XLSX)
        </button>
      </div>

      {/* Wyświetlanie podsumowania */}
      {isLoading ? (
        <p>Ładowanie danych...</p>
      ) : summaryData.length > 0 ? (
        <div className={styles.summary}>
          <h4>Podsumowanie miesiąca</h4>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Ilość godzin</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((data) => (
                <tr key={data.user._id}>
                  <td>{data.user.name}</td>
                  <td>{data.user.surname}</td>
                  <td>{data.totalHoursWorked}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">Łącznie:</td>
                <td>{totalTeamHours}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p>Brak danych do wyświetlenia.</p>
      )}

      {/* Wyświetlanie szczegółowego raportu */}
      {selectedUserId && reportData.length > 0 && (
        <div>
          <h4>Szczegółowy raport dla {selectedUser.name} {selectedUser.surname}</h4>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Dzień</th>
                <th>Dzień tygodnia</th>
                <th>Godzina rozpoczęcia</th>
                <th>Godzina zakończenia</th>
                <th>Przepracowane godziny</th>
                <th>Preferowane godziny</th>
                <th>Dostępność</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((data) => (
                <tr key={data.dayOfMonth}>
                  <td>{data.dayOfMonth}</td>
                  <td>{data.nameDayOfWeek}</td>
                  <td>{data.start_hour}</td>
                  <td>{data.end_hour}</td>
                  <td>{data.hoursWorked}</td>
                  <td>{data.prefferedHours}</td>
                  <td>{data.availability}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4">Łącznie przepracowanych godzin:</td>
                <td>{totalHours}</td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default Submissions;
