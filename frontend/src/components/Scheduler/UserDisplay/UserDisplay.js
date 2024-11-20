// components/UserDisplay/UserDisplay.js
import React from 'react';
import styles from './UserDisplay.module.scss';

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
