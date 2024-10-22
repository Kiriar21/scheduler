import React, { useState } from 'react';
import InputField from '../../components/InputField/InputField';
import SubmitButton from '../../components/SubmitButton/SubmitButton';
import LoginValidation from '../../components/LoginValidation/LoginValidation';
import styles from './Login.module.scss';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [errorMessage, setErrorMessage] = useState(''); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error, isValid, validateLogin } = LoginValidation(loginData);

    await validateLogin();

    if (!isValid) {
      setErrorMessage(error);
    } else {
      setErrorMessage('');
      console.log('Logowanie udane!');
      // Możesz tutaj dodać dalszą logikę, np. przekierowanie użytkownika
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
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
          <SubmitButton label="Zaloguj się" />
          {/* Zawsze renderuj element <p>, ale kontroluj jego widoczność */}
          <p className={`${styles.error} ${errorMessage ? styles.show : ''}`}>
            {errorMessage}
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
