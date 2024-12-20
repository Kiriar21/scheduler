/**
 * Strona rejestracji administratora i firmy.
 * @component
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../../components/InputField/InputField';
import SubmitButton from '../../components/SubmitButton/SubmitButton';
import styles from './Register.module.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerData, setRegisterData] = useState({
    name: '',
    surname: '',
    email: '',
    pwd: '',
    confirmPwd: '',
    companyName: '',
    nip: ''
  });

  const [errorMessage, setErrorMessage] = useState('');

  /**
 * Obsługa zmian w polach formularza rejestracji.
 * @function handleChange
 * @param {object} e - Obiekt zdarzenia
 */
//Zmiana danych w inpucie rejestracji
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

 /**
 * Obsługa przesłania formularza rejestracji.
 * @async
 * @function handleSubmit
 * @param {object} e - Obiekt zdarzenia
 * @returns {Promise<void>}
 */
 //Obsługa rejestracji
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { pwd, confirmPwd } = registerData;

    // Sprawdzenie zgodności haseł
    if (pwd !== confirmPwd) {
      setErrorMessage('Hasła nie są zgodne.');
      return;
    }

    try {
      const response = await axios.post('/register/admin', {
        email: registerData.email,
        pwd: registerData.pwd,
        name: registerData.name,
        surname: registerData.surname,
        nip: registerData.nip,
        companyName: registerData.companyName,
        confirmPwd: registerData.confirmPwd,
      });
      if (response.data.success || response.status === 201) {
        setErrorMessage('');
        navigate('/login');
      } else {
        setErrorMessage(response.data.message || 'Wystąpił problem z rejestracją');
      }
    } catch (error) {
      setErrorMessage('Wystąpił problem z serwerem lub nie można utworzyć więcej kont.');
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
        <h2 className={styles.heading}>Rejestracja</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputs}>
            <div className={styles.leftBox}>
              <h3>Dane administratora</h3>
              <InputField
                label="Imię"
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleChange}
                required
              />
              <InputField
                label="Nazwisko"
                type="text"
                name="surname"
                value={registerData.surname}
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
                name="pwd"
                value={registerData.pwd}
                onChange={handleChange}
                required
              />
              <InputField
                label="Powtórz hasło"
                type="password"
                name="confirmPwd"
                value={registerData.confirmPwd}
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
          
        </form>
        <p 
            className={styles.registerPrompt} 
            onClick={() => navigate('/login')}
          >
            Masz konto? <span>Zaloguj się.</span>
          </p>
      </div>
    </div>
  );
};

export default RegisterPage;
