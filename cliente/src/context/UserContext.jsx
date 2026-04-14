import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_fc_canaveral');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Cada vez que el usuario cambie (login o logout), actualizamos el localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('user_fc_canaveral', JSON.stringify(user));
        } else {
            localStorage.removeItem('user_fc_canaveral');
            localStorage.removeItem('token_fc_canaveral');
        }
    }, [user]);

    const login = (userData) => setUser(userData);
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_fc_canaveral');
        localStorage.removeItem('token_fc_canaveral');
        window.location.href = '/login';
    };

    // INTERCEPTOR DE SESIÓN CADUCADA
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Si el servidor responde 401 (Unauthorized)
                if (error.response && error.response.status === 401) {
                    alert("Tu sesión ha caducado. Por favor, identifícate de nuevo.");
                    logout();
                }
                return Promise.reject(error);
            }
        );

        // Limpieza del interceptor al desmontar el componente
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);