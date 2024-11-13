import React, { useState } from 'react';
import styles from './TeamList.module.scss';

const TeamList = () => {
  const [expandedTeams, setExpandedTeams] = useState({});

  // Przykładowe dane zespołów i pracowników
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
      _id: 'team3',
      name: 'Zespół C',
      users: [],
    },
    {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      }, {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
      {
        _id: 'team3',
        name: 'Zespół C',
        users: [],
      },
  ];

  const toggleTeam = (teamId) => {
    setExpandedTeams((prevState) => ({
      ...prevState,
      [teamId]: !prevState[teamId],
    }));
  };

  return (
    <div className={styles.container}>
    
      <ul className={styles.teamList}>
        {teamData.map((team, index) => (
          <li key={team._id} className={styles.teamItem}>
            <div className={styles.teamRow} onClick={() => toggleTeam(team._id)}>
              <span>{index + 1}.</span>
              <span>{team.name}</span>
              <span>{team.users ? team.users.length : 0}</span>
              <span className={styles.arrow}>
                {expandedTeams[team._id] ? '▲' : '▼'}
              </span>
            </div>
            {expandedTeams[team._id] && (
              <ul className={styles.userList}>
                {team.users && team.users.length > 0 ? (
                  team.users.map((user) => (
                    <li key={user._id} className={styles.userItem}>
                      <span>{user.name}</span>
                      <span>{user.surname}</span>
                      <span>{user.email}</span>
                      <span>{user.role}</span>
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
