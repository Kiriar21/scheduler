/**
 * Komponent formularza do dodawania nowego zespołu.
 * @component
 */
import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

//Dodawanie zespołu - komponent
const AddTeam = () => {
  const { fetchTeams } = useContext(AdminContext);
  const [teamName, setTeamName] = useState('');

  /**
 * Obsługuje zmianę wartości pola nazwy zespołu.
 * @function handleChange
 * @param {object} e - Obiekt zdarzenia
 */
//Reaguje na zmiane w inpucie
  const handleChange = (e) => {
    setTeamName(e.target.value);
  };

  /**
 * Obsługa przesłania formularza dodawania zespołu.
 * @async
 * @function handleSubmit
 * @param {object} e - Obiekt zdarzenia
 * @returns {Promise<void>}
 */
//Obsługa dodawania zespołu
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(
        '/team/add',
        { name: teamName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTeams();
      setTeamName('');
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <h3>Dodaj zespół</h3>
        <div className={styles.input}>
          <label>Nazwa zespołu:</label>
          <input
            type="text"
            name="teamName"
            value={teamName}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Dodaj</button>
      </form>
    </div>
  );
};

export default AddTeam;
