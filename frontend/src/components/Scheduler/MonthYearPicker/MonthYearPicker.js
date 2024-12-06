import React, { useState, useRef, useEffect } from 'react';
import styles from './MonthYearPicker.module.scss'; 
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChevronLeft from '@mui/icons-material/ChevronLeft';

//Obsługa wybierania miesiaca 
const MonthYearPicker = ({ availableSchedulers, selectedMonth, selectedYear, onChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Posortuj dostępne schedulery chronologicznie
  const sortedSchedulers = [...availableSchedulers].sort((a, b) => {
    const dateA = new Date(`${a.month} 1, ${a.year}`);
    const dateB = new Date(`${b.month} 1, ${b.year}`);
    return dateA - dateB;
  });

  // Znajdź indeks aktualnego schedulera
  const currentIndex = sortedSchedulers.findIndex(
    (schedule) => schedule.month === selectedMonth && schedule.year === selectedYear
  );

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevSchedule = sortedSchedulers[currentIndex - 1];
      onChange(prevSchedule.month, prevSchedule.year);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedSchedulers.length - 1) {
      const nextSchedule = sortedSchedulers[currentIndex + 1];
      onChange(nextSchedule.month, nextSchedule.year);
    }
  };

  const handleSelect = (schedule) => {
    onChange(schedule.month, schedule.year);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.monthYearPicker} ref={dropdownRef}>
      <button onClick={handlePrev} disabled={currentIndex === 0}>
        <ChevronLeft />
      </button>
      
      <span className={styles.display} onClick={toggleDropdown}>
        {selectedMonth} {selectedYear} <CalendarMonth className={styles.calendarIcon} />
      </span>
      
      <button onClick={handleNext} disabled={currentIndex === sortedSchedulers.length - 1}>
        <ChevronRight />
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            <h4>Wybierz Grafik</h4>
            <ul className={styles.schedulerList}>
              {sortedSchedulers.map((schedule, index) => (
                <li key={index} className={styles.schedulerItem}>
                  <button
                    className={`${styles.schedulerButton} ${
                      schedule.month === selectedMonth && schedule.year === selectedYear ? styles.active : ''
                    }`}
                    onClick={() => handleSelect(schedule)}
                  >
                    {schedule.month} {schedule.year}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
