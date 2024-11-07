import React from 'react';
import styles from './Availability.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const AvailabilityPage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona dostępności</h2>
      </div>
    </div>
  );
};

export default AvailabilityPage;
