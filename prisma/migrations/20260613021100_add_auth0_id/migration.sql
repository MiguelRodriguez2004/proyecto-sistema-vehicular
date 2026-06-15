-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "auth0Id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_auth0Id_key" ON "Usuario"("auth0Id");
