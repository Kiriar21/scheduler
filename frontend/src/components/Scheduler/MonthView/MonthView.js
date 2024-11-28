import React, { useState, useContext, useMemo } from 'react';
import styles from './MonthView.module.scss';
import TimeEditModal from '../TimeEditModal/TimeEditModal';
import axiosInstance from '../../../api/axiosInstance';
import { SchedulerContext } from '../../../contexts/SchedulerContext/SchedulerContext';

const MonthView = ({ scheduler, userRole, userId }) => {
  const { changeScheduler } = useContext(SchedulerContext);
  const [modalData, setModalData] = useState({
    isOpen: false,
    dayInfo: null,
    employersHour: null,
  });

  // Stan dla wybranego pracownika
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Wyciąganie listy unikalnych pracowników
  const employees = [];
  scheduler.map_month.forEach((day) => {
    day.employersHours.forEach((eh) => {
      if (!employees.find((e) => e._id === eh.user._id)) {
        employees.push(eh.user);
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

  // Funkcja do generowania tygodni z odpowiednim rozmieszczeniem dni
  const generateCalendar = () => {
    const weeks = [];
    let currentWeek = [];

    if (!scheduler || !scheduler.map_month) {
      return weeks;
    }

    const daysInMonth = scheduler.map_month;
    let dayIndex = 0;

    while (dayIndex < daysInMonth.length) {
      const day = daysInMonth[dayIndex];

      // Dostosowanie numeracji dayOfWeek
      const dayOfWeek = ((day.dayOfWeek) % 7) + 1; // 1 (poniedziałek) - 7 (niedziela)

      // Jeśli to początek miesiąca, dodaj puste komórki
      if (currentWeek.length === 0) {
        for (let i = 1; i < dayOfWeek; i++) {
          currentWeek.push(null);
        }
      }

      currentWeek.push(day);
      dayIndex++;

      // Jeśli tydzień jest pełny lub to ostatni dzień miesiąca
      if (currentWeek.length === 7 || dayIndex === daysInMonth.length) {
        // Jeśli tydzień nie jest pełny, uzupełnij puste komórki
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  };

  // Użycie useMemo, aby ponownie wygenerować tygodnie przy zmianie scheduler
  const weeks = useMemo(() => generateCalendar(), [scheduler]);

  // Funkcja do pobierania inicjałów pracownika
  const getInitials = (name, surname) => {
    const firstNameInitial = name.charAt(0).toUpperCase();
    const lastNameInitial = surname.charAt(0).toUpperCase();
    return `${firstNameInitial}${lastNameInitial}`;
  };

  return (
    <div className={styles.monthView}>
      {/* Lista rozwijana z pracownikami */}
      <select
        value={selectedEmployeeId}
        onChange={(e) => setSelectedEmployeeId(e.target.value)}
      >
        <option value="">Wybierz pracownika</option>
        {employees.map((employee) => (
          <option key={employee._id} value={employee._id}>
            {employee.name} {employee.surname}
          </option>
        ))}
      </select>

      {/* Tabela kalendarza */}
      <table className={styles.calendarTable}>
        <thead>
          <tr>
            <th>Pon</th>
            <th>Wt</th>
            <th>Śr</th>
            <th>Czw</th>
            <th>Pt</th>
            <th>Sob</th>
            <th>Nd</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIdx) => (
            <tr key={weekIdx}>
              {week.map((day, dayIdx) => (
                <td key={dayIdx} className={styles.calendarCell}>
                  {day ? (
                    <div className={styles.cellContent}>
                      <div className={styles.dayNumber}>{day.dayOfMonth}</div>
                      {/* Filtruj godziny pracy dla wybranego pracownika */}
                      {day.employersHours
                        .filter((eh) =>
                          selectedEmployeeId
                            ? eh.user._id === selectedEmployeeId
                            : true
                        )
                        .map((eh) => (
                          <div
                            key={eh.user._id}
                            className={styles.hourRange}
                            onClick={() => handleCellClick(eh, day)}
                          >
                            {/* Dodaj inicjały jeśli żaden pracownik nie jest wybrany */}
                            {!selectedEmployeeId && (
                              <span className={styles.initials}>
                                {getInitials(eh.user.name, eh.user.surname)}:
                              </span>
                            )}
                            {eh.start_hour} - {eh.end_hour}
                          </div>
                        ))}
                    </div>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal do edycji godzin */}
      {modalData.isOpen && (
        <TimeEditModal
          isOpen={modalData.isOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          initialData={modalData.employersHour}
        />
      )}
    </div>
  );
};

export default MonthView;
