## Proyecto API RestFull: "HelpDeskInterno-Funval"

### Integrantes y Responsabilidades:
  ----------------------------------------------------------------------------------
  |        COLABORADOR                  |                   MODULO                 |
  ----------------------------------------------------------------------------------
  | Ademir Jesus Gomez Fuentes          |                Notificacion              |
  | David Gerardo Nuñez Rojas           |               Tarea, Categoria           |
  | Neils Sergio Alanoca Ticona         |                 Comentario               |
  | Manuel Charles Mitacc Quilcaro      |                Usuario(Auth)             |
  ----------------------------------------------------------------------------------

### Tablero SCRUM Grupal con Trello:
    `https://trello.com/b/NAsfWvLs/scrum-funval-grupo`  

### Nomenclatura para el proyecto:
1.- Ramas, se nombraran con el nombre de pila del colaborador, más '/', más descripción corta.
    Ejemplo: `manuel/usuario-auth`
2.- Commits: (sin punto final y a lo más 72 carácteres)
    - Formato Completo Commit: <tipo>(<ámbito opcional>): <descripción>
    - <tipo>: 
      - feat: Una nueva característica o funcionalidad.
      - fix: Una corrección de un error (bug).
      - docs: Cambios exclusivos en la documentación.
      - style: Cambios que no afectan el significado del código (espacios, formato, punto y coma).
      - refactor: Reestructuración del código que no corrige errores ni añade funciones.
      - perf: Cambios que mejoran el rendimiento.
      - test: Agregar o corregir pruebas unitarias.
      - chore: Tareas de mantenimiento, actualización de dependencias o configuraciones.
    - Ejemplos: 
      - feat (Nueva funcionalidad):
        `git commit -m feat(auth): add google login button`
        (Agrega el botón de inicio de sesión con Google en el módulo de autenticación)
      - fix (Corrección de un error):
        `git commit -m fix(api): resolve memory leak on user checkout`
        (Resuelve una fuga de memoria en la pasarela de pago del usuario)
      - docs (Documentación):
        `git commit -m docs(readme): update installation instructions for docker`
        (Actualiza las instrucciones de instalación en el archivo README)
      - style (Formato y estilo visual o de código):
        `git commit -m style(navbar): fix padding and alignment on mobile layout`
        (Corrige el espaciado y alineación de la barra de navegación en móviles)
      - refactor (Mejora de código sin cambiar su comportamiento):
        `git commit -m refactor(users): simplify password validation logic`
        (Simplifica la lógica para validar contraseñas)

