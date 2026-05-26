/*
  Warnings:

  - You are about to drop the column `chasis` on the `Vehiculo` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Vehiculo_chasis_key";

-- AlterTable
ALTER TABLE "Vehiculo" DROP COLUMN "chasis";
