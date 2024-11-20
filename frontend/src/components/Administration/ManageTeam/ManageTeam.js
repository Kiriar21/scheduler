// components/Administration/ManageTeam/ManageTeam.js

import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

const ManageTeam = () => {
  const { teams, fetchTeams } = useContext(AdminContext);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [action, setAction] = useState('edit'); // 'edit' lub 'delete'

  const handleTeamSelect = (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    const team = teams.find((team) => team._id === teamId);
    setNewTeamName(team ? team.name : '');
  };

  const handleActionChange = (e) => {
    setAction(e.target.value);
    setSelectedTeam('');
    setNewTeamName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      alert('Wybierz zespół.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (action === 'edit') {
        if (!newTeamName) {
          alert('Wpisz nową nazwę zespołu.');
          return;
        }
        await axiosInstance.put(
          `/team/edit/${selectedTeam}`,
          { name: newTeamName },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Zespół został zaktualizowany.');
      } else if (action === 'delete') {
        await axiosInstance.delete(`/team/delete/${selectedTeam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Zespół został usunięty.');
      }
      fetchTeams();
      setSelectedTeam('');
      setNewTeamName('');
    } catch (error) {
      console.error('Error managing team:', error);
      alert('Wystąpił błąd podczas zarządzania zespołem.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <h3>Zarządzaj zespołem</h3>
        <div className={styles.input}>
          <label>Wybierz akcję:</label>
          <select value={action} onChange={handleActionChange}>
            <option value="edit">Edytuj zespół</option>
            <option value="delete">Usuń zespół</option>
          </select>
        </div>
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
        {action === 'edit' && selectedTeam && (
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
          {action === 'edit' ? 'Zapisz zmiany' : 'Usuń zespół'}
        </button>
      </form>
    </div>
  );
};

export default ManageTeam;
