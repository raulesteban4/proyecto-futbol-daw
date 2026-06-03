require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { sendOrderShipped, sendOrderConfirmation } = require('./services/emailService');
const { addSubscription, removeSubscription, notifyMatch, notifyProduct } = require('./services/pushService');

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
app.use(express.json({ limit: '50mb' }));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido. Usa JPEG, PNG, WebP o AVIF.'));
        }
    }
});

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
app.put('/api/admin/ventas/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await pool.query("UPDATE orders SET estado = $1 WHERE id = $2", [estado, id]);
        if (estado === 'enviado') {
            const order = await pool.query("SELECT u.email, o.total FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1", [id]);
            if (order.rows.length > 0) {
                sendOrderShipped(order.rows[0].email, id);
            }
        }
        res.json({ message: "Estado actualizado" });
    } catch (err) {
        console.error("Error actualizando venta:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/registro
app.post('/api/registro', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password, email, rol) VALUES ($1, $2, $3, 'user')";
        await pool.query(sql, [username, hash, email]);
        res.status(200).json({ message: "Usuario registrado" });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: "El usuario o email ya están registrados" });
        }
        return res.status(500).json(err);
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT id, username, password, rol FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            SECRET_KEY,
            { expiresIn: '30m' }
        );
        res.json({ user: { id: user.id, username: user.username, rol: user.rol }, token });
    } catch (err) {
        return res.status(500).json(err);
    }
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

            pool.query("SELECT u.email FROM users WHERE id = $1", [user_id], (errEmail, resultEmail) => {
                if (!errEmail && resultEmail.rows.length > 0) {
                    sendOrderConfirmation(resultEmail.rows[0].email, pedidoId, total, productos);
                }
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

// GET /api/admin/stats/ventas-por-dia — para Chart.js
app.get('/api/admin/stats/ventas-por-dia', verificarToken, (req, res) => {
    const sql = `
        SELECT DATE(fecha) as dia, SUM(total) as total, COUNT(*) as pedidos
        FROM orders
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
        LIMIT 30
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en ventas-por-dia:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result.rows);
    });
});

// GET /api/admin/stats/productos-mas-vendidos — para Chart.js
app.get('/api/admin/stats/productos-mas-vendidos', verificarToken, (req, res) => {
    const sql = `
        SELECT p.nombre, SUM(oi.cantidad) as total_vendido, SUM(oi.cantidad * oi.precio_unitario) as ingresos
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY oi.product_id, p.nombre
        ORDER BY total_vendido DESC
        LIMIT 10
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en productos-mas-vendidos:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result.rows);
    });
});

// ==================== STRIPE ====================

// POST /api/create-payment-intent
app.post('/api/create-payment-intent', verificarToken, async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'eur',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Error creating payment intent:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== CLOUDINARY UPLOAD ====================

// POST /api/upload
app.post('/api/upload', verificarToken, upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se envió ninguna imagen' });

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'fc_canaveral',
            resource_type: 'image',
        });

        res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) {
        console.error('Error uploading to Cloudinary:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== WEB PUSH ====================

// POST /api/subscribe
app.post('/api/subscribe', (req, res) => {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Suscripción inválida' });
    }
    addSubscription(subscription);
    res.status(201).json({ message: 'Suscripto correctamente' });
});

// POST /api/unsubscribe
app.post('/api/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    if (endpoint) removeSubscription(endpoint);
    res.json({ message: 'Desuscripto correctamente' });
});

// POST /api/notify/partido — notificar a todos sobre un partido
app.post('/api/notify/partido', verificarToken, async (req, res) => {
    const { title, body } = req.body;
    try {
        await notifyMatch(title || '⚽ Nuevo partido', body || 'Consulta el calendario del FC Cañaveral');
        res.json({ message: 'Notificación enviada' });
    } catch (err) {
        console.error('Error enviando notificación:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/notify/producto — notificar a todos sobre un producto nuevo
app.post('/api/notify/producto', verificarToken, async (req, res) => {
    const { title, body } = req.body;
    try {
        await notifyProduct(title || '🛒 Nuevo producto', body || 'Echa un vistazo a la nueva equipación');
        res.json({ message: 'Notificación enviada' });
    } catch (err) {
        console.error('Error enviando notificación:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==================== HEALTH ====================

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
