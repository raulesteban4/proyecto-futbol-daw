require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || "f8a2_!99_DsK2l-02mZ_QpX92_#canaveral_secure_2026";

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a Supabase:', err);
    } else {
        console.log('Conectado a Supabase (PostgreSQL)');
        release();
    }
});

const verificarToken = require('./auth.js');

// GET /api/jugadores
app.get('/api/jugadores', (req, res) => {
    pool.query("SELECT * FROM players", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// POST /api/jugadores
app.post('/api/jugadores', verificarToken, (req, res) => {
    const { nombre, posicion, dorsal, team_id } = req.body;
    const checkSql = "SELECT * FROM players WHERE dorsal = $1 AND team_id = $2";
    pool.query(checkSql, [dorsal, team_id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.rows.length > 0) {
            return res.status(400).json({ message: `El dorsal ${dorsal} ya está ocupado.` });
        }
        const insertSql = "INSERT INTO players (nombre, posicion, dorsal, team_id) VALUES ($1, $2, $3, $4) RETURNING id";
        pool.query(insertSql, [nombre, posicion, dorsal, team_id], (err, insertResult) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Jugador fichado!", id: insertResult.rows[0].id });
        });
    });
});

// DELETE /api/jugadores/:id
app.delete('/api/jugadores/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    pool.query("DELETE FROM players WHERE id = $1", [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Jugador eliminado" });
    });
});

// PUT /api/admin/jugadores/stats/:id
app.put('/api/admin/jugadores/stats/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { dorsal, goles, asistencias, amarillas, rojas } = req.body;
    const checkDorsalSql = "SELECT * FROM players WHERE dorsal = $1 AND id != $2";
    pool.query(checkDorsalSql, [dorsal, id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.rows.length > 0) {
            return res.status(400).json({ message: `El dorsal ${dorsal} ya está siendo usado por otro jugador.` });
        }
        const sql = "UPDATE players SET dorsal = $1, goles = $2, asistencias = $3, amarillas = $4, rojas = $5 WHERE id = $6";
        pool.query(sql, [dorsal, goles, asistencias, amarillas, rojas, id], (err, updateResult) => {
            if (err) return res.status(500).send(err);
            res.json({ message: "Jugador actualizado correctamente" });
        });
    });
});

// GET /api/productos
app.get('/api/productos', (req, res) => {
    pool.query("SELECT * FROM products", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// GET /api/admin/ventas
app.get('/api/admin/ventas', verificarToken, (req, res) => {
    const sql = `
        SELECT o.*, u.email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.fecha DESC`;
    pool.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// PUT /api/admin/ventas/:id
app.put('/api/admin/ventas/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    pool.query("UPDATE orders SET estado = $1 WHERE id = $2", [estado, id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Estado actualizado" });
    });
});

// POST /api/registro
app.post('/api/registro', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const sql = "INSERT INTO users (username, password, email, rol) VALUES ($1, $2, $3, 'user')";
    pool.query(sql, [username, password, email], (err, result) => {
        if (err) {
            if (err.code === '23505') {
                return res.status(400).json({ message: "El usuario o email ya están registrados" });
            }
            return res.status(500).json(err);
        }
        res.status(200).json({ message: "Usuario registrado" });
    });
});

// POST /api/login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    pool.query("SELECT id, username, rol FROM users WHERE email = $1 AND password = $2", [email, password], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const token = jwt.sign(
                { id: user.id, rol: user.rol },
                SECRET_KEY,
                { expiresIn: '30m' }
            );
            return res.json({ user, token });
        } else {
            return res.status(401).send("Correo o contraseña incorrectos");
        }
    });
});

// POST /api/pedidos
app.post('/api/pedidos', verificarToken, (req, res) => {
    const { user_id, total, productos } = req.body;
    pool.query("INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id", [user_id, total], (err, result) => {
        if (err) {
            console.error("Error al crear pedido:", err);
            return res.status(500).json({ error: "Error al crear el pedido" });
        }
        const pedidoId = result.rows[0].id;
        const values = productos.map(item => [pedidoId, item.id, item.quantity, item.precio]);
        const sqlItems = "INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario) VALUES " +
            values.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ');
        const flatValues = values.flat();

        pool.query(sqlItems, flatValues, (errItems) => {
            if (errItems) {
                console.error("Error al guardar detalles:", errItems);
                return res.status(500).json({ error: "Error al guardar los detalles del pedido" });
            }
            productos.forEach(item => {
                pool.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.id], (errStock) => {
                    if (errStock) console.error(`Error actualizando stock del producto ${item.id}:`, errStock);
                });
            });
            res.status(200).json({ message: "Pedido completo guardado", pedidoId });
        });
    });
});

// GET /api/pedidos/:user_id
app.get('/api/pedidos/:user_id', verificarToken, (req, res) => {
    const { user_id } = req.params;
    pool.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY fecha DESC", [user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// GET /api/pedidos/detalles/:order_id
app.get('/api/pedidos/detalles/:order_id', verificarToken, (req, res) => {
    const { order_id } = req.params;
    pool.query(`
        SELECT oi.*, p.nombre 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $1`, [order_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// GET /api/clasificacion
app.get('/api/clasificacion', (req, res) => {
    pool.query("SELECT * FROM ranking ORDER BY posicion ASC", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// GET /api/partidos
app.get('/api/partidos', (req, res) => {
    pool.query("SELECT * FROM matches ORDER BY fecha ASC", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result.rows);
    });
});

// PUT /api/admin/partidos/:id
app.put('/api/admin/partidos/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { rival, fecha, ubicacion, goles_local, goles_visitante, jugado } = req.body;
    pool.query(`
        UPDATE matches 
        SET rival = $1, fecha = $2, ubicacion = $3, goles_local = $4, goles_visitante = $5, jugado = $6 
        WHERE id = $7`, [rival, fecha, ubicacion, goles_local, goles_visitante, jugado, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar partido:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "Partido actualizado correctamente" });
    });
});

// POST /api/admin/partidos
app.post('/api/admin/partidos', verificarToken, (req, res) => {
    const { rival, fecha, ubicacion, goles_local, goles_visitante, jugado } = req.body;
    pool.query(`
        INSERT INTO matches (rival, fecha, ubicacion, goles_local, goles_visitante, jugado) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [rival, fecha, ubicacion, goles_local || 0, goles_visitante || 0, jugado || false], (err, result) => {
            if (err) {
                console.error("Error al insertar partido:", err);
                return res.status(500).send(err);
            }
            res.json({ message: "Partido añadido", id: result.rows[0].id });
        });
});

// DELETE /api/admin/partidos/:id
app.delete('/api/admin/partidos/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    pool.query("DELETE FROM matches WHERE id = $1", [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar partido:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "Partido eliminado con éxito" });
    });
});

// PUT /api/admin/ranking/:id
app.put('/api/admin/ranking/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { equipo, pj, puntos, posicion } = req.body;
    pool.query("UPDATE ranking SET equipo = $1, pj = $2, puntos = $3, posicion = $4 WHERE id = $5",
        [equipo, pj, puntos, posicion, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar ranking:", err);
                return res.status(500).send(err);
            }
            res.json({ message: "Ranking actualizado correctamente" });
        });
});

// POST /api/admin/ranking
app.post('/api/admin/ranking', verificarToken, (req, res) => {
    const { equipo, pj, puntos, posicion } = req.body;
    pool.query("INSERT INTO ranking (equipo, pj, puntos, posicion) VALUES ($1, $2, $3, $4) RETURNING id",
        [equipo, pj || 0, puntos || 0, posicion], (err, result) => {
            if (err) {
                console.error("Error al añadir equipo:", err);
                return res.status(500).send(err);
            }
            res.json({ message: "Equipo añadido", id: result.rows[0].id });
        });
});

// DELETE /api/admin/ranking/:id
app.delete('/api/admin/ranking/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    pool.query("DELETE FROM ranking WHERE id = $1", [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar equipo:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "Equipo eliminado" });
    });
});

// POST /api/admin/productos
app.post('/api/admin/productos', verificarToken, (req, res) => {
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    pool.query("INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [nombre, descripcion, precio, stock, categoria, imagen_url], (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ message: "Producto añadido", id: result.rows[0].id });
        });
});

// PUT /api/admin/productos/:id
app.put('/api/admin/productos/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, imagen_url } = req.body;
    pool.query("UPDATE products SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5, imagen_url = $6 WHERE id = $7",
        [nombre, descripcion, precio, stock, categoria, imagen_url, id], (err, result) => {
            if (err) {
                console.error("Error al actualizar producto:", err);
                return res.status(500).send(err);
            }
            res.json({ message: "Producto actualizado correctamente" });
        });
});

// DELETE /api/admin/productos/:id
app.delete('/api/admin/productos/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    pool.query("DELETE FROM products WHERE id = $1", [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar producto:", err);
            return res.status(500).send(err);
        }
        res.json({ message: "Producto eliminado correctamente" });
    });
});

// GET /api/admin/stats
app.get('/api/admin/stats', verificarToken, (req, res) => {
    const sql = `
        SELECT 
            (SELECT SUM(total) FROM orders) as "totalRecaudado",
            (SELECT COUNT(*) FROM orders) as "totalPedidos",
            (SELECT COUNT(*) FROM products WHERE stock < 5) as "stockBajo",
            (SELECT COUNT(*) FROM orders WHERE estado::text = 'pendiente' OR estado IS NULL) as "pedidosPendientes",
            (SELECT COUNT(*) FROM orders WHERE estado::text = 'enviado') as "pedidosEnviados",
            (SELECT p.nombre FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             GROUP BY oi.product_id, p.nombre 
             ORDER BY SUM(oi.cantidad) DESC LIMIT 1) as "productoEstrella"
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en stats:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result.rows[0] || {});
    });
});

// GET /health
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
