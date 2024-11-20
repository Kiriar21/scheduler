// pages/Settings/Settings.js

import React, { useState, useEffect } from 'react';
import styles from './Account.module.scss';
import axiosInstance from '../../api/axiosInstance';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({ name: '', surname: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        setEditData({ name: response.data.user.name, surname: response.data.user.surname });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, []);

  // Handle input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submissions
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        '/user/edit',
        {
          userId: user._id,
          name: editData.name,
          surname: editData.surname,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: 'Dane zostały zaktualizowane.', type: 'success' });
    } catch (error) {
      console.error('Error updating user data:', error);
      setMessage({ text: 'Wystąpił błąd podczas aktualizacji danych.', type: 'error' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'Nowe hasła nie są identyczne.', type: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        '/user/password',
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: 'Hasło zostało zmienione.', type: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ text: 'Wystąpił błąd podczas zmiany hasła.', type: 'error' });
    }
  };

  return (
    <div className={styles.content}>
      <h2>Ustawienia Konta</h2>
      {message.text && (
        <p className={message.type === 'success' ? styles.success : styles.error}>{message.text}</p>
      )}
      <div className={styles.container}>
        {/* Edit Personal Information */}
        <form onSubmit={handleEditSubmit}>
          <h3>Edytuj Informacje Osobiste</h3>
          <div className={styles.input}>
            <label>Imię:</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              required
            />
          </div>
          <div className={styles.input}>
            <label>Nazwisko:</label>
            <input
              type="text"
              name="surname"
              value={editData.surname}
              onChange={handleEditChange}
              required
            />
          </div>
          <button type="submit" className={styles.button}>Zapisz Zmiany</button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit}>
          <h3>Zmień Hasło</h3>
          <div className={styles.input}>
            <label>Stare Hasło:</label>
            <input
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className={styles.input}>
            <label>Nowe Hasło:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className={styles.input}>
            <label>Potwierdź Nowe Hasło:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className={styles.button}>Zmień Hasło</button>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
