const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Raul@3306',
    database: 'proyecto_futbol'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Obtener todos los jugadores
app.get('/api/jugadores', (req, res) => {
    db.query("SELECT * FROM players", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Para añadir jugadores
app.post('/api/jugadores', (req, res) => {
    const { nombre, posicion, dorsal, team_id } = req.body;
    const sql = "INSERT INTO players (nombre, posicion, dorsal, team_id) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nombre, posicion, dorsal, team_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Jugador fichado!", id: result.insertId });
    });
});

// Eliminar jugadores
app.delete('/api/jugadores/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM players WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Jugador eliminado" });
    });
});

// --- RUTAS DE LA TIENDA (PRODUCTS) ---

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Añadir producto - Por si quieres gestionarlo desde la web
app.post('/api/productos', (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const sql = "INSERT INTO products (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, descripcion, precio, stock, categoria], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Producto añadido", id: result.insertId });
    });
});

// Registro de usuario
app.post('/api/registro', (req, res) => {
    const { username, password, email } = req.body;
    const sql = "INSERT INTO users (username, password, email, rol) VALUES (?, ?, ?, 'user')";
    db.query(sql, [username, password, email], (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(200).json({ message: "Usuario registrado" });
    });
});

// Login de usuario
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.status(200).json(result[0]); // Enviamos los datos del usuario
        } else {
            res.status(401).json({ message: "Credenciales incorrectas" });
        }
    });
});

// RECIBIR PEDIDOS
app.post('/api/pedidos', (req, res) => {
    const { user_id, total, productos } = req.body;

    // 1. Insertamos el pedido principal
    const sqlOrder = "INSERT INTO orders (user_id, total) VALUES (?, ?)";
    
    db.query(sqlOrder, [user_id, total], (err, result) => {
        if (err) {
            console.error("Error al crear pedido:", err);
            return res.status(500).json({ error: "Error al crear el pedido" });
        }

        const pedidoId = result.insertId;

        // 2. Insertamos cada producto del carrito en order_items
        const values = productos.map(item => [pedidoId, item.id, item.quantity, item.precio]);
        const sqlItems = "INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario) VALUES ?";

        db.query(sqlItems, [values], (errItems) => {
            if (errItems) {
                console.error("Error al guardar detalles:", errItems);
                return res.status(500).json({ error: "Error al guardar los detalles del pedido" });
            }
            
            res.status(200).json({ 
                message: "Pedido completo guardado", 
                pedidoId: pedidoId 
            });
        });
    });
});

// Lista de compras por usuario
app.get('/api/pedidos/:user_id', (req, res) => {
    const { user_id } = req.params;
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY fecha DESC";
    
    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

app.listen(5000, () => {
    console.log("Servidor corriendo en el puerto 5000");
});