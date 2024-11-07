// src/pages/HomePage/HomePage.js
import React from 'react';
import styles from './Schedule.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const SchedulePage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona z grafikiem</h2>
      </div>
    </div>
  );
};

export default SchedulePage;
