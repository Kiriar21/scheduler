/**
 * Komponent formularza do edycji danych firmy.
 * @component
 */
import React, { useState, useEffect } from 'react';
import styles from '../Form.module.scss';
import axiosInstance from '../../../api/axiosInstance';

//Edycja danych firmy - komponent
const EditCompany = () => {
  const [companyData, setCompanyData] = useState({ name: '', nip: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  /**
 * Pobiera aktualne dane firmy z API.
 * @async
 * @function fetchCompanyData
 * @returns {Promise<void>}
 */
//Pobieranie danych o firmie
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get('/company/info', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanyData(response.data.company);
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };
    fetchCompanyData();
  }, []);

  /**
 * Obsługuje zmianę wartości pól formularza danych firmy.
 * @function handleChange
 * @param {object} e - Obiekt zdarzenia
 */
//Obsługa zmiany danych firmy
  const handleChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  /**
 * Obsługuje przesłanie formularza edycji danych firmy.
 * @async
 * @function handleSubmit
 * @param {object} e - Obiekt zdarzenia
 * @returns {Promise<void>}
 */
//Obsługa przesłania zmiany danych firmy
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(
        '/company/edit',
        companyData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ text: response.data.message, type: 'success' });
    } catch (error) {
      console.error('Error updating company data:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage({ text: error.response.data.error, type: 'error' });
      } else {
        setMessage({ text: 'Wystąpił błąd podczas aktualizacji danych firmy.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Edytuj Dane Firmy</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.input}>
          <label>Nazwa Firmy:</label>
          <input
            type="text"
            name="name"
            value={companyData?.name || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.input}>
          <label>NIP:</label>
          <input
            type="text"
            name="nip"
            value={companyData?.nip || ''}
            onChange={handleChange}
            required
          />
        </div>

        {message.text && (
          <p className={message.type === 'success' ? styles.success : styles.error}>
            {message.text}
          </p>
        )}

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Aktualizowanie...' : 'Zapisz'}
        </button>
      </form>
    </div>
  );
};

export default EditCompany;
