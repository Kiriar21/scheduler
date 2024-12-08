/**
 * Komponent układu aplikacji z nagłówkiem i stopką oraz zagnieżdżonym Outlet.
 * @component
 */
import React from 'react';
import { Outlet } from 'react-router-dom'; 
import NavigationPanel from '../NavPanel/NavPanel';
import styles from './Layout.module.scss';

export default function Layout() {
    return (
        <div className={styles.container}>
            <header>
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
