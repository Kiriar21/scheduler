import React from 'react';
import styles from './Settings.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const SettingsPage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona z ustawieniami grafiku</h2>
      </div>
    </div>
  );
};

export default SettingsPage;
