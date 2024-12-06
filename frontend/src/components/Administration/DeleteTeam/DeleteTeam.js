import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

//Usuwanie zespołu - komponent
const DeleteTeam = () => {
  const { teams, fetchTeams } = useContext(AdminContext);
  const [selectedTeam, setSelectedTeam] = useState('');

  //Obsługa usuwania zespołu
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      alert('Wybierz zespół do usunięcia.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/team/delete/${selectedTeam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Zespół został usunięty.');
      fetchTeams();
      setSelectedTeam('');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Wystąpił błąd podczas usuwania zespołu.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleDelete}>
        <h3>Usuń zespół</h3>
        <div className={styles.input}>
          <label>Wybierz zespół:</label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            required
          >
            <option value="">Wybierz zespół</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.button}>
          Usuń
        </button>
      </form>
    </div>
  );
};

export default DeleteTeam;
