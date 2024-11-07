import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.scss'; // Import globalnych zmiennych i czcionki
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import Home from './pages/Home/Home';
import SchedulePage from './pages/Schedule/Schedule';
import AdministrationPage from './pages/Administration/Administration';
import AvailabilityPage from './pages/Availability/Availability';
import StatisticsPage from './pages/Statistics/Statistics';
import SettingsPage from './pages/Settings/Settings';
import SubmissionsPage from './pages/Submissions/Submissions';

function App() {
  return (
    <Router>
      <Routes>
        {/* Strona logowania */}
        <Route path="/login" element={<LoginPage />} />

        {/* Strona rejestracji */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Strona grafiku */}
        <Route path="/schedule" element={<SchedulePage />} />
        
        {/* Strona administratora */}
        <Route path="/administration" element={<AdministrationPage />} />

        {/* Strona dostępności pracownika */}
        <Route path="/availability" element={<AvailabilityPage />} />

        {/* Strona ustawień grafiku */}
        <Route path="/schedule-settings" element={<SettingsPage />} />

        {/* Strona z raportami dostępności */}
        <Route path="/submissions" element={<SubmissionsPage />} />

         {/* Strona ze statystykami*/}
         <Route path="/statistics" element={<StatisticsPage />} />

        {/* Przekierowanie na stronę główną po zalogowanmiu*/}
          <Route path="/home" element={<Home />} />

          {/* Domyślny route (np. przekierowanie na stronę logowania) */}
        <Route path="*" element={<LoginPage />} />

      </Routes>
    </Router>
  );
}

export default App;
