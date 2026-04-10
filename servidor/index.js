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

    // 1. Primero comprobamos si el dorsal ya está ocupado
    const checkSql = "SELECT * FROM players WHERE dorsal = ? AND team_id = ?";

    db.query(checkSql, [dorsal, team_id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
            // Si ya hay un jugador con ese dorsal, enviamos un error
            return res.status(400).json({ message: `El dorsal ${dorsal} ya está ocupado.` });
        }

        // 2. Si el dorsal está libre, insertamos el jugador
        const insertSql = "INSERT INTO players (nombre, posicion, dorsal, team_id) VALUES (?, ?, ?, ?)";
        db.query(insertSql, [nombre, posicion, dorsal, team_id], (err, insertResult) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Jugador fichado!", id: insertResult.insertId });
        });
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

// Actualizar stats y dorsal jugadores.
app.put('/api/admin/jugadores/stats/:id', (req, res) => {
    const { id } = req.params;
    const { dorsal, goles, asistencias, amarillas, rojas } = req.body;

    // 1. Validar que el nuevo dorsal no lo tenga OTRA persona
    const checkDorsalSql = "SELECT * FROM players WHERE dorsal = ? AND id != ?";

    db.query(checkDorsalSql, [dorsal, id], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            return res.status(400).json({ message: `El dorsal ${dorsal} ya está siendo usado por otro jugador.` });
        }

        // 2. Si el dorsal está libre o es el mismo, actualizamos todo
        const sql = "UPDATE players SET dorsal = ?, goles = ?, asistencias = ?, amarillas = ?, rojas = ? WHERE id = ?";
        db.query(sql, [dorsal, goles, asistencias, amarillas, rojas, id], (err, updateResult) => {
            if (err) return res.status(500).send(err);
            res.json({ message: "Jugador actualizado correctamente" });
        });
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

// Añadir nuevo producto
app.post('/api/admin/productos', (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    const sql = "INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nombre, descripcion, precio, stock, categoria, imagen_url], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Producto añadido", id: result.insertId });
    });
});

// Obtener TODAS las ventas (para el admin)
app.get('/api/admin/ventas', (req, res) => {
    const sql = `
        SELECT o.*, u.email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.fecha DESC`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Cambiar estado del pedido
app.put('/api/admin/ventas/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const sql = "UPDATE orders SET estado = ? WHERE id = ?";

    db.query(sql, [estado, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Estado actualizado" });
    });
});

// Registro de usuario
app.post('/api/registro', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const sql = "INSERT INTO users (username, password, email, rol) VALUES (?, ?, ?, 'user')";
    db.query(sql, [username, password, email], (err, result) => {
        if (err) {
            // Si el error es porque el usuario o email ya existen
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "El usuario o email ya están registrados" });
            }
            return res.status(500).json(err);
        }
        res.status(200).json({ message: "Usuario registrado" });
    });
});

// Login de usuario
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT id, username, rol FROM users WHERE email = ? AND password = ?"; // Buscamos por email

    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).send(err);

        if (result.length > 0) {
            // Si las credenciales coinciden, devolvemos el usuario
            return res.json(result[0]);
        } else {
            // Si no hay coincidencias (email o pass incorrectos)
            return res.status(401).send("Correo o contraseña incorrectos");
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

            // 3. ACTUALIZACIÓN DE STOCK: Restamos la cantidad comprada de cada producto
            // Recorremos el array de productos para actualizar la tabla 'products'
            productos.forEach(item => {
                const sqlUpdateStock = "UPDATE products SET stock = stock - ? WHERE id = ?";
                db.query(sqlUpdateStock, [item.quantity, item.id], (errStock) => {
                    if (errStock) {
                        console.error(`Error actualizando stock del producto ${item.id}:`, errStock);
                    }
                });
            });

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

// Devuelve los nombres de los productos y sus cantidades.
app.get('/api/pedidos/detalles/:order_id', (req, res) => {
    const { order_id } = req.params;
    const sql = `
        SELECT oi.*, p.nombre 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`;

    db.query(sql, [order_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Obtener la clasificación de la liga
app.get('/api/clasificacion', (req, res) => {
    const sql = "SELECT * FROM ranking ORDER BY posicion ASC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Obtener el calendario de partidos
app.get('/api/partidos', (req, res) => {
    const sql = "SELECT * FROM matches ORDER BY fecha ASC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// --- GESTIÓN DE PARTIDOS ---
// Actualizar resultado de un partido
app.put('/api/admin/partidos/:id', (req, res) => {
    const { id } = req.params;
    const { goles_local, goles_visitante, jugado } = req.body;
    const sql = "UPDATE matches SET goles_local = ?, goles_visitante = ?, jugado = ? WHERE id = ?";
    db.query(sql, [goles_local, goles_visitante, jugado, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Partido actualizado" });
    });
});

// --- GESTIÓN DE CLASIFICACIÓN ---
// Actualizar puntos de un equipo
app.put('/api/admin/ranking/:id', (req, res) => {
    const { id } = req.params;
    const { pj, puntos, posicion } = req.body;
    const sql = "UPDATE ranking SET pj = ?, puntos = ?, posicion = ? WHERE id = ?";
    db.query(sql, [pj, puntos, posicion, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Ranking actualizado" });
    });
});

// --- GESTIÓN DE PRODUCTOS (Tienda) ---
// Añadir nuevo producto
app.post('/api/admin/productos', (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    const sql = "INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nombre, descripcion, precio, stock, categoria, imagen_url], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Producto añadido", id: result.insertId });
    });
});

app.put('/api/admin/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    const sql = "UPDATE products SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, imagen_url = ? WHERE id = ?";
    
    db.query(sql, [nombre, descripcion, precio, stock, categoria, imagen_url, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar producto:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "Producto actualizado correctamente" });
    });
});

// Eliminar un producto de la tienda
app.delete('/api/admin/productos/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar producto:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "Producto eliminado correctamente" });
    });
});

app.listen(5000, () => {
    console.log("Servidor corriendo en el puerto 5000");
});