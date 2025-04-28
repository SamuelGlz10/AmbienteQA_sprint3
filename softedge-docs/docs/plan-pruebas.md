# Plan de Pruebas - SoftEdge

El plan de pruebas de SoftEdge tiene como objetivo asegurar la calidad del software a través de diferentes niveles de validación, abarcando tanto aspectos funcionales como no funcionales del sistema.

---

## Estrategia de Pruebas

La estrategia implementada en SoftEdge incluye los siguientes tipos de pruebas:

### Pruebas Funcionales

- **Pruebas Unitarias:** Verificación individual de componentes y funciones.
- **Pruebas de Integración:** Asegurar que los módulos interactúan correctamente entre sí.
- **Pruebas de Aceptación:** Validación de que las funcionalidades cumplen los requisitos establecidos.

### Pruebas No Funcionales

- **Pruebas de Compatibilidad:** Verificar funcionamiento en distintos navegadores.
- **Pruebas de Rendimiento:** Evaluar tiempos de respuesta y carga del sistema.
- **Pruebas de Seguridad:** Validar mecanismos de autenticación y protección de datos.
- **Pruebas de Caja Negra:** Validar el comportamiento del sistema sin conocer su estructura interna.

---

## Alcance de las Pruebas

El alcance del plan de pruebas incluye:

- **Incluido:**
  - Creación de proyectos.
  - Generación de historias de usuario y épicas usando IA.
  - Priorización y edición de tareas.
- **Excluido:**
  - Funcionalidad de Login en etapas iniciales (Sprint 1).
  - Exportación de datos (feature pendiente).

---

## Entregables

| Documento | Responsable | Entregable a |
|:---|:---|:---|
| Casos de prueba para pruebas de aceptación | Rodrigo González | Roberto Bustamante |
| Casos de prueba para pruebas de rendimiento | Samuel González | Roberto Bustamante |
| Reporte de defectos | Gerardo Leiva | Roberto Bustamante |
| Evaluación de pruebas de seguridad | María Castresana | Roberto Bustamante |

---

## Características a Ser Probadas

| Sprint | Característica | Descripción |
|:---|:---|:---|
| 1 | Creación de proyectos | Crear proyectos nuevos desde el dashboard. |
| 1 | Creación de historias de usuario y épicas | Generación de historias y épicas basadas en entrada del usuario. |
| 1 | Generación de nuevas épicas impulsadas por IA | Respuesta automatizada basada en prompts enviados. |

---

## Características No Probadas

| Sprint | Característica | Justificación |
|:---|:---|:---|
| 2 | Login | Se probó en etapas posteriores debido a dependencias de base de datos. |
| 2 | Exportación de datos | Funcionalidad fuera de prioridad inicial, prevista para iteraciones futuras. |

---

## Necesidades Ambientales

| Dispositivo | Sistema Operativo | Especificaciones | ¿Disponible? |
|:---|:---|:---|:---|
| Laptop Mac | macOS | 6GB RAM, 512GB SSD | Sí |
| Laptop Windows | Windows 11 | 48GB RAM, 2.5TB SSD | Sí |

---

## Capacitación del Equipo

| Instructor | Capacitación | Fecha Inicio | Fecha Fin | Duración |
|:---|:---|:---|:---|:---|
| Carlos Nolasco | Bases de Datos | 10 Feb 2025 | 14 Mar 2025 | 20 horas |
| Frumencio Olivas | Diseño Web | 10 Feb 2025 | 14 Mar 2025 | 20 horas |

---

## Principales Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Acción Correctiva |
|:---|:---|:---|:---|:---|
| 1 | Precisión de IA en requerimientos | Baja | Alto | Entrenar modelos IA constantemente. |
| 2 | Integración con APIs externas | Alta | Alto | Realizar pruebas de compatibilidad anticipadas. |

---

## Consideraciones Finales

- El plan de pruebas es un documento vivo que puede ajustarse conforme evolucionen los requerimientos del proyecto.
- Se priorizará la validación de funcionalidades críticas en sprints tempranos para detectar fallos tempranos.
- El equipo de desarrollo y QA trabajarán de manera colaborativa en la generación y ejecución de casos de prueba.

---