/*
  Warnings:

  - The values [DRIVER,PASSENGER,ROUTE,BOOKING,SYSTEM] on the enum `Report_incidentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Report` MODIFY `incidentType` ENUM('SAFETY', 'TRIP_ISSUE', 'BEHAVIOR', 'PROPERTY', 'TECHNICAL', 'OTHER') NOT NULL;
