# Cómo hacer cambios en la configuración

1. Crear una rama nueva

Desde la terminal, estando en la raíz de tu proyecto, escribe:

```bash
git checkout -b config/<nombre-del-cambio>

git add config/<archivo-editado>.json
git commit -m "Descripción del cambio"
git push origin config/<nombre-del-cambio>

Hacer un Pull Request
