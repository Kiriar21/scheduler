import React, { useContext, useState } from 'react';
import styles from './EditEmployee.module.scss';
import { AdminContext } from '../../../pages/Administration/Administration';
import axios from 'axios';

const EditEmployee = () => {
  const { employees, teams, fetchEmployees } = useContext(AdminContext);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    role: 'user',
    teamId: '',
  });

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    setSelectedEmployee(employeeId);

    const employee = employees.find((emp) => emp._id === employeeId);
    if (employee) {
      setFormData({
        name: employee.name,
        surname: employee.surname,
        email: employee.email,
        role: employee.role,
        teamId: employee.teamId || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/user/modify/${selectedEmployee}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/user/delete/${selectedEmployee}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
      setSelectedEmployee('');
      setFormData({
        name: '',
        surname: '',
        email: '',
        role: 'user',
        teamId: '',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleUpdate}>
        <h3>Modyfikuj pracownika</h3>
        <div className={styles.input}>
          <label>Pracownik:</label>
          <select value={selectedEmployee} onChange={handleEmployeeSelect} required>
            <option value="">Wybierz pracownika</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} {emp.surname}
              </option>
            ))}
          </select>
        </div>

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

        <button type="submit">Zatwierdź</button>
        <button type="button" onClick={handleDelete} className={styles.deleteButton}>
          Usuń
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
