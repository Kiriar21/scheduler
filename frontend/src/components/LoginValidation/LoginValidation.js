import React, { useState } from 'react';

const LoginValidation = async ({ email, password }) => {
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const validateLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Błąd połączenia z serwerem');
      }

      const data = await response.json();

      if (data.success) {
        setIsValid(true);
        setError(null); // Brak błędów, logowanie udane
      } else {
        setError('Błędny email lub hasło');
        setIsValid(false);
      }
    } catch (error) {
      setError('Wystąpił problem z serwerem');
      setIsValid(false);
    }
  };

  return { error, isValid, validateLogin };
};

export default LoginValidation;
