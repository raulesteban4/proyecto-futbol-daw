import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem('fc_canaveral_theme');
        return saved === 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
            localStorage.setItem('fc_canaveral_theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('fc_canaveral_theme', 'light');
        }
    }, [dark]);

    const toggle = () => setDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
