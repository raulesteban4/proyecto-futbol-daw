import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Plantilla from './pages/Plantilla';
import Tienda from './pages/Tienda';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import Competicion from './pages/Competicion';
import AdminDashboard from './components/Admin/AdminDashboard';
import Confirmacion from './pages/Confirmacion';

function LoadingScreen() {
    return (
        <div className="global-loading">
            <div className="global-loading__spinner"></div>
            <p>Cargando FC Cañaveral...</p>
        </div>
    );
}

function AppContent() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />
                <main className="main-container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/plantilla" element={<Plantilla />} />
                        <Route path="/tienda" element={<Tienda />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Registro />} />
                        <Route path="/perfil" element={<Perfil />} />
                        <Route path="/competicion" element={<Competicion />} />
                        <Route
                            path="/admin"
                            element={
                                user && user.rol === 'admin' ? (
                                    <AdminDashboard />
                                ) : (
                                    <Navigate to="/" replace />
                                )
                            }
                        />
                        <Route path="/confirmacion" element={<Confirmacion />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
