import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const inactivityTimer = useRef(null);

    // Cargar usuario del localStorage al iniciar
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user from localStorage", error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
            inactivityTimer.current = null;
        }
        window.location.href = '/login';
    }, []);

    // --- INACTIVITY TIMEOUT ---
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        inactivityTimer.current = setTimeout(() => {
            console.warn("⏳ Sesión expirada por inactividad (30 min).");
            logout();
        }, INACTIVITY_TIMEOUT);
    }, [logout]);

    useEffect(() => {
        if (!user) {
            // Si no hay usuario, limpiar timer y no escuchar eventos
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
                inactivityTimer.current = null;
            }
            return;
        }

        // Eventos que cuentan como actividad
        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetInactivityTimer();
        };

        // Iniciar timer y escuchar eventos
        resetInactivityTimer();
        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            if (inactivityTimer.current) {
                clearTimeout(inactivityTimer.current);
            }
        };
    }, [user, resetInactivityTimer]);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'ADMINISTRADOR',
        isDocente: user?.rol === 'DOCENTE',
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
