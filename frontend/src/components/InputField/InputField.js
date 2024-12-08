/**
 * Komponent pola input z etykietą.
 * @component
 * @param {string} label - Etykieta pola
 * @param {string} type - Typ inputu (np. "text", "password", "email")
 * @param {string} name - Nazwa pola
 * @param {string} value - Aktualna wartość pola
 * @param {function} onChange - Funkcja obsługująca zmianę wartości
 * @returns {JSX.Element}
 */
import React from 'react';
import styles from './InputField.module.scss';

const InputField = ({ label, type, name, value, onChange }) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={styles.input}
        required
      />
    </div>
  );
};

export default InputField;
