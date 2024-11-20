// components/WeekView/WeekView.js
import React, { useState } from 'react';
import styles from './WeekView.module.scss';

const WeekView = ({ scheduler }) => {
  const weeksInMonth = [
    ...new Set(scheduler.map_month.map((day) => day.numberOfWeek)),
  ];
  const [selectedWeek, setSelectedWeek] = useState(weeksInMonth[0]);

  const handleWeekChange = (e) => {
    setSelectedWeek(parseInt(e.target.value));
  };

  const daysInWeek = scheduler.map_month.filter(
    (day) => day.numberOfWeek === selectedWeek
  );

  if (daysInWeek.length === 0) {
    return <p>Tydzień nie znaleziony.</p>;
  }

  // Collect unique users
  const users = {};
  daysInWeek.forEach((day) => {
    day.employersHours.forEach((eh) => {
      users[eh.user._id] = eh.user;
    });
  });

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
                  (eh) => eh.user._id === user._id
                );
                return (
                  <td key={day._id}>
                    {eh ? `${eh.start_hour} - ${eh.end_hour}` : 'Brak'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeekView;
