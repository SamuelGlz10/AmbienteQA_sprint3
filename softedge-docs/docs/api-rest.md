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

## Ejemplo de Cabecera de Autorización

Para acceder a endpoints protegidos, el cliente debe incluir el siguiente header en sus solicitudes HTTP:

```plaintext
Authorization: Bearer \<token\>
```

---

## Detalle de Endpoints

### /auth/login

- **Método:** POST
- **Descripción:** Autentica al usuario y devuelve un token JWT.
- **Parámetros de entrada:**
  - Headers:
    - Content-Type: application/json
  - Body:
    ```json
    {
      "correo": "usuario@ejemplo.com",
      "contrasena": "password123"
    }
    ```
- **Response esperado:**
  ```json
  {
    "token": "jwt_token_generado"
  }
  ```

### /auth/register

- **Método:** POST
- **Descripción:** Registra un nuevo usuario.
- **Parámetros de entrada:**
  - Headers:
    - Content-Type: application/json
  - Body:
    ```json
    {
      "nombre": "Nombre del Usuario",
      "correo": "correo@ejemplo.com",
      "contrasena": "password123",
      "rol": "Developer"
    }
    ```
- **Response esperado:**
  ```json
  {
    "message": "Usuario registrado exitosamente",
    "usuario": {
      "id": 1,
      "nombre": "Nombre del Usuario",
      "correo": "correo@ejemplo.com",
      "rol": "Developer"
    }
  }
  ```

### /projects/

- **Método:** GET
- **Descripción:** Obtiene todos los proyectos del usuario autenticado.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
- **Response esperado:**
  ```json
  [
    {
      "id": 1,
      "nombre": "Proyecto 1",
      "descripcion": "Descripción del proyecto",
      "fecha_creacion": "2025-04-27T12:00:00.000Z"
    }
  ]
  ```

- **Método:** POST
- **Descripción:** Crea un nuevo proyecto.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
    - Content-Type: application/json
  - Body:
    ```json
    {
      "nombre": "Nuevo Proyecto",
      "descripcion": "Descripción del proyecto"
    }
    ```
- **Response esperado:**
  ```json
  {
    "message": "Proyecto creado exitosamente",
    "proyecto": {
      "id": 1,
      "nombre": "Nuevo Proyecto",
      "descripcion": "Descripción del proyecto",
      "fecha_creacion": "2025-04-27T12:00:00.000Z"
    }
  }
  ```

### /projects/:id

- **Método:** PUT
- **Descripción:** Actualiza un proyecto existente.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
    - Content-Type: application/json
  - URL Params:
    - id: ID del proyecto
  - Body:
    ```json
    {
      "nombre": "Nombre actualizado",
      "descripcion": "Descripción actualizada"
    }
    ```
- **Response esperado:**
  ```json
  {
    "message": "Proyecto actualizado exitosamente"
  }
  ```

- **Método:** DELETE
- **Descripción:** Elimina un proyecto existente.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
  - URL Params:
    - id: ID del proyecto
- **Response esperado:**
  ```json
  {
    "message": "Proyecto eliminado exitosamente"
  }
  ```

### /tasks/:projectId

- **Método:** GET
- **Descripción:** Obtiene tareas asociadas a un proyecto específico.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
  - URL Params:
    - projectId: ID del proyecto
- **Response esperado:**
  ```json
  [
    {
      "id": 1,
      "titulo": "Tarea 1",
      "descripcion": "Descripción de tarea",
      "estado": "Pendiente",
      "prioridad": "Alta"
    }
  ]
  ```

### /tasks/

- **Método:** POST
- **Descripción:** Crea una nueva tarea.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
    - Content-Type: application/json
  - Body:
    ```json
    {
      "titulo": "Nueva tarea",
      "descripcion": "Descripción de la tarea",
      "id_proyecto": 1
    }
    ```
- **Response esperado:**
  ```json
  {
    "message": "Tarea creada exitosamente",
    "tarea": {
      "id": 1,
      "titulo": "Nueva tarea",
      "descripcion": "Descripción de la tarea",
      "estado": "Pendiente",
      "prioridad": "Media"
    }
  }
  ```

### /ai/generate

- **Método:** POST
- **Descripción:** Envía un prompt a la IA y guarda los requerimientos generados.
- **Parámetros de entrada:**
  - Headers:
    - Authorization: Bearer \<token\>
    - Content-Type: application/json
  - Body:
    ```json
    {
      "promptUsuario": "Descripción general del proyecto para generar requerimientos"
    }
    ```
- **Response esperado:**
  ```json
  {
    "message": "Requerimientos generados exitosamente",
    "data": {
      "requerimientos": [...],
      "historiasUsuario": [...]
    }
  }
  ```

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

### Creación de Proyecto

**Request:**

```json
POST /projects/
Authorization: Bearer \<token\>
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