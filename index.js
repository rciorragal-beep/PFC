const express = require('express');
const { Pool } = require("pg");
const app = express();
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "123456",
  database: "PFC"
});
//Ruta principal
app.get('/', (req, res) => {
  res.send('Hola mundo desde Express 🚀 Fiesta!!!');
});
//Ruta de prueba para verificar la conexión a la base de datos
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as ahora;");
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No puedo conectar con la base de datos" });
  }
});
//Ruta para obtener categorías
app.get("/api/categorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre FROM categorias ORDER BY nombre;"
);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});
//Ruta para obtener recursos
app.get("/api/recursos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_recurso, nombre, descripcion, enlace, categoria_id FROM recursos ORDER BY id_recurso;"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener recursos" });
  }
});
//Recursos de una categoría concreta
app.get("/api/categorias/:id/recursos", async (req, res) => {
  try {
    const idCategoria = parseInt(req.params.id, 10);

    if (Number.isNaN(idCategoria)) {
      return res.status(400).json({ error: "El id de categoría no es válido" });
    }

    const result = await pool.query(
      "SELECT id_recurso, nombre, descripcion, enlace, categoria_id FROM recursos WHERE categoria_id = $1 ORDER BY id_recurso;",
      [idCategoria]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener recursos por categoría" });
  }
});

//Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});

