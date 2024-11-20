// pages/Schedule/Schedule.js
import React, { useContext, useState, useEffect } from 'react';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';
import ViewSwitcher from '../../components/Scheduler/ViewSwitcher/ViewSwitcher';
import DayView from '../../components/Scheduler/DayView/DayView';
import WeekView from '../../components/Scheduler/WeekView/WeekView';
import MonthView from '../../components/Scheduler/MonthView/MonthView';
import styles from './Schedule.module.scss';
import axiosInstance from '../../api/axiosInstance';

const SchedulePage = () => {
  const { currentScheduler, changeScheduler } = useContext(SchedulerContext);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('month'); // Default to 'month'
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

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

  // Fetching available schedules
  const fetchAvailableSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/schedulers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedSchedules = (response.data.schedulers || []).sort((a, b) => {
        const dateA = new Date(a.year, monthIndex[a.month]);
        const dateB = new Date(b.year, monthIndex[b.month]);
        return dateB - dateA; // Sort from newest to oldest
      });

      setAvailableSchedules(sortedSchedules);

      // Automatically select current month's schedule if available
      const { currentMonth, currentYear } = getCurrentMonthYear();
      const currentSchedule = sortedSchedules.find(
        (schedule) =>
          schedule.month === currentMonth && schedule.year === currentYear
      );

      if (currentSchedule) {
        setSelectedSchedule(`${currentMonth} ${currentYear}`);
        changeScheduler(currentMonth, currentYear);
      } else if (sortedSchedules.length > 0) {
        // If no current month schedule, select the latest
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
    fetchAvailableSchedules();
    fetchUserData();
  }, []);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSchedule(selectedValue);
    const [month, year] = selectedValue.split(' ');
    changeScheduler(month, year);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  if (isLoading) {
    return <p>Ładowanie danych...</p>;
  }

  return (
    <div className={styles.content}>
      <h2>Wybierz grafik zespołu</h2>

      {/* Schedule selector */}
      <div className={styles.selector}>
        <select value={selectedSchedule} onChange={handleSelectChange}>
          {availableSchedules.map((schedule, index) => (
            <option key={index} value={`${schedule.month} ${schedule.year}`}>
              {schedule.month} {schedule.year}
            </option>
          ))}
        </select>
      </div>

      {/* View switcher */}
      <ViewSwitcher selectedView={selectedView} onViewChange={handleViewChange} />

      {/* Display the schedule according to selected view */}
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
            <MonthView scheduler={currentScheduler} />
          )}
        </div>
      ) : (
        <p>Brak grafiku dla wybranego miesiąca i roku.</p>
      )}
    </div>
  );
};

export default SchedulePage;
