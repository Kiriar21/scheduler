/**
 * Strona administracji: zarządzanie zespołami, pracownikami, firmą i grafikami.
 * @component
 */
import React, { createContext, useState, useEffect } from 'react';
import styles from './Administration.module.scss';
import AddEmployee from '../../components/Administration/AddEmployee/AddEmployee';
import AddTeam from '../../components/Administration/AddTeam/AddTeam';
import EditEmployee from '../../components/Administration/EditEmployee/EditEmployee';
import DeleteScheduler from '../../components/Administration/DeleteScheduler/DeleteScheduler';
import TeamList from '../../components/Administration/TeamList/TeamList';
import axiosInstance from '../../api/axiosInstance';
import ManageTeam from '../../components/Administration/ManageTeam/ManageTeam';
import AddScheduler from '../../components/Administration/AddScheduler/AddScheduler';
import EditCompany from '../../components/Administration/EditCompany/EditCompany';

export const AdminContext = createContext();

const AdministrationPage = () => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);

  /**
   * Pobiera listę pracowników.
   * @async
   * @function fetchEmployees
   * @returns {Promise<void>}
   */
  //Pobieranie wszystkich pracowników
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.users);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  /**
 * Pobiera listę zespołów.
 * @async
 * @function fetchTeams
 * @returns {Promise<void>}
 */
//Pobieranie wszystkich zespołów
  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/teams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        employees,
        teams,
        fetchEmployees,
        fetchTeams,
      }}
    >
      <div className={styles.content}>
        <div className={styles.list}>
          <h2>Lista zespołów i pracowników</h2>
          <TeamList />
        </div>
        <div className={styles.tools}>
          <div className={styles.employee}>
            <AddTeam />
            <ManageTeam />
          </div>
          <div className={styles.other}>
            <AddEmployee />
            <EditEmployee />
            <AddScheduler />
            <DeleteScheduler />
            <EditCompany />
          </div>
        </div>
      </div>
    </AdminContext.Provider>
  );
};

export default AdministrationPage;
