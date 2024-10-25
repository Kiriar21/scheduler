import React, { useState } from 'react';
import InputField from '../../components/InputField/InputField';
import SubmitButton from '../../components/SubmitButton/SubmitButton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.scss';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    pwd: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

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

      if (response.status === 200 && data.token) {
        setErrorMessage(null); 
        
        
        const expiryTime = new Date();
        expiryTime.setDate(expiryTime.getDate() + 1); 

        localStorage.setItem('token', data.token); 
        localStorage.setItem('tokenExpiry', expiryTime.toString()); 

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginSuccess = await validateLogin();

    if (loginSuccess) {
      navigate('/home');
    } 
  };

  return (
    <div className={styles.container}>
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
          <p className={`${styles.error} ${errorMessage ? styles.show : ''}`}>
            {errorMessage}
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
