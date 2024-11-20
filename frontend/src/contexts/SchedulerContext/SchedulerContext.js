import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

export const SchedulerContext = createContext();

const SchedulerProvider = ({ children }) => {
  const [currentScheduler, setCurrentScheduler] = useState(null);
  const [availableSchedulers, setAvailableSchedulers] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().toLocaleString('pl-PL', { month: 'long' }).toLowerCase(),
    year: new Date().getFullYear(),
  });

  // Pobieranie obecnego grafiku
  const fetchScheduler = async (month, year) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/scheduler', {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, year },
      });
      console.log(response.data.scheduler)
      setCurrentScheduler(response.data.scheduler);
    } catch (error) {
      console.error('Error fetching scheduler:', error);
      setCurrentScheduler(null); // Brak grafiku
    }
  };

  // Pobieranie dostępnych grafików
  const fetchAvailableSchedulers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/schedulers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableSchedulers(response.data.schedulers);
    } catch (error) {
      console.error('Error fetching available schedulers:', error);
      setAvailableSchedulers([]);
    }
  };

  // Inicjalizacja na starcie
  useEffect(() => {
    fetchScheduler(selectedDate.month, selectedDate.year);
    fetchAvailableSchedulers();
  }, []);

  // Zmiana grafiku
  const changeScheduler = (month, year) => {
    setSelectedDate({ month, year });
    fetchScheduler(month, year);
  };

  return (
    <SchedulerContext.Provider
      value={{
        currentScheduler,
        availableSchedulers,
        selectedDate,
        changeScheduler,
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
};

export default SchedulerProvider;
