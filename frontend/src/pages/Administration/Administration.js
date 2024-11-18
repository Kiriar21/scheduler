//pages/Administration.js
import React, { createContext, useState, useEffect } from 'react';
import styles from './Administration.module.scss';
import AddEmployee from '../../components/Administration/AddEmployee/AddEmployee';
import AddTeam from '../../components/Administration/AddTeam/AddTeam';
import EditEmployee from '../../components/Administration/EditEmployee/EditEmployee';
import DeleteScheduler from '../../components/Administration/DeleteScheduler/DeleteScheduler';
import TeamList from '../../components/Administration/TeamList/TeamList';
// import axios from 'axios';
import axiosInstance from '../../api/axiosInstance'

// Tworzymy kontekst
export const AdminContext = createContext();

const AdministrationPage = () => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [schedulers, setSchedulers] = useState([]);

  // Funkcje do pobierania danych
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token'); // Pobierz token z localStorage
      const response = await axiosInstance.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.users);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Dane użytkowników są już zagnieżdżone w odpowiedzi
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };
  
  const fetchSchedulers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/schedulers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedulers(response.data.scheduler);
    } catch (error) {
      setSchedulers({})
    }
    finally{
      console.log(schedulers)
    }
  };
  

  // Inicjalizacja danych
  useEffect(() => {
    fetchEmployees();
    fetchTeams();
    fetchSchedulers();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        employees,
        teams,
        schedulers,
        fetchEmployees,
        fetchTeams,
        fetchSchedulers,
      }}
    >
        <div className={styles.content}>
          
          <div className={styles.list}>
          <h2>Lista zespołów i pracowników</h2>
          <TeamList /> 
          </div>
          <div className={styles.tools}>
            <div className={styles.employee}>
            <AddEmployee />
            <EditEmployee />
            </div>
          <div className={styles.other}>
          <AddTeam />
          <DeleteScheduler />
          </div>
          </div>
        </div>
    </AdminContext.Provider>
  );
};

export default AdministrationPage;
