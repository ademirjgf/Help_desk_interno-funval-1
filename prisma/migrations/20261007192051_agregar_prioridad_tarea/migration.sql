-- CreateEnum
CREATE TYPE "PrioridadTarea" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- AlterTable
ALTER TABLE "comentarios" ALTER COLUMN "estado_actual" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tareas" ADD COLUMN     "prioridad" "PrioridadTarea" NOT NULL DEFAULT 'MEDIA';
