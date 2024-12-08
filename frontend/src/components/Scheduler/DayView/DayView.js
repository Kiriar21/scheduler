/**
 * Komponent widoku dziennego grafiku.
 * Pozwala edytować godziny pracy pracowników dla wybranego dnia.
 * @component
 * @param {object} scheduler - Obiekt z danymi grafiku
 * @param {string} userRole - Rola aktualnie zalogowanego użytkownika
 * @param {string} userId - ID aktualnie zalogowanego użytkownika
 */
import React, { useState, useContext } from 'react';
import styles from './DayView.module.scss';
import axiosInstance from '../../../api/axiosInstance';
import { SchedulerContext } from '../../../contexts/SchedulerContext/SchedulerContext';
import TimeEditModal from '../TimeEditModal/TimeEditModal';

//Obsługa widoku dnia - komponent
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


  /**
   * Obsługa zmiany wybranego dnia w grafiku.
   * @function handleDayChange
   * @param {object} e - Obiekt zdarzenia
   */
    const handleDayChange = (e) => {
      setSelectedDay(parseInt(e.target.value));
    };

  /**
   * Sprawdza czy użytkownik może edytować dane godziny.
   * @function canEdit
   * @param {string} targetUserId - ID użytkownika, którego godziny sprawdzamy
   * @returns {boolean}
   */
  const canEdit = (targetUserId) => {
    return userRole === 'manager' || userId === targetUserId;
  };

/**
 * Otwiera modal do edycji godzin wybranego pracownika w danym dniu.
 * @function handleCellClick
 * @param {object} employersHour - Dane godzin pracownika
 */

  const handleCellClick = (employersHour) => {
    if (canEdit(employersHour.user._id)) {
      setModalData({
        isOpen: true,
        dayInfo,
        employersHour,
        
      });
    }
  };
/**
 * Zamyka modal edycji godzin.
 * @function handleModalClose
 */

  const handleModalClose = () => {
    setModalData({
      isOpen: false,
      dayInfo: null,
      employersHour: null,
    });
  };
/**
 * Obsługuje zapis zmian godzin pracy.
 * @async
 * @function handleModalSave
 * @param {object} updatedData - Zaktualizowane godziny
 * @returns {Promise<void>}
 */

  //Obsługa zapisu godzin pracy w grafiku
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

      changeScheduler(month, year);
      alert('Zmiany zostały zapisane.');
    } catch (error) {
      console.error('Error updating day:', error);
      alert('Wystąpił błąd podczas zapisywania zmian.');
    } finally {
      handleModalClose();
    }
  };

  const startTime = 0;
  const endTime = 24;
  const totalHours = endTime - startTime;
  
  // Dynamiczna szerokość kontenera (np. 90% szerokości okna)
  const containerWidth = Math.floor(window.innerWidth * 1);
  
  // Szerokość jednej godziny
  const hourWidth = containerWidth / totalHours;
  
  // Oblicz szerokość całej siatki
  const timeGridWidth = hourWidth * totalHours;

  return (
    <div className={styles.dayView}>
      <div  className={styles.dayViewTop}>
      <h3>
        Dzień: 
      </h3>
      <select value={selectedDay} onChange={handleDayChange}>
        {scheduler.map_month.map((day) => (
          <option key={day._id} value={day.dayOfMonth}>
            {day.dayOfMonth} ({day.nameDayOfWeek})
          </option>
        ))}
      </select>

      </div>
      <div className={styles.scheduleContainer}>
        {/* Kolumna z nazwami pracowników */}
        <div className={styles.namesColumn}>
          <div className={styles.workerName}></div>
          {dayInfo.employersHours.map((eh) => {
            if (!eh.user) return null;
            return (
              <div key={eh._id} className={styles.workerName}>
                {eh.user.name}
                <br /> {eh.user.surname}
              </div>
            );
          })}
        </div>

        {/* Kolumna z harmonogramem */}
        <div className={styles.scheduleColumn}>
          {/* Siatka godzin na górze */}
          <div
            className={styles.scheduleHeader}
            style={{ minWidth: `${timeGridWidth}px` }}
          >
            {[...Array(totalHours + 1)].map((_, index) => (
              <div
                key={index}
                className={styles.timeLabel}
                style={{ left: `${index * hourWidth}px` }}
              >
                {String(startTime + index).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Wiersze z zakresami godzin pracowników */}
          <div className={styles.scheduleBody}>
            {dayInfo.employersHours.map((eh) => {
              if (!eh.user) return null;
              const isEditable = canEdit(eh.user._id);
              const isCurrentUser = eh.user._id === userId;
              const startHour = parseFloat(eh.start_hour);
              const endHour = parseFloat(eh.end_hour);

              const barStart = (startHour - startTime) * hourWidth;
              const barWidth = (endHour - startHour) * hourWidth;

              return (
                <div
                  key={eh._id}
                  className={styles.timeGridRow}
                  onClick={() => isEditable && handleCellClick(eh)}
                >
                  {/* Tło wiersza */}
                  <div
                    className={styles.timeBarBackground}
                    style={{ minWidth: `${timeGridWidth}px` }}
                  >
                    {/* Linie siatki */}
                    <div className={styles.gridLines}>
                      {[...Array(totalHours + 1)].map((_, index) => (
                        <div
                          key={index}
                          className={styles.gridLine}
                          style={{ left: `${index * hourWidth}px` }}
                        ></div>
                      ))}
                    </div>

                    {/* Prostokąt z wybranymi godzinami */}
                    {!(startHour === 0 && endHour === 0) && (
                      <div
                        className={`${styles.timeBar} ${
                          isCurrentUser ? styles.editableBar : ''
                        }`}
                        style={{
                          left: `${barStart}px`,
                          width: `${barWidth}px`,
                        }}
                      >
                        {eh.start_hour} - {eh.end_hour}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
