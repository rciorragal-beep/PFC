# Buen Camino - Backend

Este repositorio incluye el backend del proyecto Buen Camino, el cual fue diseñado como parte del Proyecto Final del Ciclo.
El desarrollo del backend se ha llevado a cabo utilizando Node.js y Express, ofreciendo una API REST que permite la consulta de las categorías y los recursos empleados por la aplicación Android.

## Tecnologías empleadas

- Node.js
- Express
- PostgreSQL
- Neon
- Railway
- dotenv, para gestionar variables de entorno
- pg, para conectar NOde.js con PostgreSQL

## Endpoints principales

Entre los endpoints que se han puesto en marcha se encuentran:

### Categorías

- GET /api/categorias
- POST /api/categorias
- PUT /api/categorias/:id
- DELETE /api/categorias/:id

### Recursos

- GET /api/recursos
- GET /api/categorias/:id/recursos
- POST /api/recursos
- PUT /api/recursos/:id
- DELETE /api/recursos/:id

### Prueba de conexión

- GET /test-db

## Base de datos

La base de datos empleada es PostgreSQL y está localizada en Neon.

El backend establece su conexión con la base de datos a través de una variable de entorno conocida como DATABASE_URL.

Para garantizar la seguridad, no se incorpora el archivo .env en el repositorio.

## Despliegue

El backend se encuentra alojado en Railway, lo que permite que la aplicación de Android acceda a la API a través de una URL accesible públicamente.

## Proyecto relacionado

Repositorio de la aplicación para Android:

https://github.com/rciorragal-beep/BuenCamino-Android
