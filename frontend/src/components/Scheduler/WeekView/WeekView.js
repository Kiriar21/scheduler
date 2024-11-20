// components/Scheduler/WeekView/WeekView.js

import React, { useState, useContext } from 'react';
import styles from './WeekView.module.scss';
import TimeEditModal from '../TimeEditModal/TimeEditModal';
import axiosInstance from '../../../api/axiosInstance';
import { SchedulerContext } from '../../../contexts/SchedulerContext/SchedulerContext';

const WeekView = ({ scheduler, userRole, userId }) => {
  const weeksInMonth = [
    ...new Set(scheduler.map_month.map((day) => day.numberOfWeek)),
  ];
  const [selectedWeek, setSelectedWeek] = useState(weeksInMonth[0]);
  const { changeScheduler } = useContext(SchedulerContext);
  const [modalData, setModalData] = useState({
    isOpen: false,
    dayInfo: null,
    employersHour: null,
  });

  const handleWeekChange = (e) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const daysInWeek = scheduler.map_month.filter(
    (day) => day.numberOfWeek === selectedWeek
  );

  if (daysInWeek.length === 0) {
    return <p>Tydzień nie znaleziony.</p>;
  }

  // Zbieranie unikalnych użytkowników
  const users = {};
  daysInWeek.forEach((day) => {
    day.employersHours.forEach((eh) => {
      if (eh.user) {
        users[eh.user._id] = eh.user;
      }
    });
  });

  const canEdit = (targetUserId) => {
    return userRole === 'manager' || userId === targetUserId;
  };

  const handleCellClick = (eh, day) => {
    if (canEdit(eh.user._id)) {
      setModalData({
        isOpen: true,
        dayInfo: day,
        employersHour: eh,
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
    <div className={styles.weekView}>
      <h3>Tydzień {selectedWeek}</h3>
      <label>Wybierz tydzień: </label>
      <select value={selectedWeek} onChange={handleWeekChange}>
        {weeksInMonth.map((week) => (
          <option key={week} value={week}>
            Tydzień {week}
          </option>
        ))}
      </select>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Pracownik</th>
            {daysInWeek.map((day) => (
              <th key={day._id}>
                {day.dayOfMonth} ({day.nameDayOfWeek})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(users).map((user) => (
            <tr key={user._id}>
              <td>{user.name} {user.surname}</td>
              {daysInWeek.map((day) => {
                const eh = day.employersHours.find(
                  (eh) => eh.user && eh.user._id === user._id
                );
                return (
                  <td
                    key={day._id}
                    onClick={() => eh && handleCellClick(eh, day)}
                    className={eh && canEdit(eh.user._id) ? styles.editableCell : ''}
                  >
                    {eh ? `${eh.start_hour} - ${eh.end_hour}` : 'Brak'}
                  </td>
                );
              })}
            </tr>
          ))}
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

export default WeekView;
