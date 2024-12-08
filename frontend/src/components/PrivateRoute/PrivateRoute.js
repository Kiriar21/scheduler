/**
 * Komponent sprawdzający uprawnienia użytkownika na podstawie tokenu i ról.
 * Renderuje Outlet jeśli rola użytkownika jest dozwolona, w przeciwnym wypadku przekierowuje.
 * @component
 * @param {string[]} allowedRoles - Tablica ról mających dostęp do danej trasy
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
const PrivateRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token'); // Pobieranie tokenu z localStorage

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Dekodowanie tokenu, aby wyciągnąć rolę użytkownika
        const decoded = jwtDecode(token);

        // Jeśli brak `allowedRoles`, przepuść dowolnego użytkownika z ważnym tokenem
        if (!decoded) {
            console.error('Token nie zawiera danych.');
            return <Navigate to="/login" replace />;
        }

        if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
            if (!allowedRoles.includes(decoded.role)) {
                return <Navigate to="/schedule" replace />;
            }
        }

        return <Outlet />;
    } catch (error) {
        console.error('Błąd podczas dekodowania tokenu:', error);
        return <Navigate to="/login" replace />;
    }
};

export default PrivateRoute;
