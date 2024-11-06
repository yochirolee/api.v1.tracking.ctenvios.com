/*
  Warnings:

  - The values [CON_PROBLEMA] on the enum `ParcelStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ParcelStatus_new" AS ENUM ('FACTURADO', 'EN_PALLET', 'EN_DESPACHO', 'EN_CONTENEDOR', 'EN_ESPERA_DE_AFORO', 'AFORADO', 'LISTO_PARA_TRASLADO', 'EN_TRASLADO', 'ENTREGADO', 'RECLAMACION');
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
