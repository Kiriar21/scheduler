import React, { useContext, useState } from 'react';
import styles from '../Form.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axiosInstance from '../../../api/axiosInstance';

//Dodawanie pracownika - komponent
const AddEmployee = () => {
  const { fetchEmployees, teams, fetchTeams } = useContext(AdminContext);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    pwd: '',
    role: 'user',
    teamId: '',
  });

  //Reaguje na zmiane w inpucie
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //Obsługa dodawania pracownika 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Pobierz token z localStorage, jeśli to konieczne
      await axiosInstance.post('/register/user', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees(); // Odświeżenie listy pracowników po dodaniu nowego
      fetchTeams();
      setFormData({
        name: '',
        surname: '',
        email: '',
        pwd: '',
        role: 'user',
        teamId: '',
      }); // Resetowanie formularza
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  return (
    <div className={styles.container}>
    <form onSubmit={handleSubmit}>
        <h3>Dodaj pracownika</h3>
        <div className={styles.input}>
        <label>Imię:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        </div>
        <div className={styles.input}>
        <label>Nazwisko:</label>
        <input
          type="text"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          required
        />
        </div>
        <div className={styles.input}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        </div>
        <div className={styles.input}>
        <label>Hasło:</label>
        <input
          type="password"
          name="pwd"
          value={formData.pwd}
          onChange={handleChange}
          required
        />
        </div>
        <div className={styles.input}>
        <label>Rola:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">Pracownik</option>
          <option value="manager">Menedżer</option>
        </select>
        </div>
        <div className={styles.input}>
        <label>Zespół:</label>
        <select name="teamId" value={formData.teamId} onChange={handleChange} required>
          <option value="">Wybierz zespół</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.button}>Dodaj</button>
    </form>
    </div>
  );
};

export default AddEmployee;
