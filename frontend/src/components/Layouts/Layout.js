import React from 'react';
import NavigationPanel from '../NavPanel/NavPanel';
import { Route, Routes } from 'react-router-dom';
import styles from './Layout.module.scss'
import SchedulePage from '../../pages/Schedule/Schedule';
import AdministrationPage from '../../pages/Administration/Administration';
import AvailabilityPage from '../../pages/Availability/Availability';
import StatisticsPage from '../../pages/Statistics/Statistics';
import SettingsPage from '../../pages/Settings/Settings';
import SubmissionsPage from '../../pages/Submissions/Submissions';
import AccountPage from '../../pages/Account/Account';

export default function Layout(props){
    return (
        <div className={styles.container}>
            <header style={{width:'15em'}}>
                <NavigationPanel />
            </header>
            <main className={styles.main}>
                <Routes>
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/administration" element={<AdministrationPage />} />
                    <Route path="/availability" element={<AvailabilityPage />} />                   
                    <Route path="/schedule-settings" element={<SettingsPage />} />
                    <Route path="/submissions" element={<SubmissionsPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />  
                    <Route path="/account-settings" element={<AccountPage />} />                         
                    <Route path="*" element={<SchedulePage />} />
                </Routes>
            </main>
            <footer></footer>
        </div>
    )
}