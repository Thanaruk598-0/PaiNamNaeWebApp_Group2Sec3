/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ChatMessage` ADD COLUMN `fileName` VARCHAR(191) NULL,
    ADD COLUMN `fileType` VARCHAR(191) NULL,
    ADD COLUMN `fileUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Report` DROP COLUMN `imageUrl`,
    ADD COLUMN `attachments` JSON NULL;