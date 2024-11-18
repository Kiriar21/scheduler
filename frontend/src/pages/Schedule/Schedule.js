import React, { useContext, useState, useEffect } from 'react';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';
import styles from './Schedule.module.scss';
import axiosInstance from '../../api/axiosInstance';

const SchedulePage = () => {
  const { currentScheduler, changeScheduler } = useContext(SchedulerContext);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const monthIndex = {
    styczeń: 0,
    luty: 1,
    marzec: 2,
    kwiecień: 3,
    maj: 4,
    czerwiec: 5,
    lipiec: 6,
    sierpień: 7,
    wrzesień: 8,
    październik: 9,
    listopad: 10,
    grudzień: 11,
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    const currentMonth = Object.keys(monthIndex).find(
      (key) => monthIndex[key] === now.getMonth()
    );
    const currentYear = now.getFullYear();
    return { currentMonth, currentYear };
  };

  // Pobieranie dostępnych grafików
  const fetchAvailableSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/schedulers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedSchedules = (response.data.schedulers || []).sort((a, b) => {
        const dateA = new Date(a.year, monthIndex[a.month]);
        const dateB = new Date(b.year, monthIndex[b.month]);
        return dateB - dateA; // Sortowanie od najnowszego do najstarszego
      });

      setAvailableSchedules(sortedSchedules);

      // Automatycznie wybierz grafik dla aktualnego miesiąca, jeśli istnieje
      const { currentMonth, currentYear } = getCurrentMonthYear();
      const currentSchedule = sortedSchedules.find(
        (schedule) =>
          schedule.month === currentMonth && schedule.year === currentYear
      );

      if (currentSchedule) {
        setSelectedSchedule(`${currentMonth} ${currentYear}`);
        changeScheduler(currentMonth, currentYear);
      } else if (sortedSchedules.length > 0) {
        // Jeśli brak grafiku dla aktualnego miesiąca, wybierz najnowszy
        const { month, year } = sortedSchedules[0];
        setSelectedSchedule(`${month} ${year}`);
        changeScheduler(month, year);
      }
    } catch (error) {
      console.error('Error fetching available schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSchedules();
  }, []);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSchedule(selectedValue);
    const [month, year] = selectedValue.split(' ');
    changeScheduler(month, year);
  };

  if (isLoading) {
    return <p>Ładowanie danych...</p>;
  }

  return (
    <div className={styles.content}>
      <h2>Wybierz grafik zespołu</h2>

      {/* Formularz wyboru dostępnego grafiku */}
      <div className={styles.selector}>
        <select
          value={selectedSchedule}
          onChange={handleSelectChange}
        >
          {availableSchedules.map((schedule, index) => (
            <option key={index} value={`${schedule.month} ${schedule.year}`}>
              {schedule.month} {schedule.year}
            </option>
          ))}
        </select>
      </div>

      {/* Wyświetlanie wybranego grafiku */}
      {currentScheduler ? (
        <div className={styles.scheduler}>
          <h3>Grafik dla {currentScheduler.month} {currentScheduler.year}</h3>
          <ul>
            {currentScheduler.map_month.map((day, index) => (
              <li key={index}>
                {day.dayOfMonth} ({day.nameDayOfWeek}): {day.employersHours.length} zmian
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Brak grafiku dla wybranego miesiąca i roku.</p>
      )}
    </div>
  );
};

export default SchedulePage;
