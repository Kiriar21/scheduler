import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

const EditTeam = () => {
  const { teams, fetchTeams } = useContext(AdminContext);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const handleTeamSelect = (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    const team = teams.find((team) => team._id === teamId);
    setNewTeamName(team ? team.name : '');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !newTeamName) {
      alert('Wybierz zespół i wpisz nową nazwę.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        `/team/edit/${selectedTeam}`,
        { name: newTeamName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Zespół został zaktualizowany.');
      fetchTeams();
      setSelectedTeam('');
      setNewTeamName('');
    } catch (error) {
      console.error('Error editing team:', error);
      alert('Wystąpił błąd podczas aktualizacji zespołu.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleEdit}>
        <h3>Edytuj zespół</h3>
        <div className={styles.input}>
          <label>Wybierz zespół:</label>
          <select value={selectedTeam} onChange={handleTeamSelect} required>
            <option value="">Wybierz zespół</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        {selectedTeam && (
          <div className={styles.input}>
            <label>Nowa nazwa zespołu:</label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
            />
          </div>
        )}
        <button type="submit" className={styles.button}>
          Zapisz zmiany
        </button>
      </form>
    </div>
  );
};

export default EditTeam;
