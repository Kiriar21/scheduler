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

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Imię</th>
            <th>Nazwisko</th>
            <th>Godzina rozpoczęcia</th>
            <th>Godzina zakończenia</th>
          </tr>
        </thead>
        <tbody>
          {dayInfo.employersHours.map((eh) => {
            if (!eh.user) return null; // Pomijamy brakującego użytkownika
            const isEditable = canEdit(eh.user._id);
            return (
              <tr key={eh._id}>
                <td>{eh.user.name}</td>
                <td>{eh.user.surname}</td>
                <td
                  onClick={() => isEditable && handleCellClick(eh)}
                  className={isEditable ? styles.editableCell : ''}
                >
                  {eh.start_hour}
                </td>
                <td
                  onClick={() => isEditable && handleCellClick(eh)}
                  className={isEditable ? styles.editableCell : ''}
                >
                  {eh.end_hour}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
