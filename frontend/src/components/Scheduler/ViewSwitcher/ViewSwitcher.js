// components/ViewSwitcher/ViewSwitcher.js
import React from 'react';
import styles from './ViewSwitcher.module.scss';

const ViewSwitcher = ({ selectedView, onViewChange }) => {
  return (
    <div className={styles.viewSwitcher}>
      <button
        className={selectedView === 'day' ? styles.active : ''}
        onClick={() => onViewChange('day')}
      >
        Dzień
      </button>
      <button
        className={selectedView === 'week' ? styles.active : ''}
        onClick={() => onViewChange('week')}
      >
        Tydzień
      </button>
      <button
        className={selectedView === 'month' ? styles.active : ''}
        onClick={() => onViewChange('month')}
      >
        Miesiąc
      </button>
    </div>
  );
};

export default ViewSwitcher;
