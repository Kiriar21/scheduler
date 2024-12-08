/**
 * Komponent wyświetlający dane użytkownika.
 * @component
 * @param {object} user - Obiekt użytkownika
 * @param {boolean} full - Czy wyświetlać pełne dane czy tylko podstawowe
 */
import React from 'react';
import styles from './UserDisplay.module.scss';

//Wyswietlanie danych usera
const UserDisplay = ({ user, full }) => {
  return (
    <div className={full ? styles.userFull : styles.userBrief}>
      <p>{user.name} {user.surname}</p>
      {full && (
        <>
          <p>Email: {user.email}</p>
          <p>Rola: {user.role}</p>
        </>
      )}
    </div>
  );
};

export default UserDisplay;
