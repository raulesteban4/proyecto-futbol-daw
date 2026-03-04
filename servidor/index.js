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
    database: 'futbol_db'
});

app.get('/', (req, res) => {
    res.send("Servidor funcionando");
});

// Obtener todos los jugadores
app.get('/api/jugadores', (req, res) => {
    const sql = "SELECT * FROM jugadores";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error en la consulta" });
        }
        res.send(result);
    });
});

// Para añadir jugadores
app.post('/api/jugadores', (req, res) => {
    const { nombre, posicion, dorsal } = req.body;
    const sql = "INSERT INTO jugadores (nombre, posicion, dorsal) VALUES (?, ?, ?)";
    
    db.query(sql, [nombre, posicion, dorsal], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Jugador fichado!", id: result.insertId });
    });
});

app.listen(5000, () => {
    console.log("Servidor corriendo en el puerto 5000");
});