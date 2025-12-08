CREATE DATABASE IF NOT EXISTS libreria;
USE libreria;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, email, password)
VALUES
('Juan Pérez', 'juan@example.com', '1234'),
('María López', 'maria@example.com', 'abcd');

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

INSERT INTO categorias (nombre)
VALUES
('Ficción'),
('Ciencia Ficción'),
('Infantil'),
('Romance'),
('Realismo Mágico'),
('Clásicos');

CREATE TABLE libros (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(120) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    stock INT DEFAULT 1,
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Cambiar 'principito.jpg' por 'el_principito.jpg'
INSERT INTO libros (titulo, autor, descripcion, imagen, stock, id_categoria)
VALUES
('El Principito', 'Antoine de Saint-Exupéry', 'Historia clásica...', 'el_principito.jpg', 3, 3),
('1984', 'George Orwell', 'Novela distópica sobre un régimen totalitario.', '1984.jpg', 5, 2),
('Cien Años de Soledad', 'Gabriel García Márquez', 'La obra maestra del realismo mágico.', 'soledad.jpg', 2, 5);

CREATE TABLE reservaciones (
    id_reservacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_libro INT NOT NULL,
    fecha_reservacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_limite DATE,
    estado ENUM('pendiente', 'recogido', 'cancelado') DEFAULT 'pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id_libro) REFERENCES libros(id_libro)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

INSERT INTO reservaciones (id_usuario, id_libro, fecha_limite, estado)
VALUES
(1, 1, '2025-12-20', 'pendiente'),
(2, 3, '2025-12-25', 'pendiente');

ALTER TABLE usuarios
ADD tipo ENUM('admin', 'usuario') DEFAULT 'usuario';

select * from libros;
select * from usuarios;
select * from reservaciones;
select * from categorias;