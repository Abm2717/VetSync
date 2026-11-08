/*
  Warnings:

  - The values [AGENDADA] on the enum `EstadoCita` will be removed. If these variants are still used in the database, this will fail.
  - The values [VETERINARIAN] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `duenoId` on the `Mascota` table. All the data in the column will be lost.
  - You are about to drop the column `historialMedico` on the `Mascota` table. All the data in the column will be lost.
  - Added the required column `duenioId` to the `Mascota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaNacimiento` to the `Mascota` table without a default value. This is not possible if the table is not empty.
  - Added the required column `raza` to the `Mascota` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoCita_new" AS ENUM ('PROGRAMADA', 'CANCELADA', 'COMPLETADA');
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" TYPE "public"."EstadoCita_new" USING ("estado"::text::"public"."EstadoCita_new");
ALTER TYPE "public"."EstadoCita" RENAME TO "EstadoCita_old";
ALTER TYPE "public"."EstadoCita_new" RENAME TO "EstadoCita";
DROP TYPE "public"."EstadoCita_old";
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" SET DEFAULT 'PROGRAMADA';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Rol_new" AS ENUM ('OWNER', 'VETERINARIO');
ALTER TABLE "public"."Usuario" ALTER COLUMN "rol" TYPE "public"."Rol_new" USING ("rol"::text::"public"."Rol_new");
ALTER TYPE "public"."Rol" RENAME TO "Rol_old";
ALTER TYPE "public"."Rol_new" RENAME TO "Rol";
DROP TYPE "public"."Rol_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Mascota" DROP CONSTRAINT "Mascota_duenoId_fkey";

-- AlterTable
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" SET DEFAULT 'PROGRAMADA';

-- AlterTable
ALTER TABLE "public"."Mascota" DROP COLUMN "duenoId",
DROP COLUMN "historialMedico",
ADD COLUMN     "duenioId" TEXT NOT NULL,
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "raza" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "public"."RegistroMedico" (
    "id" TEXT NOT NULL,
    "mascotaId" TEXT NOT NULL,
    "veterinarioId" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT,
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroMedico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroMedico_mascotaId_idx" ON "public"."RegistroMedico"("mascotaId");

-- AddForeignKey
ALTER TABLE "public"."Mascota" ADD CONSTRAINT "Mascota_duenioId_fkey" FOREIGN KEY ("duenioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroMedico" ADD CONSTRAINT "RegistroMedico_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "public"."Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroMedico" ADD CONSTRAINT "RegistroMedico_veterinarioId_fkey" FOREIGN KEY ("veterinarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
