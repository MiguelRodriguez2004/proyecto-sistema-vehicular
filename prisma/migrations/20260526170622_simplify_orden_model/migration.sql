/*
  Warnings:

  - You are about to drop the column `descripcion` on the `OrdenServicio` table. All the data in the column will be lost.
  - You are about to drop the `ServicioRealizado` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoServicio" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'DIAGNOSTICO');

-- DropForeignKey
ALTER TABLE "ServicioRealizado" DROP CONSTRAINT "ServicioRealizado_ordenId_fkey";

-- AlterTable
ALTER TABLE "OrdenServicio" DROP COLUMN "descripcion",
ADD COLUMN     "diagnostico" TEXT,
ADD COLUMN     "kilometraje" INTEGER,
ADD COLUMN     "tipoServicio" "TipoServicio",
ALTER COLUMN "estado" SET DEFAULT 'RECIBIDO';

-- DropTable
DROP TABLE "ServicioRealizado";
