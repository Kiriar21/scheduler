import React from 'react';
import styles from './SubmitButton.module.scss';

const SubmitButton = ({ label }) => {
  return (
    <button type="submit" className={styles.submitButton}>
      {label}
    </button>
  );
};

export default SubmitButton;
