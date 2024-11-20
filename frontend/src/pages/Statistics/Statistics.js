// pages/Statistics/Statistics.js

import React, { useContext, useState, useEffect } from 'react';
import styles from './Statistics.module.scss';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';
import axiosInstance from '../../api/axiosInstance';

const StatisticsPage = () => {
  const { availableSchedulers, selectedDate, changeScheduler } = useContext(SchedulerContext);
  const [selectedSchedule, setSelectedSchedule] = useState(`${selectedDate.month} ${selectedDate.year}`);
  const [statistics, setStatistics] = useState([]);
  const [totalTeamHours, setTotalTeamHours] = useState(0);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = async (month, year) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await axiosInstance.get('/scheduler/statistics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
      });

      setCurrentUserId(response.data.currentUserId);
      setStatistics(response.data.statistics);
      setTotalTeamHours(response.data.totalTeamHours);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const [month, year] = selectedSchedule.split(' ');
    fetchStatistics(month, year);
  }, [selectedSchedule]);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSchedule(selectedValue);
    const [month, year] = selectedValue.split(' ');
    changeScheduler(month, parseInt(year, 10));
  };

  return (
    <div className={styles.content}>
      <h2>Statystyki Miesięczne</h2>
      {/* Wybór grafiku */}
      <div className={styles.selector}>
        <select value={selectedSchedule} onChange={handleSelectChange}>
          {availableSchedulers.map((schedule, index) => (
            <option key={index} value={`${schedule.month} ${schedule.year}`}>
              {schedule.month} {schedule.year}
            </option>
          ))}
        </select>
      </div>

      {/* Wyświetlanie statystyk */}
      {isLoading ? (
        <p>Ładowanie statystyk...</p>
      ) : statistics.length > 0 ? (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Łączna liczba godzin</th>
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
                  <td>{stat.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.total}>Łączna liczba godzin zespołu: {totalTeamHours}</p>
        </>
      ) : (
        <p>Brak statystyk do wyświetlenia.</p>
      )}
    </div>
  );
};

export default StatisticsPage;
