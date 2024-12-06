import React from 'react';
import styles from './ViewSwitcher.module.scss';

//Obsługa selecta z wyborem dzien miesiac i tydzien
const ViewSwitcher = ({ selectedView, onViewChange }) => {
  const getActivePosition = () => {
    switch (selectedView) {
      case 'day':
        return '0%';
      case 'week':
        return '33.33%';
      case 'month':
        return '66.66%';
      default:
        return '0%';
    }
  };

  return (
    <div className={styles.viewSwitcher}>
      {/* Animowany wskaźnik */}
      <div
        className={styles.activeIndicator}
        style={{ left: getActivePosition() }}
      ></div>

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
