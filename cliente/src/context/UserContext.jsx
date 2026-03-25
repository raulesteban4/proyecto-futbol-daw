import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = no hay nadie logueado

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);