import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.scss';
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
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { jwtDecode } from 'jwt-decode';
import  SchedulerProvider  from './contexts/SchedulerContext/SchedulerContext';
import { SchedulerContext } from './contexts/SchedulerContext/SchedulerContext';

function App() {

  const { loading } = useContext(SchedulerContext);

  if (loading) {
    return <div className="loading-screen">Ładowanie danych...</div>;
  }

  const getRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error('Błąd podczas dekodowania tokenu:', error);
      return null;
    }
  };

  const role = getRole();
  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Private Layout */}
            <Route element={<Layout />}>
              
              {/* Trasy adminów */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}> 
                <Route path="/administration" element={<AdministrationPage />} />
              </Route>
              
                {/* Trasy managerów */}
                <Route element={<PrivateRoute allowedRoles={['manager']} />}>
                  <Route path="/schedule-settings" element={<SettingsPage />} />
                  <Route path="/submissions" element={<SubmissionsPage />} />
                </Route>

                {/* Trasy użytkowników i managerów */}
                <Route element={<PrivateRoute allowedRoles={['manager', 'user']} />}>
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/availability" element={<AvailabilityPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                </Route>
                {/* Trasy wspólne dla wszystkich */}
                <Route element={<PrivateRoute allowedRoles={['user', 'manager', 'admin']} />}>
                  <Route path="/account-settings" element={<AccountPage />} />
                  <Route
                    path="*"
                    element={
                      role === 'admin' ? (
                        <Navigate to="/administration" replace />
                      ) : (
                        <Navigate to="/schedule" replace />
                      )
                    }
                  />
                </Route>
              
            </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
