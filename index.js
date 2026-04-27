const express = require('express');

const app = express();
app.use(express.json());

require("dotenv").config();                                                        
  const { Pool } = require("pg");                                                                        
                                               
  const connectionString = process.env.DATABASE_URL;                                 
  if (!connectionString) {                     
    throw new Error("Falta DATABASE_URL en el entorno (.env o variables del hosting)");                  
  }                                                                                                      
                                                                                                         
  const needsSSL = /sslmode=require/.test(connectionString);                                             
                                                                                     
  const pool = new Pool({                                                                                
    connectionString,                          
    ssl: needsSSL ? { rejectUnauthorized: false } : false,                                               
  });

// Ruta principal
app.get('/', (req, res) => {
  res.send('Hola mundo desde Express 🚀 Fiesta!!!');
});

// Ruta de prueba para verificar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as ahora;');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No puedo conectar con la base de datos' });
  }
});

// Ruta para obtener categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre FROM categorias ORDER BY nombre;'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Ruta para obtener todos los recursos
app.get('/api/recursos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_recurso, nombre, descripcion, enlace, categoria_id, latitud, longitud
       FROM recursos
       ORDER BY id_recurso;`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener recursos' });
  }
});

// Ruta para obtener los recursos de una categoría concreta
app.get('/api/categorias/:id/recursos', async (req, res) => {
  try {
    const idCategoria = parseInt(req.params.id, 10);

    if (Number.isNaN(idCategoria)) {
      return res.status(400).json({ error: 'El id de categoría no es válido' });
    }

    const result = await pool.query(
      `SELECT id_recurso, nombre, descripcion, enlace, categoria_id, latitud, longitud
       FROM recursos
       WHERE categoria_id = $1
       ORDER BY id_recurso;`,
      [idCategoria]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener recursos por categoría' });
  }
});

// Crear una categoría
app.post('/api/categorias', async (req, res) => {
  try {
    const { nombre } = req.body || {};

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const nombreLimpio = nombre.trim();

    const result = await pool.query(
      'INSERT INTO categorias(nombre) VALUES ($1) RETURNING id, nombre;',
      [nombreLimpio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'La categoría ya existe' });
    }

    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// Actualizar una categoría
app.put('/api/categorias/:id', async (req, res) => {
  try {
    const idCategoria = parseInt(req.params.id, 10);

    if (Number.isNaN(idCategoria)) {
      return res.status(400).json({ error: 'El id de categoría no es válido' });
    }

    const { nombre } = req.body || {};

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const nombreLimpio = nombre.trim();

    const result = await pool.query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING id, nombre;',
      [nombreLimpio, idCategoria]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'La categoría ya existe' });
    }

    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// Borrar una categoría
app.delete('/api/categorias/:id', async (req, res) => {
  try {
    const idCategoria = parseInt(req.params.id, 10);

    if (Number.isNaN(idCategoria)) {
      return res.status(400).json({ error: 'El id de categoría no es válido' });
    }

    const result = await pool.query(
      'DELETE FROM categorias WHERE id = $1;',
      [idCategoria]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error(error);

    if (error.code === '23503') {
      return res.status(400).json({ error: 'No se puede borrar: hay recursos en esta categoría' });
    }

    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// Crear un recurso
app.post('/api/recursos', async (req, res) => {
  try {
    const { nombre, descripcion, enlace, categoria_id, latitud, longitud } = req.body || {};

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    if (!categoria_id) {
      return res.status(400).json({ error: 'categoria_id es obligatorio' });
    }

    if (enlace && !(enlace.startsWith('http://') || enlace.startsWith('https://'))) {
      return res.status(400).json({ error: 'El enlace debe empezar por http:// o https://' });
    }

    const categoriaIdNum = parseInt(categoria_id, 10);
    if (Number.isNaN(categoriaIdNum)) {
      return res.status(400).json({ error: 'categoria_id debe ser un número' });
    }

    const latitudNum = latitud !== undefined && latitud !== null && latitud !== ''
      ? parseFloat(latitud)
      : null;

    const longitudNum = longitud !== undefined && longitud !== null && longitud !== ''
      ? parseFloat(longitud)
      : null;

    const result = await pool.query(
      `INSERT INTO recursos(nombre, descripcion, enlace, categoria_id, latitud, longitud)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_recurso, nombre, descripcion, enlace, categoria_id, latitud, longitud;`,
      [nombre.trim(), descripcion || null, enlace || null, categoriaIdNum, latitudNum, longitudNum]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23503') {
      return res.status(400).json({ error: 'La categoria_id no existe' });
    }

    res.status(500).json({ error: 'Error al crear recurso' });
  }
});

// Actualizar un recurso
app.put('/api/recursos/:id', async (req, res) => {
  try {
    const idRecurso = parseInt(req.params.id, 10);

    if (Number.isNaN(idRecurso)) {
      return res.status(400).json({ error: 'El id del recurso no es válido' });
    }

    const { nombre, descripcion, enlace, categoria_id, latitud, longitud } = req.body || {};

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const categoriaIdNum = parseInt(categoria_id, 10);
    if (Number.isNaN(categoriaIdNum)) {
      return res.status(400).json({ error: 'categoria_id debe ser un número' });
    }

    if (enlace && !(enlace.startsWith('http://') || enlace.startsWith('https://'))) {
      return res.status(400).json({ error: 'El enlace debe empezar por http:// o https://' });
    }

    const descripcionLimpia =
      descripcion && descripcion.trim().length > 0 ? descripcion.trim() : null;

    const latitudNum = latitud !== undefined && latitud !== null && latitud !== ''
      ? parseFloat(latitud)
      : null;

    const longitudNum = longitud !== undefined && longitud !== null && longitud !== ''
      ? parseFloat(longitud)
      : null;

    const result = await pool.query(
      `UPDATE recursos
       SET nombre = $1, descripcion = $2, enlace = $3, categoria_id = $4, latitud = $5, longitud = $6
       WHERE id_recurso = $7
       RETURNING id_recurso, nombre, descripcion, enlace, categoria_id, latitud, longitud;`,
      [nombre.trim(), descripcionLimpia, enlace || null, categoriaIdNum, latitudNum, longitudNum, idRecurso]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === '23503') {
      return res.status(400).json({ error: 'La categoria_id no existe' });
    }

    res.status(500).json({ error: 'Error al actualizar recurso' });
  }
});

// Borrar un recurso
app.delete('/api/recursos/:id', async (req, res) => {
  try {
    const idRecurso = parseInt(req.params.id, 10);

    if (Number.isNaN(idRecurso)) {
      return res.status(400).json({ error: 'El id del recurso no es válido' });
    }

    const result = await pool.query(
      'DELETE FROM recursos WHERE id_recurso = $1;',
      [idRecurso]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    res.json({ message: 'Recurso eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar recurso' });
  }
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});