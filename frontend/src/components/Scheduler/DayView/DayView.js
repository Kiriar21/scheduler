// components/Scheduler/DayView/DayView.js

import React, { useState, useContext } from 'react';
import styles from './DayView.module.scss';
import axiosInstance from '../../../api/axiosInstance';
import { SchedulerContext } from '../../../contexts/SchedulerContext/SchedulerContext';
import TimeEditModal from '../TimeEditModal/TimeEditModal';

const DayView = ({ scheduler, userRole, userId }) => {
  const [selectedDay, setSelectedDay] = useState(
    scheduler.map_month[0]?.dayOfMonth || null
  );
  const [modalData, setModalData] = useState({
    isOpen: false,
    dayInfo: null,
    employersHour: null,
  });
  const { changeScheduler } = useContext(SchedulerContext);

  const dayInfo = scheduler.map_month.find(
    (day) => day.dayOfMonth === selectedDay
  );

  const handleDayChange = (e) => {
    setSelectedDay(parseInt(e.target.value));
  };

  const canEdit = (targetUserId) => {
    return userRole === 'manager' || userId === targetUserId;
  };

  const handleCellClick = (employersHour) => {
    if (canEdit(employersHour.user._id)) {
      setModalData({
        isOpen: true,
        dayInfo,
        employersHour,
      });
    }
  };

  const handleModalClose = () => {
    setModalData({
      isOpen: false,
      dayInfo: null,
      employersHour: null,
    });
  };

  const handleModalSave = async (updatedData) => {
    const { employersHour, dayInfo } = modalData;
    try {
      const token = localStorage.getItem('token');
      const { month, year } = scheduler;
      const updates = {
        start_hour: updatedData.start_hour,
        end_hour: updatedData.end_hour,
      };

      await axiosInstance.put(
        '/scheduler/editDay',
        {
          month,
          year,
          dayOfMonth: dayInfo.dayOfMonth,
          targetUserId: employersHour.user._id,
          updates,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Odświeżenie danych w kontekście
      changeScheduler(month, year);
      alert('Zmiany zostały zapisane.');
    } catch (error) {
      console.error('Error updating day:', error);
      alert('Wystąpił błąd podczas zapisywania zmian.');
    } finally {
      handleModalClose();
    }
  };

  // Aktualizacja zakresu godzin
  const startTime = 0;  // Początek doby
  const endTime = 24;   // Koniec doby
  const totalHours = endTime - startTime;

  return (
    <div className={styles.dayView}>
      <h3>
        Dzień {dayInfo.dayOfMonth} ({dayInfo.nameDayOfWeek})
      </h3>
      <label>Wybierz dzień: </label>
      <select value={selectedDay} onChange={handleDayChange}>
        {scheduler.map_month.map((day) => (
          <option key={day._id} value={day.dayOfMonth}>
            {day.dayOfMonth} ({day.nameDayOfWeek})
          </option>
        ))}
      </select>

      <div className={styles.scheduleContainer}>
        {/* Wyświetlanie godzin na górze siatki */}
        <div className={styles.timeLabels}>
          <div className={styles.workerName}></div>
          <div className={styles.timeGrid}>
            {[...Array(totalHours + 1)].map((_, index) => (
              <div
                key={index}
                className={styles.timeLabel}
                style={{ left: `${(index / totalHours) * 100}%` }}
              >
                {String(startTime + index).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>
        {dayInfo.employersHours.map((eh) => {
          if (!eh.user) return null;
          const isEditable = canEdit(eh.user._id);
          const startHour = parseFloat(eh.start_hour);
          const endHour = parseFloat(eh.end_hour);

          // Obliczanie pozycji i szerokości prostokąta
          let barStart = ((startHour - startTime) / totalHours) * 100;
          let barWidth = ((endHour - startHour) / totalHours) * 100;

          // Upewnienie się, że prostokąt mieści się w siatce
          if (barStart < 0) {
            barWidth += barStart; // Zmniejszenie szerokości, jeśli zaczyna przed siatką
            barStart = 0;
          }
          if (barStart + barWidth > 100) {
            barWidth = 100 - barStart; // Zmniejszenie szerokości, jeśli kończy po siatce
          }

          return (
            <div key={eh._id} className={styles.scheduleRow}>
              <div className={styles.workerName}>
                {eh.user.name}<br></br> {eh.user.surname}
              </div>
              <div className={styles.timeGrid}>
                {/* Linie siatki */}
                <div className={styles.gridLines}>
                  {[...Array(totalHours + 1)].map((_, index) => (
                    <div
                      key={index}
                      className={styles.gridLine}
                      style={{ left: `${(index / totalHours) * 100}%` }}
                    ></div>
                  ))}
                </div>
                <div className={styles.timeBarContainer}>
                  <div
                    className={`${styles.timeBar} ${
                      isEditable ? styles.editableBar : ''
                    }`}
                    style={{
                      left: `${barStart}%`,
                      width: `${barWidth}%`,
                    }}
                    onClick={() => isEditable && handleCellClick(eh)}
                  >
                    {eh.start_hour} - {eh.end_hour}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TimeEditModal */}
      <TimeEditModal
        isOpen={modalData.isOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initialData={modalData.employersHour || {}}
        dayInfo={modalData.dayInfo}
      />
    </div>
  );
};

export default DayView;
