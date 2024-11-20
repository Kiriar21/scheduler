// pages/UserReport/UserReportPage.js

import React, { useState, useEffect } from 'react';
import styles from './Submissions.module.scss';
import axiosInstance from '../../api/axiosInstance';

const Submissions = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableSchedulers, setAvailableSchedulers] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [totalTeamHours, setTotalTeamHours] = useState(0);

  // Fetch users in manager's team
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/team/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch available schedulers
  useEffect(() => {
    const fetchSchedulers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/schedulers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const schedulers = response.data.schedulers;
        setAvailableSchedulers(schedulers);
        if (schedulers.length > 0) {
          const currentDate = new Date();
          const currentMonthIndex = currentDate.getMonth(); // 0-11
          const currentYear = currentDate.getFullYear();

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

          const currentMonthName = months[currentMonthIndex];

          // Find scheduler for current month and year
          const currentScheduler = schedulers.find(
            (schedule) => schedule.month === currentMonthName && schedule.year === currentYear
          );

          if (currentScheduler) {
            setSelectedSchedule(`${currentScheduler.month} ${currentScheduler.year}`);
          } else {
            // If current month scheduler doesn't exist, select the latest
            const lastScheduler = schedulers[schedulers.length - 1];
            setSelectedSchedule(`${lastScheduler.month} ${lastScheduler.year}`);
          }
        }
      } catch (error) {
        console.error('Error fetching schedulers:', error);
      }
    };
    fetchSchedulers();
  }, []);

  // Fetch summary data when the page loads or schedule changes
  useEffect(() => {
    if (selectedSchedule) {
      fetchSummaryData();
    }
  }, [selectedSchedule]);

  // Fetch summary data
  const fetchSummaryData = async () => {
    setIsLoading(true);
    try {
      const [month, year] = selectedSchedule.split(' ');
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler/monthlySummary', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          month,
          year,
        },
      });
      setSummaryData(response.data.summaryData);
      // Calculate total team hours
      const totalHours = response.data.summaryData.reduce(
        (sum, userData) => sum + userData.totalHoursWorked,
        0
      );
      setTotalTeamHours(totalHours);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setSummaryData([]);
      setTotalTeamHours(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch report data when a user is selected
  useEffect(() => {
    if (selectedUserId && selectedSchedule) {
      fetchReportData();
    } else {
      setReportData([]);
      setTotalHours(0);
    }
  }, [selectedUserId, selectedSchedule]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [month, year] = selectedSchedule.split(' ');
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler/userMonthlyReport', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          userId: selectedUserId,
          month,
          year,
        },
      });
      setReportData(response.data.reportData);
      setTotalHours(response.data.totalHours);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData([]);
      setTotalHours(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    const user = users.find((u) => u._id === userId);
    setSelectedUser(user || null);
  };

  const handleScheduleChange = (e) => {
    setSelectedSchedule(e.target.value);
  };

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
        params: {
          userId: selectedUserId,
          month,
          year,
        },
        responseType: 'blob',
      });
      if (response.status === 200) {
        // Create download link
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
      console.error('Error downloading report:', error);
      alert('Wystąpił błąd podczas pobierania raportu.');
    }
  };

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
        params: {
          month,
          year,
        },
        responseType: 'blob',
      });
      if (response.status === 200) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `Podsumowanie_${month}_${year}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
      } else {
        alert('Wystąpił błąd podczas pobierania podsumowania.');
      }
    } catch (error) {
      console.error('Error downloading summary:', error);
      alert('Wystąpił błąd podczas pobierania podsumowania.');
    }
  };

  return (
    <div className={styles.content}>
      <h2>Raport Użytkownika</h2>
      <div className={styles.form}>
        {/* User Selection */}
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

        {/* Schedule Selection */}
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

        {/* Download Buttons */}
        <button className={styles.button} onClick={handleDownload}>
          Pobierz raport XLSX
        </button>
        <button className={styles.button} onClick={handleDownloadSummary}>
          Pobierz podsumowanie XLSX
        </button>
      </div>

      {/* Summary Data */}
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

      {/* Report Data */}
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
