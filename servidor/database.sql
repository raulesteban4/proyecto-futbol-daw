-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS proyecto_futbol;
USE proyecto_futbol;

-- 2. LIMPIEZA TOTAL
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS ranking;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. CREACIÓN DE TABLAS
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    escudo_url VARCHAR(255),
    liga VARCHAR(100)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('admin', 'user') DEFAULT 'user',
    direccion TEXT
);

CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    posicion VARCHAR(50),
    dorsal INT,
    team_id INT,
    goles INT DEFAULT 0,
    asistencias INT DEFAULT 0,
    amarillas INT DEFAULT 0,
    rojas INT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    imagen_url VARCHAR(255),
    categoria VARCHAR(50)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado ENUM('pendiente', 'pagado', 'enviado') DEFAULT 'pendiente',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    cantidad INT,
    precio_unitario DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rival VARCHAR(100),
    fecha DATETIME,
    ubicacion VARCHAR(100),
    goles_local INT DEFAULT 0,
    goles_visitante INT DEFAULT 0,
    jugado BOOLEAN DEFAULT FALSE
);

-- Tabla extra para la clasificación de la liga
CREATE TABLE ranking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo VARCHAR(100) NOT NULL,
    pj INT DEFAULT 0, -- Partidos Jugados
    puntos INT DEFAULT 0,
    posicion INT
);

-- 4. DATOS DE PRUEBA
INSERT INTO teams (nombre, escudo_url, liga) VALUES ('FC Cañaveral', 'https://via.placeholder.com/150', 'Liga Local');

INSERT INTO players (nombre, posicion, dorsal, team_id, goles, asistencias) VALUES 
('Luka Modric', 'Centrocampista', 10, 1, 5, 12),
('Vinicius Jr', 'Delantero', 7, 1, 15, 8),
('Thibaut Courtois', 'Portero', 1, 1, 0, 0);

INSERT INTO products (nombre, descripcion, precio, stock, categoria) VALUES 
('Camiseta Oficial', 'Equipación local 2026', 75.00, 50, 'Ropa'),
('Balón de Entrenamiento', 'Resistente para césped artificial', 25.00, 20, 'Accesorios'),
('Bufanda del Club', '100% acrílico, colores oficiales', 15.50, 100, 'Merchandising');

INSERT INTO users (username, password, email, rol) VALUES ('Raul', '1234', 'raul@test.com', 'admin');

-- Datos para que la tabla de clasificación
INSERT INTO ranking (equipo, pj, puntos, posicion) VALUES
('FC Cañaveral', 3, 9, 1),
('CD Móstoles', 3, 7, 2),
('Rayo Alcorcón', 3, 6, 3),
('Getafe City', 3, 4, 4),
('Leganés B', 3, 4, 5),
('Alcorcón Academy', 3, 3, 6),
('Fuenlabrada Promesas', 3, 3, 7),
('Real Aranjuez', 3, 2, 8),
('Inter Valdemoro', 3, 1, 9),
('Atlético Sur', 3, 0, 10);

INSERT INTO matches (rival, fecha, ubicacion, goles_local, goles_visitante, jugado) VALUES 
-- Partidos ya jugados
('Rayo Alcorcón', '2024-03-15 10:30:00', 'Polideportivo Cañaveral', 2, 0, TRUE),
('Inter Valdemoro', '2024-03-22 11:00:00', 'Estadio Valdemoro', 3, 1, TRUE),
('Atlético Sur', '2024-03-29 09:45:00', 'Polideportivo Cañaveral', 4, 1, TRUE),

-- Próximos partidos
('CD Móstoles', '2024-04-20 12:00:00', 'Polideportivo Cañaveral', 0, 0, FALSE),
('Leganés B', '2024-04-27 10:00:00', 'Anexo Butarque', 0, 0, FALSE),
('Getafe City', '2024-05-04 11:30:00', 'Polideportivo Cañaveral', 0, 0, FALSE),
('Fuenlabrada Promesas', '2024-05-11 16:00:00', 'Ciudad Deportiva Fuenlabrada', 0, 0, FALSE),
('Alcorcón Academy', '2024-05-18 10:30:00', 'Polideportivo Cañaveral', 0, 0, FALSE),
('Real Aranjuez', '2024-05-25 18:00:00', 'Estadio El Deleite', 0, 0, FALSE);

-- Insertamos la plantilla vinculada al equipo con ID 1 (FC Cañaveral)
INSERT INTO players (nombre, posicion, dorsal, team_id, goles, asistencias, amarillas, rojas) VALUES 
('David García', 'Portero', 1, 1, 0, 0, 1, 0),
('Sergio Ramos Jr.', 'Defensa', 4, 1, 1, 0, 3, 1),
('Iván López', 'Defensa', 2, 1, 0, 4, 2, 0),
('Carlos Hierro', 'Defensa', 5, 1, 2, 1, 4, 0),
('Miguel Aranda', 'Defensa', 3, 1, 0, 2, 1, 0),
('Lucas Modric', 'Centrocampista', 10, 1, 3, 8, 2, 0),
('Marcos Ruíz', 'Centrocampista', 6, 1, 1, 2, 5, 0),
('Dani Parejo', 'Centrocampista', 8, 1, 4, 5, 1, 0),
('Raúl González (C)', 'Delantero', 7, 1, 12, 3, 0, 0),
('Kevin De Bruyne', 'Delantero', 11, 1, 6, 9, 1, 0),
('Álvaro Morata', 'Delantero', 17, 1, 8, 2, 2, 0),

-- Suplentes y Rotación
('Iker Casillas II', 'Portero', 13, 1, 0, 0, 0, 0),
('Jorge Molina', 'Delantero', 19, 1, 5, 1, 0, 0),
('Santi Cazorla Jr.', 'Centrocampista', 21, 1, 2, 4, 0, 0),
('Pepe', 'Defensa', 15, 1, 0, 0, 6, 2),
('Luis Figo del Sur', 'Delantero', 20, 1, 1, 3, 1, 0),
('Andrés Mago', 'Centrocampista', 16, 1, 0, 5, 0, 0),
('Borja Iglesias', 'Delantero', 9, 1, 3, 0, 1, 0),
('Nacho', 'Defensa', 12, 1, 1, 1, 2, 0),
('Gavi', 'Defensa', 18, 1, 2, 2, 4, 0);