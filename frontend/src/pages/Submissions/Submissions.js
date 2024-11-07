import React from 'react';
import styles from './Submissions.module.scss';
import NavPanel from '../../components/NavPanel/NavPanel';

const SubmissionsPage = () => {
  return (
    <div className={styles.container}>
      <NavPanel />
      <div className={styles.content}>
      <h2>Tu powstaje strona z raportami dostępności</h2>
      </div>
    </div>
  );
};

export default SubmissionsPage;
