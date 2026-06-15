/*
  Warnings:

  - You are about to drop the column `auth0Id` on the `Usuario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Usuario_auth0Id_key";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "auth0Id",
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
