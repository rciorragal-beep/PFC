const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hola mundo desde Express 🚀 Fiesta!!!');
});

app.listen(3004, () => {
  console.log('Servidor en http://localhost:3004');
});

