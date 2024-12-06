import React, { useState, useContext } from 'react';
import styles from './TeamList.module.scss';
import ArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { AdminContext } from '../../../pages/Administration/Administration';

//Pobieranie listy zespołów
const TeamList = () => {
  const [expandedTeams, setExpandedTeams] = useState({});
  const { teams } = useContext(AdminContext); // Bezpośredni dostęp do zespołów z kontekstu

  //Obsługa zmiany teamu
  const toggleTeam = (teamId) => {
    setExpandedTeams((prevState) => ({
      ...prevState,
      [teamId]: !prevState[teamId],
    }));
  };

  return (
    <div className={styles.ulcontainer}>
      <ul className={styles.teamList}>
        {teams.map((team, index) => (
          <li key={team._id} className={styles.teamItem}>
            <div className={styles.teamRow} onClick={() => toggleTeam(team._id)}>
              <span><strong>{index + 1}.</strong></span>
              <span>Nazwa: <strong>{team.name}</strong></span>
              <span>Liczba pracowników: <strong>{team.users ? team.users.length : 0}</strong></span>
              <span className={styles.arrow}>
                {expandedTeams[team._id] ? <ArrowUp /> : <ArrowDown />}
              </span>
            </div>
            {expandedTeams[team._id] && (
              <ul className={styles.userList}>
                {team.users && team.users.length > 0 ? (
                  team.users.map((user) => (
                    <li key={user._id} className={styles.userItem}>
                      <span>Pracownik: <strong>{user.name} {user.surname}</strong></span>
                      <span>E-mail:<strong> {user.email}</strong></span>
                      <span>Rola: <strong>{user.role}</strong></span>
                    </li>
                  ))
                ) : (
                  <li className={styles.noUser}>Brak przypisanych pracowników</li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamList;
