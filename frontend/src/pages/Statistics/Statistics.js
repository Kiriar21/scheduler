import React from 'react';
import styles from './Statistics.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const StatisticsPage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona ze statystykami</h2>
      </div>
    </div>
  );
};

export default StatisticsPage;
