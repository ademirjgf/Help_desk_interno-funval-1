Sistema backend centralizado para la gestión de solicitudes, incidencias y requerimientos de soporte interno.

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Criterios y Decisiones de Negocio](#-criterios-y-decisiones-de-negocio)
- [Instalación y Cómo levantar el proyecto](#-instalación-y-cómo-levantar-el-proyecto)
- [US-18 — Notificaciones en tiempo real](#us-18--notificaciones-en-tiempo-real)
- [Indicaciones para el Frontend (Futuro)](#-indicaciones-para-el-frontend-futuro)
- [Integrantes y Responsabilidades](#-integrantes-y-responsabilidades)
- [Gestión del Proyecto y Flujo de Git](#-gestión-del-proyecto-y-flujo-de-git)

---

## 🚀 Sobre el Proyecto

Esta API permite registrar, gestionar y realizar seguimiento a los tickets de soporte (tareas), organizados por categorías, roles de usuario, comentarios con historial de estados y un sistema integrado de notificaciones en tiempo real.

---

## 💡 Criterios y Decisiones de Negocio

- *Gestión de Estados de Tarea:*
  - Al crear una tarea, inicia automáticamente con el estado ABIERTO.
  - Cuando un agente asignado toma o actualiza la tarea, el estado cambia a EN_PROCESO, RESUELTO o CERRADO.
  - Los comentarios registran el historial de los estados. Si un usuario o agente registra un comentario sin especificar un cambio explícito de estado, el comentario hereda automáticamente el estado actual de la tarea.

- *Sistema de Notificaciones (Decisión del Equipo):*
  - Se implementó un sistema híbrido de *Notificaciones Persistentes en Base de Datos + Tiempo Real con Socket.io*.
  - *Persistencia:* Cada nuevo comentario genera automáticamente un registro de notificación en PostgreSQL dirigido al destinatario (si comenta un EMPLEADO, se notifica al AGENTE asignado, y viceversa).
  - *Tiempo Real (Socket.io):* Se emiten eventos WebSockets en tiempo real hacia los clientes conectados cuando se genera una notificación o cambio en las tareas.
  - *Consulta REST:* Las notificaciones históricas se consultan vía `GET /notificaciones` y pueden marcarse como leídas mediante `PATCH /notificaciones/{id}/leida`.

---

## 🛠️ Instalación y Cómo levantar el proyecto

Sigue estos pasos en orden para clonar, configurar y levantar el proyecto desde cero en tu entorno local:

### 1. Clonar el repositorio

Clona el repositorio en una carpeta local:

`git clone https://github.com/ademirjgf/Help_desk_interno-funval-1.git`

Luego ingresa a la carpeta del proyecto:

`cd Help_desk_interno-funval-1`

### 2. Instalar todas las dependencias

Ejecuta:

`pnpm install`

### 3. Configurar las variables de entorno

El proyecto incluye un archivo `.env.example` con la estructura requerida.

Crea tu propio archivo `.env` basado en esa plantilla:

`cp .env.example .env`

Abre el archivo `.env` recién creado y actualiza la contraseña de PostgreSQL y las demás variables necesarias para tu entorno local.

Ejemplo:

`DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/helpdesk_db?schema=public"`

`JWT_SECRET="tu_clave_secreta_para_tokens"`

`PORT=3000`

### 4. Migrar y crear la Base de Datos en PostgreSQL

Crea la estructura de tablas en tu base de datos local:

`pnpm prisma migrate dev --name init`

Si necesitas sincronizar directamente el esquema de Prisma con la base de datos, también está disponible:

`npx prisma db push`

### 5. Generar los recursos de Prisma

Genera el cliente, tipos y demás recursos necesarios de Prisma:

`pnpm prisma generate`

### 6. Agregar datos de testing (opcional)

Puedes poblar la base de datos con usuarios de prueba (empleados, agentes y administradores), categorías y tareas iniciales:

`pnpm run start:seed`

También puedes utilizar directamente la CLI de Prisma:

`npx prisma db seed`

### 7. Levantar el servidor backend

Ejecuta:

`pnpm run start:dev`

El servidor estará disponible localmente en:

`http://localhost:3000`

### 8. Probar los endpoints y consultar Swagger

Abre en el navegador la interfaz interactiva de Swagger UI:

`http://localhost:3000/api/docs/`

---

## 🔔 US-18 — Notificaciones en tiempo real

Para las notificaciones del sistema, el equipo eligió utilizar **WebSockets mediante Socket.IO** en lugar de correo electrónico con Nodemailer.

### ¿Por qué WebSockets / Socket.IO?

Se eligió esta tecnología porque las notificaciones deben llegar al usuario **en tiempo real**, sin que tenga que actualizar manualmente la página o realizar consultas periódicas al servidor.

Las principales razones fueron:

- Permite comunicación bidireccional y en tiempo real entre el backend y los clientes.
- Las notificaciones se envían inmediatamente cuando se genera un nuevo evento.
- Evita realizar consultas repetitivas al servidor mediante polling.
- Socket.IO facilita la gestión de conexiones y eventos dentro de NestJS.
- Permite enviar las notificaciones únicamente al usuario correspondiente mediante salas (`rooms`).

### Implementación

El sistema utiliza el namespace:

`/notificaciones`

El cliente se registra mediante el evento:

`registrarUsuario`

enviando su identificador de usuario. El servidor lo incorpora a una sala específica:

`usuario:<idUsuario>`

Cuando se genera una nueva notificación, el backend emite el evento:

`nuevaNotificacion`

únicamente a la sala correspondiente al usuario destinatario.

Las notificaciones también se almacenan en PostgreSQL, por lo que pueden ser consultadas posteriormente mediante la API REST aunque el usuario no haya estado conectado al momento de la emisión.

### Correo electrónico

No se utiliza Nodemailer ni un proveedor de correo electrónico para las notificaciones, por lo que **no se requieren credenciales SMTP ni variables de entorno relacionadas con correo electrónico**.

---

## 🎨 Indicaciones para el Frontend (Futuro)

Para los desarrolladores que vayan a construir la aplicación web (React, Next.js, Vue, etc.):

1. **Base URL:** `http://localhost:3000`

2. **CORS:** La API admite peticiones desde clientes locales. Si tu frontend corre en otro puerto (ej. 5173 o 3001), asegúrate de habilitarlo en `main.ts`.

3. **Autenticación mediante JWT:**
   - Haz un `POST /auth/login` enviando email y password.
   - La respuesta devolverá un `access_token`.
   - Incluye este token en la cabecera HTTP de todas las peticiones protegidas:
     `Authorization: Bearer <tu_access_token>`

4. **Conexión en Tiempo Real (Socket.io Client):**
   - Instala la librería client:
     `pnpm add socket.io-client`
   - Conéctate al servidor de WebSockets utilizando el namespace `/notificaciones`.
   - Registra al usuario mediante el evento `registrarUsuario`.
   - Escucha el evento `nuevaNotificacion` para actualizar la UI instantáneamente.

5. **Manejo de Errores:** La API retorna excepciones estandarizadas de NestJS con las propiedades (`statusCode`, `message`, `error`).

---

## 👥 Integrantes y Responsabilidades

| Colaborador                    | Módulo Asignado  |
| :----------------------------- | :--------------- |
| Ademir Jesús Gómez Fuentes     | Notificación     |
| David Gerardo Nuñez Rojas      | Tarea, Categoría |
| Neils Sergio Alanoca Ticona    | Comentario       |
| Manuel Charles Mitacc Quilcaro | Usuario (Auth)   |

---

## 📌 Gestión del Proyecto y Flujo de Git

- Tablero SCRUM (Trello): https://trello.com/b/NAsfWvLs/scrum-funval-grupo

### Nomenclatura de Ramas

Formato: `<nombre_colaborador>/<descripcion-corta>`

Ejemplo: `manuel/usuario-auth`

### Convención de Commits (Conventional Commits)

Los mensajes de commit no deben llevar punto final y deben tener un máximo de 72 caracteres:

Formato: `<tipo>(<ámbito_opcional>): <descripción>`

- `feat`: Nueva característica o funcionalidad.  
  Ejemplo: `git commit -m 'feat(auth): add google login button'`

- `fix`: Corrección de un error o bug.  
  Ejemplo: `git commit -m 'fix(api): resolve memory leak on user checkout'`

- `docs`: Cambios exclusivos en la documentación.  
  Ejemplo: `git commit -m 'docs(readme): update installation instructions'`

- `style`: Formato y estilo de código sin afectar la lógica.  
  Ejemplo: `style(navbar): fix padding layout`

- `refactor`: Mejora o reestructuración de código.  
  Ejemplo: `refactor(users): simplify password validation logic`

- `perf`: Cambios que mejoran el rendimiento.

- `test`: Agregar o corregir pruebas unitarias.

- `chore`: Tareas de mantenimiento, dependencias o configuración.