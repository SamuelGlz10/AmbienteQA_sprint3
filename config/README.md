# Configuración del Proyecto SoftEdge

## 📄 Formato
Los archivos de configuración están escritos en formato **JSON**, siguiendo una estructura clara y estandarizada.

## 📁 Archivos de Configuración

- `development.json`: Ambiente de desarrollo local.
- `staging.json`: Ambiente de pruebas previo al despliegue.
- `production.json`: Configuración final para ambiente productivo.

## ⚙️ Parámetros definidos

| Clave               | Descripción                                                  |
|---------------------|--------------------------------------------------------------|
| BACK_PORT           | Puerto local o URL del backend (solo en development) |
| AZURE_SQL_SERVER    | Dirección del servidor SQL (Azure)                           |
| AZURE_SQL_DATABASE  | Nombre de la base de datos                                   |
| AZURE_SQL_PORT      | Puerto del servidor SQL (default: 1433)                      |
| AZURE_SQL_USER      | Usuario de la base de datos                                  |
| AZURE_SQL_PASSWORD  | Contraseña del usuario                                       |

## 🧠 Convenciones

- Las claves están escritas en **mayúsculas** con estilo **snake_case**.
- Los valores string van entre **comillas dobles** `"valor"`, los números no.
- Cada línea clave-valor termina con coma, excepto la última.

---
