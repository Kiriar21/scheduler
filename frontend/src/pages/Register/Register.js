import React, { useState } from 'react';
import InputField from '../../components/InputField/InputField';
import SubmitButton from '../../components/SubmitButton/SubmitButton';
import RegisterValidation from '../../components/RegisterValidation/RegisterValidation';
import styles from './Register.module.scss';

const RegisterPage = () => {
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    nip: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error, isValid, validateRegistration } = RegisterValidation(registerData);

    await validateRegistration();

    if (!isValid) {
      setErrorMessage(error);
    } else {
      setErrorMessage('');
      console.log('Rejestracja udana!');
      // Możesz tutaj dodać dalszą logikę, np. przekierowanie użytkownika
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.containerBox}>
        <h2 className={styles.heading}>Rejestracja</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputs}>
            <div className={styles.leftBox}>
              <h3>Dane administratora</h3>
              <InputField
                label="Imię"
                type="text"
                name="firstName"
                value={registerData.firstName}
                onChange={handleChange}
                required
              />
              <InputField
                label="Nazwisko"
                type="text"
                name="lastName"
                value={registerData.lastName}
                onChange={handleChange}
                required
              />
              <InputField
                label="Adres email"
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                required
              />
              <InputField
                label="Hasło"
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleChange}
                required
              />
              <InputField
                label="Powtórz hasło"
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.rightBox}>
              <h3>Dane firmy</h3>
              <InputField
                label="Nazwa firmy"
                type="text"
                name="companyName"
                value={registerData.companyName}
                onChange={handleChange}
                required
              />
              <InputField
                label="NIP"
                type="text"
                name="nip"
                value={registerData.nip}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <SubmitButton label="Zarejestruj się" />
          {/* Zawsze renderuj element <p>, ale kontroluj jego widoczność */}
          <p className={`${styles.error} ${errorMessage ? styles.show : ''}`}>
            {errorMessage}
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
