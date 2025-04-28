# Stack Tecnológico y Arquitectura de SoftEdge

## Stack Tecnológico

| Componente | Tecnología |
|:---|:---|
| Frontend | React.js |
| Backend | Node.js (Express.js) |
| Base de Datos Relacional | MySQL (Azure SQL Server) |
| Base de Datos No Relacional | Firebase Firestore |
| Autenticación | JSON Web Tokens (JWT) |
| Hosting Frontend | Vercel |
| Hosting Backend | Vercel / Azure |
| Documentación Técnica | Docusaurus |

---

## Arquitectura General

La arquitectura de SoftEdge se divide en dos grandes componentes principales:

- **Frontend (React.js):** 
  - Se encarga de la interacción con el usuario.
  - Consume la API expuesta por el Backend.
  - Gestiona el login, la creación de proyectos, y la visualización de requerimientos generados por la IA.

- **Backend (Node.js + Express):**
  - Gestiona la autenticación de usuarios mediante JWT.
  - Expone un API REST para la administración de usuarios, proyectos, y tareas.
  - Interactúa con dos bases de datos:
    - **MySQL** para la gestión de usuarios, proyectos y tareas.
    - **Firebase Firestore** para almacenar las respuestas generadas por la IA.

---

## Diagrama de Arquitectura

![Diagrama de Arquitectura de SoftEdge](/img/diagrama-arquitectura-softedge.png)

> *Nota: Debes colocar el diagrama en la carpeta `static/img/` y asegurarte que se llame `diagrama-arquitectura-softedge.png`.*

---

## Flujo de Funcionamiento

1. **Login de usuario:**
   - El usuario ingresa sus credenciales en el Frontend.
   - Se envía una solicitud al Backend para validar y generar un Token JWT.

2. **Creación de proyectos:**
   - El usuario puede crear nuevos proyectos desde el Frontend.
   - El proyecto se almacena en la base de datos relacional (MySQL).

3. **Generación de requerimientos IA:**
   - El usuario proporciona un prompt describiendo su proyecto.
   - El Backend envía el prompt a un servicio de IA.
   - Se reciben requerimientos funcionales, no funcionales, historias de usuario y épicas.
   - La respuesta de la IA se almacena en Firebase Firestore.

4. **Visualización y gestión de proyectos:**
   - El usuario puede visualizar, editar y administrar sus proyectos y tareas.

---

## Consideraciones de Seguridad

- Autenticación mediante **JSON Web Tokens (JWT)**.
- Cifrado de contraseñas y manejo seguro de sesiones.
- Protección de rutas en Backend mediante middleware de autenticación.

---