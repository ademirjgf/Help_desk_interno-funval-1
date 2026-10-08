# API RESTful - Help Desk Interno FUNVAL

Sistema backend centralizado para la gestión de solicitudes, incidencias y requerimientos de soporte interno.

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Criterios y Decisiones de Negocio](#-criterios-y-decisiones-de-negocio)
- [Cómo levantar el proyecto](#-cómo-levantar-el-proyecto)
- [Indicaciones para el Frontend (Futuro)](#-indicaciones-para-el-frontend-futuro)
- [Integrantes y Responsabilidades](#-integrantes-y-responsabilidades)
- [Gestión del Proyecto y Flujo de Git](#-gestión-del-proyecto-y-flujo-de-git)

---

## 🚀 Sobre el Proyecto

Esta API permite registrar, gestionar y realizar seguimiento a los tickets de soporte (tareas), organizados por categorías, roles de usuario, comentarios con historial de estados y un sistema integrado de notificaciones en tiempo real.

---

## 💡 Criterios y Decisiones de Negocio

- **Gestión de Estados de Tarea:**
  - Al crear una tarea, inicia automáticamente con el estado `ABIERTO`.
  - Cuando un agente asignado toma o actualiza la tarea, el estado cambia a `EN_PROCESO`, `RESUELTO` o `CERRADO`.
  - Los comentarios registran el historial de los estados. Si un usuario o agente registra un comentario sin especificar un cambio explícito de estado, el comentario hereda automáticamente el estado actual de la tarea.
- **Sistema de Notificaciones (Decisión del Equipo):**
  - Se implementó un sistema híbrido de **Notificaciones Persistentes en Base de Datos + Tiempo Real con Socket.io**.
  - **Persistencia:** Cada nuevo comentario genera automáticamente un registro de notificación en PostgreSQL dirigido al destinatario (si comenta un `EMPLEADO`, se notifica al `AGENTE` asignado, y viceversa).
  - **Tiempo Real (Socket.io):** Se emiten eventos WebSockets en tiempo real hacia los clientes conectados cuando se genera una notificación o cambio en las tareas.
  - **Consulta REST:** Las notificaciones históricas se consultan vía `GET /notificaciones` y pueden marcarse como leídas mediante `PATCH /notificaciones/{id}/leida`.

---

## 🛠️ Cómo levantar el proyecto

Sigue estos pasos en orden para clonar, configurar y levantar el proyecto desde cero en tu entorno local:

1. Clonar el repositorio en una carpeta local:
   git clone https://github.com/ademirjgf/Help_desk_interno-funval-1.git
   cd Help_desk_interno-funval-1

2. Instalar las dependencias del proyecto:
   pnpm install

3. Configurar variables de entorno (.env):
   El proyecto incluye un archivo .env.example con la estructura requerida. Crea tu propio archivo .env basado en esa plantilla:
   cp .env.example .env

   Abre el archivo .env recién creado y reemplaza las variables con los datos de tu PostgreSQL local y tu clave JWT:
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/helpdesk_db?schema=public"
   JWT_SECRET="tu_clave_secreta_para_tokens"
   PORT=3000

4. Generar el cliente de Prisma y correr las migraciones:
   Crea la estructura de tablas en tu base de datos local y genera los tipos de Prisma:
   pnpm prisma migrate dev --name init
   npx prisma db push
   pnpm prisma generate

5. Siembra datos de ejemplo (Seed):
   Puebla la base de datos con usuarios de prueba (empleados, agentes y administradores), categorías y tareas iniciales:
   pnpm run start:seed
   (O usando directamente la CLI de Prisma: npx prisma db seed)

6. Levantar el servidor en modo desarrollo:
   pnpm run start:dev

7. Probar los endpoints y la documentación local:
   Abre tu navegador e ingresa a la interfaz interactiva de Swagger UI:  
   http://localhost:3000/api/docs/

---

## 🎨 Indicaciones para el Frontend (Futuro)

Para los desarrolladores que vayan a construir la aplicación web (React, Next.js, Vue, etc.):

1. Base URL: http://localhost:3000
2. CORS: La API admite peticiones desde clientes locales. Si tu frontend corre en otro puerto (ej. 5173 o 3001), asegúrate de habilitarlo en main.ts.
3. Autenticación mediante JWT:
   - Haz un POST /auth/login enviando email y password.
   - La respuesta devolverá un access_token.
   - Incluye este token en la cabecera HTTP de todas las peticiones protegidas:
     Authorization: Bearer <tu_access_token>
4. Conexión en Tiempo Real (Socket.io Client):
   - Instala la librería client: `pnpm add socket.io-client`
   - Conéctate al servidor de WebSockets en `http://localhost:3000` pasando el JWT Token en el handshake de autenticación.
   - Escucha los eventos emitidos por el servidor (ej. `notificacion:nueva`) para actualizar la UI instantáneamente.
5. Manejo de Errores: La API retorna excepciones estandarizadas de NestJS con las propiedades (statusCode, message, error).

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

Formato: <nombre_colaborador>/<descripcion-corta>  
Ejemplo: manuel/usuario-auth

### Convención de Commits (Conventional Commits)

Los mensajes de commit no deben llevar punto final y deben tener un máximo de 72 caracteres:

Formato: <tipo>(<ámbito_opcional>): <descripción>

- feat: Nueva característica o funcionalidad.  
  Ejemplo: git commit -m 'feat(auth): add google login button'
- fix: Corrección de un error o bug.  
  Ejemplo: git commit -m 'fix(api): resolve memory leak on user checkout'
- docs: Cambios exclusivos en la documentación.  
  Ejemplo: git commit -m 'docs(readme): update installation instructions'
- style: Formato y estilo de código sin afectar la lógica.  
  Ejemplo: git commit -m 'style(navbar): fix padding layout'
- refactor: Mejora o reestructuración de código.  
  Ejemplo: git commit -m 'refactor(users): simplify password validation logic'
- perf: Cambios que mejoran el rendimiento.
- test: Agregar o corregir pruebas unitarias.
- chore: Tareas de mantenimiento, dependencias o configuración.
