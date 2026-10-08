## Proyecto API RestFull: "HelpDeskInterno-Funval"

### Instalación
1.- Clonar el repositorio en un carpeta local 
    `https://github.com/ademirjgf/Help_desk_interno-funval-1`
2.- Instalar todas las dependencias del proyecto
    `pnpm install`
3.- Actualizar la contraseña de PostGresql y otros en el archivo `.env`
    con el ejemplo de `.env.example`
4.- Migrar/Crear la Base de Datos en Postgresql
    `pnpm prisma migrate dev --name init`
5.- Generar todas las variables y recursos de Prisma para el proyecto
    `pnpm prisma generate`
6.- Agregar data de testing en la base de datos creada (opcional)
    `pnpm run start:seed`
7.- Levantar el servidor backend de forma local
    `pnpm run start:dev`
8.- Probar los endpoints del proyecto y ver la documentación de forma local
    `http://localhost:3000/api/docs/`

### US-18 — Notificaciones en tiempo real

Para las notificaciones del sistema, el equipo eligió utilizar **WebSockets mediante Socket.IO** en lugar de correo electrónico con Nodemailer.

#### ¿Por qué WebSockets / Socket.IO?

Se eligió esta tecnología porque las notificaciones deben llegar al usuario **en tiempo real**, sin que tenga que actualizar manualmente la página o realizar consultas periódicas al servidor.

Las principales razones fueron:

- Permite comunicación bidireccional y en tiempo real entre el backend y los clientes.
- Las notificaciones se envían inmediatamente cuando se genera un nuevo evento.
- Evita realizar consultas repetitivas al servidor mediante polling.
- Socket.IO facilita la gestión de conexiones y eventos dentro de NestJS.
- Permite enviar las notificaciones únicamente al usuario correspondiente mediante salas (`rooms`).

#### Implementación

El sistema utiliza el namespace:

`/notificaciones`

El cliente se registra mediante el evento:

`registrarUsuario`

enviando su identificador de usuario. El servidor lo incorpora a una sala específica:

`usuario:<idUsuario>`

Cuando se genera una nueva notificación, el backend emite el evento:

`nuevaNotificacion`

únicamente a la sala correspondiente al usuario destinatario.

#### Correo electrónico

No se utiliza Nodemailer ni un proveedor de correo electrónico para las notificaciones, por lo que **no se requieren credenciales SMTP ni variables de entorno relacionadas con correo electrónico**.


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
        `git commit -m 'feat(auth): add google login button'`
        (Agrega el botón de inicio de sesión con Google en el módulo de autenticación)
      - fix (Corrección de un error):
        `git commit -m 'fix(api): resolve memory leak on user checkout'`
        (Resuelve una fuga de memoria en la pasarela de pago del usuario)
      - docs (Documentación):
        `git commit -m 'docs(readme): update installation instructions for docker'`
        (Actualiza las instrucciones de instalación en el archivo README)
      - style (Formato y estilo visual o de código):
        `git commit -m 'style(navbar): fix padding and alignment on mobile layout'`
        (Corrige el espaciado y alineación de la barra de navegación en móviles)
      - refactor (Mejora de código sin cambiar su comportamiento):
        `git commit -m 'refactor(users): simplify password validation logic'`
        (Simplifica la lógica para validar contraseñas)

