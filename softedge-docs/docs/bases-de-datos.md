# Bases de Datos de SoftEdge

En el proyecto SoftEdge utilizamos dos tipos de bases de datos para satisfacer diferentes necesidades:

- **Base de datos relacional (MySQL)** para usuarios, proyectos y tareas.
- **Base de datos no relacional (Firebase Firestore)** para almacenar las respuestas de la IA de generación de requerimientos.

---

## Base de Datos Relacional (MySQL)

### Modelo Lógico de Datos

El modelo lógico está orientado a gestionar:

- Usuarios
- Proyectos
- Tareas
- Relación entre usuarios y proyectos

### Diagrama Entidad-Relación (E-R)

![Diagrama E-R SoftEdge](/img/diagrama-er-softedge.png)

> *Nota: El diagrama E-R debe colocarse en la carpeta `static/img/` con el nombre `diagrama-er-softedge.png`.*

---

### Script SQL de Creación

El siguiente script crea las tablas principales del sistema:

```sql
CREATE TABLE Usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  rol ENUM('Product Owner', 'Developer', 'QA Engineer', 'Project Manager') NOT NULL
);

CREATE TABLE Proyectos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario INT,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id)
);

CREATE TABLE Tareas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado ENUM('Pendiente', 'En Progreso', 'Completado') DEFAULT 'Pendiente',
  prioridad ENUM('Baja', 'Media', 'Alta', 'Crítica') DEFAULT 'Media',
  id_proyecto INT,
  FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id)
);

```

## Base de Datos No Relacional (Firebase Firestore)

Utilizamos Firebase Firestore para almacenar las salidas generadas por la IA, tales como:

- Requerimientos funcionales y no funcionales.
- Historias de usuario y épicas generadas automáticamente.
- Casos de prueba asociados a las historias.

### Estructura de los Documentos en Firestore

- **Colección:** `respuestasIA`
  - **Documento:** ID generado automáticamente
    - `promptUsuario`: Texto del prompt que ingresó el usuario.
    - `requerimientosGenerados`: JSON con los requerimientos generados.
    - `historiasUsuario`: JSON con las historias generadas.
    - `fechaGeneracion`: Timestamp de la creación.

### Diagrama de Firestore

![Diagrama Firestore SoftEdge](/img/diagrama-firestore-softedge.png)

> *Nota: También coloca el diagrama sencillo de Firestore en la carpeta `static/img/` como `diagrama-firestore-softedge.png`.*

### Consideraciones

- La base no relacional permite almacenar información generada dinámicamente de forma flexible.
- Se optimiza la escalabilidad y la adaptación a los cambios en los requerimientos generados por IA.