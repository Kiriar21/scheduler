import React from 'react';
import styles from './Administration.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const AdministrationPage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona administratora</h2>
      </div>
    </div>
  );
};

export default AdministrationPage;
