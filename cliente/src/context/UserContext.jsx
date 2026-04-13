import { createContext, useState, useContext, useEffect } from 'react';

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
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);