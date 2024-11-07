// src/pages/HomePage/HomePage.js
import React from 'react';
import styles from './Home.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona główna</h2>
      </div>
    </div>
  );
};

export default HomePage;
