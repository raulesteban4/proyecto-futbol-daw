import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Intentamos leer del localStorage
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart_fc_canaveral');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 2. Cada vez que el carrito cambie, actualizamos el localStorage automáticamente
    useEffect(() => {
        localStorage.setItem('cart_fc_canaveral', JSON.stringify(cart));
    }, [cart]);

    // Función para añadir productos
    const addToCart = (product) => {
    setCart((prevCart) => {
        const exists = prevCart.find(item => item.id === product.id);
        
        if (exists) {
            // Si al añadir uno más superamos el stock, no hacemos nada
            if (exists.quantity >= product.stock) {
                alert(`No hay más stock disponible de ${product.nombre}`);
                return prevCart;
            }
            return prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        
        // Si es la primera vez que se añade, comprobamos si al menos hay 1 en stock
        if (product.stock > 0) {
            return [...prevCart, { ...product, quantity: 1 }];
        } else {
            alert("Producto agotado");
            return prevCart;
        }
    });
};

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);