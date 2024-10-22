import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.scss'; // Import globalnych zmiennych i czcionki
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Strona logowania */}
        <Route path="/login" element={<LoginPage />} />

        {/* Strona rejestracji */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Domyślny route (np. przekierowanie na stronę logowania) */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
