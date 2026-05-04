//Base de datos Buen Camino
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE recursos (
    id_recurso SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    enlace TEXT,
    categoria_id INT NOT NULL REFERENCES categorias(id),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION
);
