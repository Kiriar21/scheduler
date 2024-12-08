/**
 * Sprawdza czy token JWT przechowywany w localStorage jest ważny.
 * @function checkTokenExpiration
 * @returns {boolean} True, jeśli token jest ważny, w przeciwnym razie false
 */
export const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
  
    try {
      const decoded = JSON.parse(atob(token.split('.')[1])); // Dekodowanie payloadu JWT
      const currentTime = Date.now() / 1000; // Aktualny czas w sekundach
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        return false; // Token wygasł
      }
      return true; // Token ważny
    } catch (error) {
      console.error('Błąd podczas sprawdzania tokenu:', error);
      localStorage.removeItem('token');
      return false;
    }
  };
  