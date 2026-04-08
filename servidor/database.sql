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

-- Datos para que la tabla de clasificación no esté vacía
INSERT INTO ranking (equipo, pj, puntos, posicion) VALUES 
('FC Cañaveral', 10, 25, 1),
('Rival FC', 10, 22, 2),
('Barrio Unido', 10, 18, 3);