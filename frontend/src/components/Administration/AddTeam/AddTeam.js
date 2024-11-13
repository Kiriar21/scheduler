import React, { useContext, useState } from 'react';
import styles from './AddTeam.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axios from 'axios';

const AddTeam = () => {
  const { fetchTeams } = useContext(AdminContext);
  const [teamName, setTeamName] = useState('');

  const handleChange = (e) => {
    setTeamName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Pobierz token z localStorage, jeśli wymagany
      await axios.post(
        '/team/add',
        { name: teamName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTeams(); // Odświeżenie listy zespołów po dodaniu nowego
      setTeamName(''); // Resetowanie pola tekstowego
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
      <button type="submit">Dodaj</button>
    </form>
    </div>
  );
};

export default AddTeam;
