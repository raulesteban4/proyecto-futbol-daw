-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS proyecto_futbol;
USE proyecto_futbol;

-- 2. ELIMINACIÓN DE TABLAS (Por si quieres ejecutar el script de cero)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. CREACIÓN DE TABLAS

-- Tabla de Equipos
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    escudo_url VARCHAR(255),
    liga VARCHAR(100)
);

-- Tabla de Usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol ENUM('admin', 'user') DEFAULT 'user',
    direccion TEXT
);

-- Tabla de Jugadores
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    posicion VARCHAR(50),
    dorsal INT,
    team_id INT,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Tabla de Productos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    imagen_url VARCHAR(255),
    categoria VARCHAR(50)
);

-- Tabla de Pedidos
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado ENUM('pendiente', 'pagado', 'enviado') DEFAULT 'pendiente',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de detalles de los pedidos

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    cantidad INT,
    precio_unitario DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 4. DATOS DE EJEMPLO (Para que la web tenga contenido inicial)

-- Insertar un equipo
INSERT INTO teams (nombre, escudo_url, liga) 
VALUES ('FC Cañaveral', 'https://via.placeholder.com/150', 'Liga Local');

-- Insertar jugadores iniciales (Asumiendo que el equipo tiene ID 1)
INSERT INTO players (nombre, posicion, dorsal, team_id) VALUES 
('Luka Modric', 'Centrocampista', 10, 1),
('Vinicius Jr', 'Delantero', 7, 1),
('Thibaut Courtois', 'Portero', 1, 1);

-- Insertar productos para la tienda
INSERT INTO products (nombre, descripcion, precio, stock, categoria) VALUES 
('Camiseta Oficial', 'Equipación local 2026', 75.00, 50, 'Ropa'),
('Balón de Entrenamiento', 'Resistente para césped artificial', 25.00, 20, 'Accesorios'),
('Bufanda del Club', '100% acrílico, colores oficiales', 15.50, 100, 'Merchandising');

INSERT INTO users (username, password, email, rol) VALUES ('Raul', '1234', 'raul@test.com', 'admin');