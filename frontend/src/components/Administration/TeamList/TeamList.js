import React, { useState } from 'react';
import styles from './TeamList.module.scss';
import ArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ArrowUp from '@mui/icons-material/KeyboardArrowUp';

const TeamList = () => {
  const [expandedTeams, setExpandedTeams] = useState({});

  const teamData = [
    {
      _id: 'team1',
      name: 'Zespół A',
      users: [
        { _id: 'user1', name: 'Jan', surname: 'Kowalski', email: 'jan.kowalski@example.com', role: 'Pracownik' },
        { _id: 'user2', name: 'Anna', surname: 'Nowak', email: 'anna.nowak@example.com', role: 'Menedżer' },
      ],
    },
    {
      _id: 'team2',
      name: 'Zespół B',
      users: [
        { _id: 'user3', name: 'Piotr', surname: 'Wiśniewski', email: 'piotr.wisniewski@example.com', role: 'Pracownik' },
      ],
    },
    {
      _id: 'team2',
      name: 'Zespół B',
      users: [
        { _id: 'user3', name: 'Piotr', surname: 'Wiśniewski', email: 'piotr.wisniewski@example.com', role: 'Pracownik' },
      ],
    },
  ];

  const toggleTeam = (teamId) => {
    setExpandedTeams((prevState) => ({
      ...prevState,
      [teamId]: !prevState[teamId],
    }));
  };

  return (
    <div className={styles.ulcontainer}>
      {/* <div className={styles.teamHeader}>
        <span>Nr</span>
        <span>Nazwa Zespołu</span>
        <span>Liczba Pracowników</span>
      </div> */}
      <ul className={styles.teamList}>
        {teamData.map((team, index) => (
          <li key={team._id} className={styles.teamItem}>
            <div className={styles.teamRow} onClick={() => toggleTeam(team._id)}>
              <span><strong>{index + 1}.</strong></span>
              <span>Nazwa: <strong>{team.name}</strong></span>
              <span>Liczba pracowników: <strong>{team.users ? team.users.length : 0}</strong></span>
              <span className={styles.arrow}>
  {expandedTeams[team._id] ? <ArrowUp /> : <ArrowDown />}
</span>
            </div>
            {/* {expandedTeams[team._id] && (
              <div className={styles.userHeader}>
                <span>Imię</span>
                <span>Nazwisko</span>
                <span>Email</span>
                <span>Rola</span>
              </div>
            )} */}
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
