// components/MonthView/MonthView.js
import React from 'react';
import styles from './MonthView.module.scss';

const MonthView = ({ scheduler }) => {
  const weeksInMonth = [
    ...new Set(scheduler.map_month.map((day) => day.numberOfWeek)),
  ];

  return (
    <div className={styles.monthView}>
      <h3>
        Grafik dla {scheduler.month} {scheduler.year}
      </h3>
      {weeksInMonth.map((week) => {
        const daysInWeek = scheduler.map_month.filter(
          (day) => day.numberOfWeek === week
        );
        // Collect unique users
        const users = {};
        daysInWeek.forEach((day) => {
          day.employersHours.forEach((eh) => {
            users[eh.user._id] = eh.user;
          });
        });

        return (
          <div key={week} className={styles.weekSection}>
            <h4>Tydzień {week}</h4>
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
      })}
    </div>
  );
};

export default MonthView;
