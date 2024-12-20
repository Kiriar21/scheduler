/**
 * Strona logowania.
 * Umożliwia uwierzytelnienie użytkownika i zapisanie tokenu w localStorage.
 * @component
 */
import React, { useState } from 'react';
import InputField from '../../components/InputField/InputField';
import SubmitButton from '../../components/SubmitButton/SubmitButton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.scss';
import {jwtDecode} from 'jwt-decode';


const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    pwd: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  /**
 * Obsługa zmian w polach formularza logowania.
 * @function handleChange
 * @param {object} e - Obiekt zdarzenia
 */
//Zmiana danych w inpucie logowania
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  /**
 * Waliduje dane logowania i próbuje zalogować użytkownika.
 * @async
 * @function validateLogin
 * @returns {Promise<boolean>}
 */
//Walidacja logowania
  const validateLogin = async () => {
    try {
      const response = await axios.post('/login', {
        email: loginData.email,
        pwd: loginData.pwd,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      localStorage.setItem('token', data.token); 

      if (response.status === 200 && data.token) {
        setErrorMessage(null); 
        
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + 1); 


        return true; 
      } else {
        setErrorMessage(data.error || 'Błędny email lub hasło');
        return false; 
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Wystąpił problem z serwerem');
      }
      return false; 
    }
  };

  /**
 * Obsługa przesłania formularza logowania.
 * @async
 * @function handleSubmit
 * @param {object} e - Obiekt zdarzenia
 * @returns {Promise<void>}
 */
//Obsługa logowania
  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginSuccess = await validateLogin();

    if (loginSuccess) {
      const token = localStorage.getItem('token');

      try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.role === 'admin') {
          navigate('/administration');
        } else if (decodedToken.role === 'manager' || decodedToken.role === 'user') {
          navigate('/schedule');
        } else {
          setErrorMessage('Nieznana rola użytkownika.');
          localStorage.removeItem('token')
          navigate('/login') 
        }
      } catch (error) {
        console.error('Błąd podczas dekodowania tokenu:', error);
        setErrorMessage('Nieprawidłowy token. Zaloguj się ponownie.');
        localStorage.removeItem('token'); 
        navigate('/login');
      }
    }
  };

  return (
    <div className={styles.container}>
      {errorMessage && (
      <p className={`${styles.error} ${errorMessage ? styles.show : ''}`}>
        {errorMessage}
      </p>
    )}
      <div className={styles.containerBox}>
        <h2 className={styles.heading}>Logowanie</h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Adres email"
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="Hasło"
            type="password"
            name="pwd"
            value={loginData.pwd}
            onChange={handleChange}
            required
          />
          <SubmitButton label="Zaloguj się" />
          <p 
            className={styles.registerPrompt} 
            onClick={() => navigate('/register')}
          >
            Nie masz konta? <span>Zarejestruj się</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
