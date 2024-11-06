/*
  Warnings:

  - The values [CLOSED] on the enum `IssueStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ENTREGA_FALLIDA,ROTO,MOJADO,CANAL_ROJO,FALTANTE,NO_DECLARADO,OTRO] on the enum `ParcelStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IssueStatus_new" AS ENUM ('OPEN', 'RESOLVED');
ALTER TABLE "Issue" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Issue" ALTER COLUMN "status" TYPE "IssueStatus_new" USING ("status"::text::"IssueStatus_new");
ALTER TYPE "IssueStatus" RENAME TO "IssueStatus_old";
ALTER TYPE "IssueStatus_new" RENAME TO "IssueStatus";
DROP TYPE "IssueStatus_old";
ALTER TABLE "Issue" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ParcelStatus_new" AS ENUM ('FACTURADO', 'EN_PALLET', 'EN_DESPACHO', 'EN_CONTENEDOR', 'EN_ESPERA_DE_AFORO', 'AFORADO', 'LISTO_PARA_TRASLADO', 'EN_TRASLADO', 'ENTREGADO', 'CON_PROBLEMA');
ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Parcel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Parcel" ALTER COLUMN "status" TYPE "ParcelStatus_new" USING ("status"::text::"ParcelStatus_new");
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "ParcelStatus_new" USING ("status"::text::"ParcelStatus_new");
ALTER TYPE "ParcelStatus" RENAME TO "ParcelStatus_old";
ALTER TYPE "ParcelStatus_new" RENAME TO "ParcelStatus";
DROP TYPE "ParcelStatus_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'FACTURADO';
ALTER TABLE "Parcel" ALTER COLUMN "status" SET DEFAULT 'FACTURADO';
COMMIT;
