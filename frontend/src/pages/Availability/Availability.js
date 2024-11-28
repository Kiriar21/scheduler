// pages/Availability/Availability.js

import React, { useContext, useState, useEffect } from 'react';
import { SchedulerContext } from '../../contexts/SchedulerContext/SchedulerContext';
import axiosInstance from '../../api/axiosInstance';
import styles from './Availability.module.scss';
import AutoFillAvailability from '../../components/Availibility/AutoAvailibility/AutoAvailibility';

const AvailabilityPage = () => {
  const { currentScheduler, changeScheduler, availableSchedulers, selectedDate } = useContext(SchedulerContext);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userDays, setUserDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSubmitStatus, setUserSubmitStatus] = useState(false);
  const [managerSubmitStatus, setManagerSubmitStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pobierz dane użytkownika
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data.user._id);
        setUserRole(response.data.user.role);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const canEdit = () => {
    if (userRole === 'user') return true;
    if (userRole === 'manager' && selectedUserId === userId) return true;
    return false;
  };

  // Ustawienie domyślnego grafiku
  useEffect(() => {
    if (availableSchedulers.length > 0 && !selectedSchedule) {
      const defaultScheduler = availableSchedulers.find(
        (schedule) => schedule.month === selectedDate.month && schedule.year === selectedDate.year
      ) || availableSchedulers[0];

      setSelectedSchedule(`${defaultScheduler.month} ${defaultScheduler.year}`);
      changeScheduler(defaultScheduler.month, defaultScheduler.year);
    }
  }, [availableSchedulers, selectedSchedule, selectedDate, changeScheduler]);

  // Ustawienie `selectedUserId` na `userId` dla menedżera
  const [selectedUserId, setSelectedUserId] = useState(null);
  useEffect(() => {
    if (userId && selectedUserId === null) {
      setSelectedUserId(userId);
    }
  }, [userId, selectedUserId]);

  // Pobierz użytkowników zespołu dla menedżera
  const [teamUsers, setTeamUsers] = useState([]);
  useEffect(() => {
    const fetchTeamUsers = async () => {
      if (userRole === 'manager') {
        try {
          const token = localStorage.getItem('token');
          const response = await axiosInstance.get('/team/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setTeamUsers(response.data.users);
        } catch (error) {
          console.error('Error fetching team users:', error);
        }
      }
    };
    fetchTeamUsers();
  }, [userRole]);

  // Pobierz dane dostępności po zmianie `currentScheduler` lub `selectedUserId`
  useEffect(() => {
    if (currentScheduler && selectedUserId) {
      const userDaysData = currentScheduler.map_month.map((dayInfo) => {
        const userDay = dayInfo.employersHours.find(
          (eh) => eh.user && eh.user._id === selectedUserId
        );
        return {
          dayOfMonth: dayInfo.dayOfMonth,
          nameDayOfWeek: dayInfo.nameDayOfWeek,
          prefferedHours: userDay ? userDay.prefferedHours : '',
          availability: userDay ? userDay.availability : '',
          userSubmit: userDay ? userDay.userSubmit : false,
          managerSubmit: userDay ? userDay.managerSubmit : false,
          _id: userDay ? userDay._id : null,
        };
      });
      setUserDays(userDaysData);

      // Sprawdź status zatwierdzenia
      const allUserSubmit = userDaysData.every((day) => day.userSubmit);
      const allManagerSubmit = userDaysData.every((day) => day.managerSubmit);
      setUserSubmitStatus(allUserSubmit);
      setManagerSubmitStatus(allManagerSubmit);

      setIsLoading(false);
    }
  }, [currentScheduler, selectedUserId]);

  // Funkcje obsługi zmian
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedSchedule(selectedValue);
    const [month, year] = selectedValue.split(' ');
    changeScheduler(month, year);
  };

  const handleInputChange = (index, field, value) => {
    const updatedUserDays = [...userDays];
    updatedUserDays[index][field] = value;

    // Jeśli użytkownik dokonuje zmiany, resetujemy `managerSubmit`
    if (userRole === 'user' || selectedUserId === userId) {
      updatedUserDays[index].managerSubmit = false;
      setManagerSubmitStatus(false);
    }
    updatedUserDays[index].userSubmit = false;
    setUserSubmitStatus(false);

    setUserDays(updatedUserDays);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const { month, year } = currentScheduler;
      const updates = userDays.map((day) => ({
        dayOfMonth: day.dayOfMonth,
        prefferedHours: day.prefferedHours,
        availability: day.availability,
      }));

      await axiosInstance.put(
        '/scheduler/updateAvailability',
        {
          month,
          year,
          updates,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Odświeżenie danych w kontekście
      changeScheduler(month, year);

      // Ustaw `userSubmit` na `true` dla wszystkich dni
      setUserDays((prevDays) =>
        prevDays.map((day) => ({
          ...day,
          userSubmit: true,
          managerSubmit: userRole === 'manager' ? true : day.managerSubmit,
        }))
      );
      setUserSubmitStatus(true);
      if (userRole === 'manager') {
        setManagerSubmitStatus(true);
      }

      alert('Dostępność została zapisana.');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Wystąpił błąd podczas zapisywania dostępności.');
    } finally {
      setIsSaving(false);
    }
  };

  // Funkcja do potwierdzania dostępności przez menedżera
  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const { month, year } = currentScheduler;

      await axiosInstance.post(
        '/scheduler/confirmAvailability',
        {
          month,
          year,
          targetUserId: selectedUserId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Odświeżenie danych w kontekście
      changeScheduler(month, year);

      // Ustaw `managerSubmit` na `true` dla wszystkich dni
      setUserDays((prevDays) =>
        prevDays.map((day) => ({ ...day, managerSubmit: true }))
      );
      setManagerSubmitStatus(true);

      alert('Dostępność użytkownika została zatwierdzona.');
    } catch (error) {
      console.error('Error confirming availability:', error);
      alert('Wystąpił błąd podczas zatwierdzania dostępności.');
    } finally {
      setIsSaving(false);
    }
  };

  // Funkcja auto-uzupełniania
  const handleAutoFill = (selectedDays, prefferedHours, availability) => {
    const updatedUserDays = userDays.map((day) => {
      const dayNameLower = day.nameDayOfWeek.toLowerCase();
      if (
        selectedDays.includes(dayNameLower) ||
        selectedDays.includes('all') ||
        (selectedDays.includes('weekend') &&
          (dayNameLower === 'sobota' || dayNameLower === 'niedziela')) ||
        (selectedDays.includes('weekday') &&
          ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek'].includes(dayNameLower))
      ) {
        return {
          ...day,
          prefferedHours: prefferedHours !== '' ? prefferedHours : day.prefferedHours,
          availability: availability !== '' ? availability : day.availability,
          userSubmit: false,
          managerSubmit: false,
        };
      }
      return day;
    });
    setUserDays(updatedUserDays);
    setUserSubmitStatus(false);
    setManagerSubmitStatus(false);
  };

  // Wyświetl komunikat, gdy brak grafików
  if (!availableSchedulers.length) {
    return (
      <div className={styles.noSchedulers}>
        <p>Nie ma dostępnych grafików do wyświetlenia.</p>
      </div>
    );
  }


  if (isLoading || !currentScheduler) {
    return <p>Ładowanie danych...</p>;
  }


  return (
    <div className={styles.content}>
      <div className={styles.left}>
      <h2>Dyspozycyjność</h2>

      {/* Wybór grafiku */}
      <div className={styles.selects}>
      <div className={styles.selector}>
      <label>Grafik: </label>
        <select value={selectedSchedule} onChange={handleSelectChange}>
          {availableSchedulers.map((schedule, index) => (
            <option key={index} value={`${schedule.month} ${schedule.year}`}>
              {schedule.month} {schedule.year}
            </option>
          ))}
        </select>
        </div>
      </div>
      <div className={styles.selectsRow}>
      {/* Wybór użytkownika dla menedżera */}
      {userRole === 'manager' && (
        <div className={styles.selector}>
          <label>Wybierz użytkownika:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {teamUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} {user.surname}
              </option>
            ))}
          </select>
          </div>
      )}
</div>

      {/* Komponent auto-uzupełniania */}
      {canEdit() && (
        <AutoFillAvailability onAutoFill={handleAutoFill} />
      )}

      {/* Informacje o statusie zatwierdzenia */}
      <div className={styles.submitStatus}>
  <p>
    Status pracownika:{' '}
    <span
      className={
        userSubmitStatus ? styles.approved : styles.notApproved
      }
    >
      {userSubmitStatus ? 'Zatwierdzony' : 'Niezatwierdzony'}
    </span>
  </p>
  <p>
    Status menedżera:{' '}
    <span
      className={
        managerSubmitStatus ? styles.approved : styles.notApproved
      }
    >
      {managerSubmitStatus ? 'Zatwierdzony' : 'Niezatwierdzony'}
    </span>
  </p>
</div>

              {/* Przycisk zapisz */}
              {canEdit() && (
        <button className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Zapisywanie...' : 'Zatwierdź dostępność'}
        </button>
      )}

      {/* Przycisk zatwierdź dla menedżera */}
      {userRole === 'manager' && selectedUserId !== userId && (
        <button className={styles.confirmButton} onClick={handleConfirm} disabled={isSaving}>
          {isSaving ? 'Zapisywanie...' : 'Zatwierdź dostępność'}
        </button>
      )}
</div>
      {/* Formularz dostępności */}
      <div className={styles.availabilityForm}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dzień</th>
              <th>Preferowane godziny</th>
              <th>Dostępność</th>
            </tr>
          </thead>
          <tbody>
            {userDays.map((day, index) => (
              <tr key={index}>
                <td>
                  {day.dayOfMonth} ({day.nameDayOfWeek})
                </td>
                <td>
                  <input
                    type="text"
                    value={day.prefferedHours}
                    onChange={(e) =>
                      handleInputChange(index, 'prefferedHours', e.target.value)
                    }
                    disabled={!canEdit()}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={day.availability}
                    onChange={(e) =>
                      handleInputChange(index, 'availability', e.target.value)
                    }
                    disabled={!canEdit()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AvailabilityPage;
