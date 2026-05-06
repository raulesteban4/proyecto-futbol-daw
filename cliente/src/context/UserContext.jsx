import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_fc_canaveral');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const navigateRef = useRef(null);

    const setNavigate = useCallback((navFn) => {
        navigateRef.current = navFn;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user_fc_canaveral');
        localStorage.removeItem('token_fc_canaveral');
        if (navigateRef.current) {
            navigateRef.current('/login');
        } else {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user_fc_canaveral', JSON.stringify(user));
        } else {
            localStorage.removeItem('user_fc_canaveral');
            localStorage.removeItem('token_fc_canaveral');
        }
    }, [user]);

    const login = (userData) => setUser(userData);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    setUser(null);
                    localStorage.removeItem('user_fc_canaveral');
                    localStorage.removeItem('token_fc_canaveral');
                    if (navigateRef.current) {
                        navigateRef.current('/login');
                    } else {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    return (
        <UserContext.Provider value={{ user, login, logout, setNavigate }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
