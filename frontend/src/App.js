import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.scss'; // Import globalnych zmiennych i czcionki
import LoginPage from './pages/Login/Login';
import RegisterPage from './pages/Register/Register';
import SchedulePage from './pages/Schedule/Schedule';
import AdministrationPage from './pages/Administration/Administration';
import AvailabilityPage from './pages/Availability/Availability';
import StatisticsPage from './pages/Statistics/Statistics';
import SettingsPage from './pages/Settings/Settings';
import SubmissionsPage from './pages/Submissions/Submissions';
import AccountPage from './pages/Account/Account';
import Layout from './components/Layouts/Layout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout/>} >
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/administration" element={<AdministrationPage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/schedule-settings" element={<SettingsPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />        
            <Route path="/account-settings" element={<AccountPage />} />
            <Route path="*" element={<SchedulePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
