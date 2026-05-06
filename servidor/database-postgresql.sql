-- PostgreSQL Schema para Supabase (FC Cañaveral)
-- Ejecutar en el SQL Editor de Supabase

-- 1. LIMPIEZA TOTAL
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS ranking CASCADE;

-- 2. CREACIÓN DE TIPOS ENUM
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE order_status AS ENUM ('pendiente', 'pagado', 'enviado');

-- 3. CREACIÓN DE TABLAS
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    escudo_url VARCHAR(255),
    liga VARCHAR(100)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    rol user_role DEFAULT 'user',
    direccion TEXT
);

CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    posicion VARCHAR(50),
    dorsal INT,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    goles INT DEFAULT 0,
    asistencias INT DEFAULT 0,
    amarillas INT DEFAULT 0,
    rojas INT DEFAULT 0
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    imagen_url VARCHAR(255),
    categoria VARCHAR(50)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado order_status DEFAULT 'pendiente'
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    cantidad INT,
    precio_unitario DECIMAL(10, 2)
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    rival VARCHAR(100),
    fecha TIMESTAMP,
    ubicacion VARCHAR(100),
    goles_local INT DEFAULT 0,
    goles_visitante INT DEFAULT 0,
    jugado BOOLEAN DEFAULT FALSE
);

CREATE TABLE ranking (
    id SERIAL PRIMARY KEY,
    equipo VARCHAR(100) NOT NULL,
    pj INT DEFAULT 0,
    puntos INT DEFAULT 0,
    posicion INT
);

-- 4. DATOS DE PRUEBA
INSERT INTO teams (nombre, escudo_url, liga) VALUES ('FC Cañaveral', 'https://via.placeholder.com/150', 'Liga Local');

INSERT INTO users (username, password, email, rol) VALUES ('Raul', '1234', 'raul@test.com', 'admin');

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

INSERT INTO products (nombre, descripcion, precio, stock, categoria) VALUES 
('Camiseta Oficial', 'Equipación local 2026', 75.00, 50, 'Ropa'),
('Balón de Entrenamiento', 'Resistente para césped artificial', 25.00, 20, 'Accesorios'),
('Bufanda del Club', '100% acrílico, colores oficiales', 15.50, 100, 'Merchandising');

INSERT INTO matches (rival, fecha, ubicacion, goles_local, goles_visitante, jugado) VALUES 
('Rayo Alcorcón', '2024-03-15 10:30:00', 'Polideportivo Cañaveral', 2, 0, TRUE),
('Inter Valdemoro', '2024-03-22 11:00:00', 'Estadio Valdemoro', 3, 1, TRUE),
('Atlético Sur', '2024-03-29 09:45:00', 'Polideportivo Cañaveral', 4, 1, TRUE),
('CD Móstoles', '2024-04-20 12:00:00', 'Polideportivo Cañaveral', 0, 0, FALSE),
('Leganés B', '2024-04-27 10:00:00', 'Anexo Butarque', 0, 0, FALSE),
('Getafe City', '2024-05-04 11:30:00', 'Polideportivo Cañaveral', 0, 0, FALSE),
('Fuenlabrada Promesas', '2024-05-11 16:00:00', 'Ciudad Deportiva Fuenlabrada', 0, 0, FALSE),
('Alcorcón Academy', '2024-05-18 10:30:00', 'Polideportivo Cañaveral', 0, 0, FALSE),
('Real Aranjuez', '2024-05-25 18:00:00', 'Estadio El Deleite', 0, 0, FALSE);

INSERT INTO players (nombre, posicion, dorsal, team_id, goles, asistencias, amarillas, rojas) VALUES 
('Luka Modric', 'Centrocampista', 10, 1, 5, 12, 0, 0),
('Vinicius Jr', 'Delantero', 7, 1, 15, 8, 0, 0),
('Thibaut Courtois', 'Portero', 1, 1, 0, 0, 0, 0),
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
('Iker Casillas II', 'Portero', 13, 1, 0, 0, 0, 0),
('Jorge Molina', 'Delantero', 19, 1, 5, 1, 0, 0),
('Santi Cazorla Jr.', 'Centrocampista', 21, 1, 2, 4, 0, 0),
('Pepe', 'Defensa', 15, 1, 0, 0, 6, 2),
('Luis Figo del Sur', 'Delantero', 20, 1, 1, 3, 1, 0),
('Andrés Mago', 'Centrocampista', 16, 1, 0, 5, 0, 0),
('Borja Iglesias', 'Delantero', 9, 1, 3, 0, 1, 0),
('Nacho', 'Defensa', 12, 1, 1, 1, 2, 0),
('Gavi', 'Defensa', 18, 1, 2, 2, 4, 0);
