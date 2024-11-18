import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './NavPanel.module.scss';
import { Typography } from '@mui/material';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import EventAvailable from '@mui/icons-material/EventAvailable';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../../styles/global.scss'; // Import globalnych zmiennych i czcionki

const theme = createTheme({
    typography: {
        fontFamily: "'Manrope', sans-serif",
    },
});

const NavigationPanel = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data.user);
            } catch (error) {
                console.error('Błąd podczas pobierania danych użytkownika:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) {
        return <p>Ładowanie danych użytkownika...</p>;
    }

    const handleNavigation = (path) => {
        navigate(path);
    };

    const role = user.role;

    return (
        <ThemeProvider theme={theme}>
            <div className={styles.panel}>
                {/* User Info Section */}
                <div className={styles['user-info']}>
                    <div className={styles.userTop}>
                        <div className={styles.usericon}>
                            <AccountCircle className={styles.accountcircle} />
                        </div>
                        <div className={styles.username}>
                            <Typography className={styles.name}>
                                {user.name} {user.surname}
                            </Typography>
                        </div>
                    </div>
                    <div className={styles.userBottom}>
                        <Typography className={styles.role}>
                            rola: <span>{user.role}</span>
                        </Typography>
                        <Typography className={styles.team}>
                            zespół: <span>{user.team ? user.team.name : 'Brak zespołu '}</span>
                        </Typography>
                    </div>
                </div>

                {/* Navigation Menu */}
                <ul className={styles.menu}>
                    <li className={styles['menu-item']} onClick={() => handleNavigation('/schedule')}>
                        <CalendarMonth className={styles.icon} />
                        <span>Grafik</span>
                    </li>
                    <li className={styles['menu-item']} onClick={() => handleNavigation('/availability')}>
                        <EventAvailable className={styles.icon} />
                        <span>Dyspozycyjność</span>
                    </li>
                    <li className={styles['menu-item']} onClick={() => handleNavigation('/statistics')}>
                        <BarChartIcon className={styles.icon} />
                        <span>Statystyki</span>
                    </li>
                    {(role === 'menedżer' || role === 'admin') && (
                        <li className={`${styles['menu-item']} ${styles['menu-item--highlight-blue']}`} onClick={() => handleNavigation('/schedule-settings')}>
                            <SettingsIcon className={styles.icon} />
                            <span>Ustawienia grafiku</span>
                        </li>
                    )}
                    {(role === 'menedżer' || role === 'admin') && (
                        <li className={`${styles['menu-item']} ${styles['menu-item--highlight-blue']}`} onClick={() => handleNavigation('/submissions')}>
                            <AssignmentIcon className={styles.icon} />
                            <span>Raporty</span>
                        </li>
                    )}
                    {role === 'admin' && (
                        <li className={`${styles['menu-item']} ${styles['menu-item--highlight-red']}`} onClick={() => handleNavigation('/administration')}>
                            <AdminPanelSettingsIcon className={styles.icon} />
                            <span>Administrator</span>
                        </li>
                    )}
                </ul>

                {/* Additional Options at the Bottom */}
                <div className={styles.footer}>
                    <li className={styles['menu-item']} onClick={() => handleNavigation('/account-settings')}>
                        <SettingsIcon className={styles.icon} />
                        <span>Ustawienia konta</span>
                    </li>
                    <hr style={{margin: '30px auto ', width:'80%', border:'1px solid #4B5A60'}}/>
                    <li className={`${styles['menu-item']} ${styles['menu-item--highlight-red']}`} onClick={handleLogout}>
                        <ExitToAppIcon className={styles.icon} />
                        <span>Wyloguj</span>
                    </li>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default NavigationPanel;
