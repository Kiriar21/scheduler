import React, { useContext, useState, useEffect } from 'react';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';
import ViewSwitcher from '../../components/Scheduler/ViewSwitcher/ViewSwitcher';
import DayView from '../../components/Scheduler/DayView/DayView';
import WeekView from '../../components/Scheduler/WeekView/WeekView';
import MonthView from '../../components/Scheduler/MonthView/MonthView';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import styles from './Schedule.module.scss';
import axiosInstance from '../../api/axiosInstance';

const SchedulePage = () => {
  const { currentScheduler, changeScheduler, availableSchedulers, loading, fetchAvailableSchedulers } = useContext(SchedulerContext);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('day'); // Domyślnie 'month'
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  const monthIndex = {
    Styczeń: 0,
    Luty: 1,
    Marzec: 2,
    Kwiecień: 3,
    Maj: 4,
    Czerwiec: 5,
    Lipiec: 6,
    Sierpień: 7,
    Wrzesień: 8,
    Październik: 9,
    Listopad: 10,
    Grudzień: 11,
  };

  //Pobieranie aktualnego miesiaca i roku
  const getCurrentMonthYear = () => {
    const now = new Date();
    const currentMonth = Object.keys(monthIndex).find(
      (key) => monthIndex[key] === now.getMonth()
    );
    const currentYear = now.getFullYear();
    return { currentMonth, currentYear };
  };

  // Pobieranie danych użytkownika
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(response.data.user.role);
      setUserId(response.data.user._id);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAvailableSchedulers();
  }, []);

  // Inicjalizacja grafiku
  useEffect(() => {
    if (availableSchedulers.length > 0 && !selectedSchedule) {
      const { currentMonth, currentYear } = getCurrentMonthYear();
      const currentSchedule = availableSchedulers.find(
        (schedule) =>
          schedule.month === currentMonth && schedule.year === currentYear
      );

      if (currentSchedule) {
        setSelectedSchedule(`${currentMonth} ${currentYear}`);
        changeScheduler(currentMonth, currentYear);
      } else {
        const latestSchedule = availableSchedulers[0];
        setSelectedSchedule(`${latestSchedule.month} ${latestSchedule.year}`);
        changeScheduler(latestSchedule.month, latestSchedule.year);
      }
      setIsLoading(false);
    } else if (availableSchedulers.length === 0) {
      setIsLoading(false);
    }
  }, [availableSchedulers, selectedSchedule, changeScheduler]);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSchedule(selectedValue);
    const [month, year] = selectedValue.split(' ');
    changeScheduler(month, year);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  if (loading) {
    return <p>Ładowanie danych...</p>;
  }

  if (availableSchedulers.length === 0) {
    return (
      <div className={styles.content}>
        <h2>Brak dostępnych grafików</h2>
        <p>Nie ma dostępnych grafików do wyświetlenia.</p>
      </div>
    );
  }

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className={styles.content}>
    <div className={styles.tools}>
      <h3>Grafik:</h3>
      {/* Wybór grafiku */}
      <div className={styles.selector}>

      <CalendarMonth />
        <select value={selectedSchedule} onChange={handleSelectChange}>
          {availableSchedulers.map((schedule, index) => (
            <option key={index} value={`${schedule.month} ${schedule.year}`}>
              {capitalizeFirstLetter(schedule.month)} {schedule.year}
            </option>
          ))}
        </select>
      </div>

      {/* Przełącznik widoku */}
      <ViewSwitcher selectedView={selectedView} onViewChange={handleViewChange} />
      </div>
      {/* Wyświetlanie grafiku zgodnie z wybranym widokiem */}
      {currentScheduler ? (
        <div className={styles.scheduler}>
          {selectedView === 'day' && (
            <DayView
              scheduler={currentScheduler}
              userRole={userRole}
              userId={userId}
            />
          )}
          {selectedView === 'week' && (
            <WeekView
              scheduler={currentScheduler}
              userRole={userRole}
              userId={userId}
            />
          )}
          {selectedView === 'month' && (
            <MonthView
              scheduler={currentScheduler}
              userRole={userRole}
              userId={userId}
            />
          )}
        </div>
      ) : (
        <p>Brak grafiku dla wybranego miesiąca i roku.</p>
      )}
    </div>
  );
};

export default SchedulePage;
