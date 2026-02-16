/*
  Warnings:

  - You are about to drop the column `category` on the `Report` table. All the data in the column will be lost.
  - Added the required column `incidentType` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('DRIVER', 'PASSENGER', 'ROUTE', 'BOOKING', 'SYSTEM', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "category",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "incidentType" "IncidentType" NOT NULL,
ADD COLUMN     "location" JSON,
ADD COLUMN     "priority" "IncidentPriority" NOT NULL DEFAULT 'MEDIUM';

-- DropEnum
DROP TYPE "ReportCategory";

-- CreateIndex
CREATE INDEX "Report_incidentType_idx" ON "Report"("incidentType");

-- CreateIndex
CREATE INDEX "Report_priority_idx" ON "Report"("priority");
