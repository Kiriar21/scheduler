// src/pages/HomePage/HomePage.js
import React from 'react';
import styles from './Account.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const AccountPage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona z ustawieniami konta</h2>
      </div>
    </div>
  );
};

export default AccountPage;
