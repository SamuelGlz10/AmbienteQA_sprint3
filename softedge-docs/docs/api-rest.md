# Documentación de la API REST - SoftEdge

La API REST de SoftEdge permite la comunicación segura entre el Frontend (React.js) y el Backend (Node.js + Express).  
Facilita la autenticación de usuarios, la gestión de proyectos, tareas y la conexión con la IA generadora de requerimientos.

---

## Tecnologías Utilizadas

- **Framework Backend:** Node.js + Express.js
- **Base de datos relacional:** MySQL (Azure SQL)
- **Base de datos no relacional:** Firebase Firestore
- **Autenticación:** JSON Web Tokens (JWT)
- **Servidor:** Desplegado en Vercel / Azure

---

## URL Base del API
https://softedge-back.vercel.app/api/

---

## Tipo de Autenticación

- **Método:** JSON Web Token (JWT)
- **Cabecera requerida en endpoints protegidos:**


| Método | URL | Descripción |
|:---|:---|:---|
| POST | /auth/login | Autentica un usuario y devuelve un JWT
| POST | /auth/register | Registra un nuevo usuario
| GET | /projects/ | Obtiene todos los proyectos del usuario autenticado
| POST | /projects/ | Crea un nuevo proyecto
| PUT | /projects/:id |Actualiza un proyecto existente
| DELETE | /projects/:id | Elimina un proyecto
| GET | /tasks/:projectId | Obtiene tareas de un proyecto especí­fico
| POST | /tasks/ | Crea una nueva tarea dentro de un proyecto
| PUT | /tasks/:id | Actualiza una tarea
| DELETE | /tasks/:id | Elimina una tarea
| POST | /ai/generate | Enví­a un prompt a la IA y almacena la respuesta

---


## Ejemplos de Requests y Responses

### Login de Usuario

**Request:**

```json
POST /auth/login
Content-Type: application/json

{
  "correo": "usuario@ejemplo.com",
  "contrasena": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Creación de Usuario

**Request:**

```json
POST /projects/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nuevo Proyecto",
  "descripcion": "Este es un proyecto de prueba."
}
```

**Response:**

```json
{
  "message": "Proyecto creado exitosamente",
  "proyecto": {
    "id": 1,
    "nombre": "Nuevo Proyecto",
    "descripcion": "Este es un proyecto de prueba",
    "fecha_creacion": "2025-04-27T12:00:00.000Z"
  }
}
```