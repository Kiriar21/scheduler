import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
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
import '../../styles/global.scss'; 
import { checkTokenExpiration } from '../../utils/checkTokenExpiration';

const theme = createTheme({
    typography: {
        fontFamily: "'Manrope', sans-serif",
    },
});

//Tworzenie menu nawigacyjnego
const NavigationPanel = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const isTokenValid = checkTokenExpiration();
        if (!isTokenValid) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const isTokenValid = checkTokenExpiration();
                if (!isTokenValid) {
                    navigate('/login');
                    return;
                }

                const token = localStorage.getItem('token');
                const response = await axiosInstance.get('/user', {
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
    }, [navigate]);

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

    // Konfiguracja menu
    const menuConfig = [
        {
            label: 'Grafik',
            path: '/schedule',
            icon: <CalendarMonth className={styles.icon} />,
            roles: ['user', 'manager'],
        },
        {
            label: 'Dyspozycyjność',
            path: '/availability',
            icon: <EventAvailable className={styles.icon} />,
            roles: ['user', 'manager'],
        },
        {
            label: 'Statystyki',
            path: '/statistics',
            icon: <BarChartIcon className={styles.icon} />,
            roles: ['user', 'manager'],
        },
        {
            label: 'Ustawienia grafiku',
            path: '/schedule-settings',
            icon: <SettingsIcon className={styles.icon} />,
            roles: ['manager'],
            highlightClass: 'menu-item--highlight-blue',
        },
        {
            label: 'Raporty',
            path: '/submissions',
            icon: <AssignmentIcon className={styles.icon} />,
            roles: ['manager'],
            highlightClass: 'menu-item--highlight-blue',
        },
        {
            label: 'Administrator',
            path: '/administration',
            icon: <AdminPanelSettingsIcon className={styles.icon} />,
            roles: ['admin'],
            highlightClass: 'menu-item--highlight-red',
        },
    ];

    // Filtrowanie menu na podstawie ról
    const filteredMenu = menuConfig.filter((menuItem) => menuItem.roles.includes(role));

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

                {/* Dynamiczne menu */}
                <ul className={styles.menu}>
                    {filteredMenu.map((item, index) => (
                        <li
                            key={index}
                            className={`${styles['menu-item']} ${
                                item.highlightClass ? styles[item.highlightClass] : ''
                            }`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>

                {/* "Ustawienia konta" - dostępne dla wszystkich */}
                <div className={styles.footer}>
                    <li className={styles['menu-item']} onClick={() => handleNavigation('/account-settings')}>
                        <SettingsIcon className={styles.icon} />
                        <span>Ustawienia konta</span>
                    </li>
                    <hr style={{ margin: '30px auto ', width: '80%', border: '1px solid #4B5A60' }} />
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
