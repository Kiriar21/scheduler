import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import NavigationPanel from '../NavPanel/NavPanel';
import styles from './Layout.module.scss';

export default function Layout() {
    return (
        <div className={styles.container}>
            <header style={{ width: '15em' }}>
                <NavigationPanel />
            </header>
            <main className={styles.main}>
                {/* Renderowanie tras podrzędnych */}
                <Outlet />
            </main>
            <footer></footer>
        </div>
    );
}
