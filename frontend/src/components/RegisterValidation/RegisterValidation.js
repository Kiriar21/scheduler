import { useState } from 'react';

const RegisterValidation = ({ firstName, lastName, email, password, confirmPassword, companyName, nip }) => {
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const validateRegistration = async () => {
    try {
      // Dodaj sprawdzenie zgodności haseł po stronie frontendowej
      if (password !== confirmPassword) {
        setError('Hasła nie są zgodne.');
        setIsValid(false);
        return;
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          companyName,
          nip,
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd połączenia z serwerem');
      }

      const data = await response.json();

      if (data.success) {
        setIsValid(true);
        setError(null); // Brak błędów, rejestracja udana
      } else {
        setError(data.message || 'Wystąpił problem z rejestracją');
        setIsValid(false);
      }
    } catch (error) {
      setError('Wystąpił problem z serwerem');
      setIsValid(false);
    }
  };

  return { error, isValid, validateRegistration };
};

export default RegisterValidation;
