import { PrismaClient } from '../src/prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Rol,
  Estado,
  TipoCategoria,
  EstadoTicket,
  PrioridadTarea,
} from '../src/prisma/generated/prisma/enums.js';
import { Decimal } from '@prisma/client/runtime/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('Iniciando limpieza completa de la base de datos...');

  // 1. Eliminacion de registros en tablas existentes
  await prisma.categoria.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.comentario.deleteMany();
  await prisma.notificacion.deleteMany();

  // 2. Reinicio de contadores de ID para las tablas
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "categorias" RESTART IDENTITY CASCADE;`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "tareas" RESTART IDENTITY CASCADE;`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "usuarios" RESTART IDENTITY CASCADE;`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "comentarios" RESTART IDENTITY CASCADE;`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "notificaciones" RESTART IDENTITY CASCADE;`,
  );

  // 3. INYECTAR USUARIOS (3 con roles distintos)
  const hashAdmin = await bcrypt.hash('admin123', 10);
  const hashUsuario = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      nombres: 'Carlos',
      apellidos: 'Mendoza',
      masculino: true,
      email: 'admin@helpdesk.com',
      password: hashAdmin,
      rol: Rol.ADMIN,
      estado: Estado.ACTIVO,
    },
  });

  const agente = await prisma.usuario.upsert({
    where: { email: 'agente.soporte@helpdesk.com' },
    update: {},
    create: {
      nombres: 'Laura',
      apellidos: 'Gómez',
      masculino: false,
      email: 'agente.soporte@helpdesk.com',
      password: hashUsuario,
      rol: Rol.AGENTE,
      estado: Estado.ACTIVO,
    },
  });

  const empleado = await prisma.usuario.upsert({
    where: { email: 'empleado.mmitacc@gmail.com' },
    update: {},
    create: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      masculino: true,
      email: 'empleado.mmitacc@gmail.com',
      password: hashUsuario,
      rol: Rol.EMPLEADO,
      estado: Estado.ACTIVO,
    },
  });

  // 4. INYECTAR CATEGORÍAS (6 en total)
  console.log('Creating categorias...');
  const catHardware = await prisma.categoria.upsert({
    where: { sub_tipo: 'Falla de Hardware / Laptops' },
    update: {},
    create: {
      tipo: TipoCategoria.INCIDENCIA,
      sub_tipo: 'Falla de Hardware / Laptops',
    },
  });

  const catSoftware = await prisma.categoria.upsert({
    where: { sub_tipo: 'Instalación de Software Corporativo' },
    update: {},
    create: {
      tipo: TipoCategoria.REQUERIMIENTO,
      sub_tipo: 'Instalación de Software Corporativo',
    },
  });

  const catRedes = await prisma.categoria.upsert({
    where: { sub_tipo: 'Problemas de Conectividad / VPN' },
    update: {},
    create: {
      tipo: TipoCategoria.INCIDENCIA,
      sub_tipo: 'Problemas de Conectividad / VPN',
    },
  });

  const catAccesos = await prisma.categoria.upsert({
    where: { sub_tipo: 'Creación de Cuentas y Accesos' },
    update: {},
    create: {
      tipo: TipoCategoria.REQUERIMIENTO,
      sub_tipo: 'Creación de Cuentas y Accesos',
    },
  });

  const catCorreos = await prisma.categoria.upsert({
    where: { sub_tipo: 'Configuración de Outlook / Correo' },
    update: {},
    create: {
      tipo: TipoCategoria.REQUERIMIENTO,
      sub_tipo: 'Configuración de Outlook / Correo',
    },
  });

  const catSeguridad = await prisma.categoria.upsert({
    where: { sub_tipo: 'Bloqueo por Malware / Virus sospechoso' },
    update: {},
    create: {
      tipo: TipoCategoria.INCIDENCIA,
      sub_tipo: 'Bloqueo por Malware / Virus sospechoso',
    },
  });

  // 5. INYECTAR TAREAS (6 en total)
  console.log('Creating tareas...');
  const tarea1 = await prisma.tarea.create({
    data: {
      titulo: 'Mi laptop no enciende la pantalla',
      descripcion:
        'Ayer apagué el equipo normalmente y hoy la pantalla se queda en negro, aunque el ventilador suena.',
      estado: EstadoTicket.ABIERTO,
      prioridad: PrioridadTarea.ALTA,
      id_empleado: empleado.id,
      id_categoria: catHardware.id,
    },
  });

  const tarea2 = await prisma.tarea.create({
    data: {
      titulo: 'Solicitud de licencia de Adobe Creative Cloud',
      descripcion:
        'Requiero la licencia para el ingreso del nuevo diseñador de la jefatura de marketing.',
      estado: EstadoTicket.EN_PROCESO,
      prioridad: PrioridadTarea.MEDIA,
      id_empleado: empleado.id,
      id_agente: agente.id,
      id_categoria: catSoftware.id,
    },
  });

  const tarea3 = await prisma.tarea.create({
    data: {
      titulo: 'Caída intermitente de la VPN corporativa',
      descripcion:
        'Cada 15 minutos me desconecta del servidor de base de datos remoto cuando estoy en home office.',
      estado: EstadoTicket.ABIERTO,
      prioridad: PrioridadTarea.ALTA,
      id_empleado: empleado.id,
      id_categoria: catRedes.id,
    },
  });

  const tarea4 = await prisma.tarea.create({
    data: {
      titulo: 'Acceso temporal a carpeta compartida de Finanzas',
      descripcion:
        'Solicito acceso de lectura por 3 días para auditoría trimestral.',
      estado: EstadoTicket.RESUELTO,
      prioridad: PrioridadTarea.BAJA,
      id_empleado: empleado.id,
      id_agente: agente.id,
      id_categoria: catAccesos.id,
    },
  });

  const tarea5 = await prisma.tarea.create({
    data: {
      titulo: 'Error de sincronización en buzón de Outlook',
      descripcion:
        'No me cargan los correos nuevos desde las 8:00 AM, sale código de error interno.',
      estado: EstadoTicket.CERRADO,
      prioridad: PrioridadTarea.MEDIA,
      id_empleado: empleado.id,
      id_agente: agente.id,
      id_categoria: catCorreos.id,
    },
  });

  const tarea6 = await prisma.tarea.create({
    data: {
      titulo: 'Alerta de Windows Defender por ejecutable sospechoso',
      descripcion:
        'Descargué un adjunto que parecía una factura y saltó el antivirus bloqueando el sistema.',
      estado: EstadoTicket.EN_PROCESO,
      prioridad: PrioridadTarea.ALTA,
      id_empleado: empleado.id,
      id_agente: admin.id, // Asignado al admin por alta prioridad
      id_categoria: catSeguridad.id,
    },
  });

  // 6. INYECTAR COMENTARIOS Y NOTIFICACIONES (10 de cada uno)
  console.log('Creating comentarios e historial de notificaciones...');

  // Tarea 1: Interacciones iniciales
  const com1 = await prisma.comentario.create({
    data: {
      descripcion:
        'Hola Juan, ¿probaste conectar un monitor externo para descartar panel?',
      estado_actual: EstadoTicket.ABIERTO,
      id_autor: agente.id,
      id_tarea: tarea1.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com1.id, id_usuario: empleado.id, leido: false },
  });

  const com2 = await prisma.comentario.create({
    data: {
      descripcion:
        'Hola, sí, acabo de probar con el monitor de mi casa y tampoco da señal.',
      estado_actual: EstadoTicket.ABIERTO,
      id_autor: empleado.id,
      id_tarea: tarea1.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com2.id, id_usuario: agente.id, leido: false },
  });

  // Tarea 2: Gestión de software
  const com3 = await prisma.comentario.create({
    data: {
      descripcion:
        'Tomando el caso. Procederé a validar si hay presupuesto de licencias libres.',
      estado_actual: EstadoTicket.EN_PROCESO,
      id_autor: agente.id,
      id_tarea: tarea2.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com3.id, id_usuario: empleado.id, leido: true },
  });

  const com4 = await prisma.comentario.create({
    data: {
      descripcion: 'Perfecto, quedo atento para avisarle al nuevo diseñador.',
      estado_actual: EstadoTicket.EN_PROCESO,
      id_autor: empleado.id,
      id_tarea: tarea2.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com4.id, id_usuario: agente.id, leido: false },
  });

  // Tarea 4: Resuelta
  const com5 = await prisma.comentario.create({
    data: {
      descripcion: 'Validando aprobación del Gerente de Finanzas.',
      estado_actual: EstadoTicket.EN_PROCESO,
      id_autor: agente.id,
      id_tarea: tarea4.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com5.id, id_usuario: empleado.id, leido: true },
  });

  const com6 = await prisma.comentario.create({
    data: {
      descripcion:
        'Acceso concedido exitosamente en el Active Directory. Vence en 72 horas.',
      estado_actual: EstadoTicket.RESUELTO,
      id_autor: agente.id,
      id_tarea: tarea4.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com6.id, id_usuario: empleado.id, leido: false },
  });

  const com7 = await prisma.comentario.create({
    data: {
      descripcion:
        'Muchas gracias, ya puedo ver las carpetas compartidas sin problemas.',
      estado_actual: EstadoTicket.RESUELTO,
      id_autor: empleado.id,
      id_tarea: tarea4.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com7.id, id_usuario: agente.id, leido: true },
  });

  // Tarea 5: Cerrada
  const com8 = await prisma.comentario.create({
    data: {
      descripcion:
        'Se procedió a reconfigurar el perfil de correo corrupto desde el panel de control.',
      estado_actual: EstadoTicket.RESUELTO,
      id_autor: agente.id,
      id_tarea: tarea5.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com8.id, id_usuario: empleado.id, leido: true },
  });

  const com9 = await prisma.comentario.create({
    data: {
      descripcion: 'Caso cerrado por inactividad y conformidad del usuario.',
      estado_actual: EstadoTicket.CERRADO,
      id_autor: admin.id,
      id_tarea: tarea5.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com9.id, id_usuario: empleado.id, leido: true },
  });

  // Tarea 6: Evento Crítico de Seguridad
  const com10 = await prisma.comentario.create({
    data: {
      descripcion:
        'Aislándolo de la red corporativa de manera preventiva mientras corre el escaneo completo.',
      estado_actual: EstadoTicket.EN_PROCESO,
      id_autor: admin.id,
      id_tarea: tarea6.id,
    },
  });
  await prisma.notificacion.create({
    data: { id_comentario: com10.id, id_usuario: empleado.id, leido: false },
  });

  console.log('Base de datos sembrada con éxito.');
  console.log('- 3 Usuarios creados');
  console.log('- 6 Categorias creadas');
  console.log('- 6 Tareas creadas');
  console.log('- 10 Comentarios creados');
  console.log('- 10 Notificaciones creadas');
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
