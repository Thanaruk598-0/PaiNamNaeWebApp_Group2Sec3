-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `profilePicture` VARCHAR(191) NULL,
    `nationalIdNumber` VARCHAR(191) NULL,
    `nationalIdPhotoUrl` VARCHAR(191) NULL,
    `nationalIdExpiryDate` DATETIME(3) NULL,
    `selfiePhotoUrl` VARCHAR(191) NULL,
    `role` ENUM('PASSENGER', 'DRIVER', 'ADMIN') NOT NULL DEFAULT 'PASSENGER',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `otpCode` VARCHAR(191) NULL,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `passengerSuspendedUntil` DATETIME(3) NULL,
    `driverSuspendedUntil` DATETIME(3) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nationalIdNumber_key`(`nationalIdNumber`),
    UNIQUE INDEX `User_nationalIdPhotoUrl_key`(`nationalIdPhotoUrl`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_isActive_idx`(`isActive`),
    INDEX `User_isVerified_idx`(`isVerified`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DriverVerification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `firstNameOnLicense` VARCHAR(191) NOT NULL,
    `lastNameOnLicense` VARCHAR(191) NOT NULL,
    `licenseIssueDate` DATETIME(3) NOT NULL,
    `licenseExpiryDate` DATETIME(3) NOT NULL,
    `licensePhotoUrl` VARCHAR(191) NOT NULL,
    `selfiePhotoUrl` VARCHAR(191) NOT NULL,
    `typeOnLicense` ENUM('PRIVATE_CAR_TEMPORARY', 'PRIVATE_CAR', 'PUBLIC_CAR', 'LIFETIME') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DriverVerification_userId_key`(`userId`),
    UNIQUE INDEX `DriverVerification_licenseNumber_key`(`licenseNumber`),
    INDEX `DriverVerification_status_idx`(`status`),
    INDEX `DriverVerification_createdAt_idx`(`createdAt`),
    INDEX `DriverVerification_licenseIssueDate_idx`(`licenseIssueDate`),
    INDEX `DriverVerification_licenseExpiryDate_idx`(`licenseExpiryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SYSTEM', 'VERIFICATION', 'BOOKING', 'ROUTE') NOT NULL DEFAULT 'SYSTEM',
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `adminReviewedAt` DATETIME(3) NULL,

    INDEX `Notification_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Notification_userId_readAt_idx`(`userId`, `readAt`),
    INDEX `Notification_adminReviewedAt_idx`(`adminReviewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `vehicleModel` VARCHAR(191) NOT NULL,
    `licensePlate` VARCHAR(191) NOT NULL,
    `vehicleType` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `seatCapacity` INTEGER NOT NULL,
    `amenities` JSON NOT NULL,
    `photos` JSON NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicle_licensePlate_key`(`licensePlate`),
    INDEX `Vehicle_userId_idx`(`userId`),
    INDEX `Vehicle_createdAt_idx`(`createdAt`),
    INDEX `Vehicle_vehicleType_idx`(`vehicleType`),
    INDEX `Vehicle_seatCapacity_idx`(`seatCapacity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NOT NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `startLocation` JSON NOT NULL,
    `endLocation` JSON NOT NULL,
    `departureTime` DATETIME(3) NOT NULL,
    `availableSeats` INTEGER NOT NULL,
    `pricePerSeat` DOUBLE NOT NULL,
    `conditions` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE', 'FULL', 'COMPLETED', 'CANCELLED', 'IN_TRANSIT') NOT NULL DEFAULT 'AVAILABLE',
    `cancelledAt` DATETIME(3) NULL,
    `cancelledBy` VARCHAR(191) NULL,
    `routePolyline` VARCHAR(191) NULL,
    `distanceMeters` INTEGER NULL,
    `durationSeconds` INTEGER NULL,
    `routeSummary` VARCHAR(191) NULL,
    `distance` VARCHAR(191) NULL,
    `duration` VARCHAR(191) NULL,
    `waypoints` JSON NULL,
    `landmarks` JSON NULL,
    `steps` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Route_driverId_idx`(`driverId`),
    INDEX `Route_vehicleId_idx`(`vehicleId`),
    INDEX `Route_status_idx`(`status`),
    INDEX `Route_createdAt_idx`(`createdAt`),
    INDEX `Route_departureTime_idx`(`departureTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `routeId` VARCHAR(191) NOT NULL,
    `passengerId` VARCHAR(191) NOT NULL,
    `numberOfSeats` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `cancelledAt` DATETIME(3) NULL,
    `cancelledBy` VARCHAR(191) NULL,
    `cancelReason` ENUM('CHANGE_OF_PLAN', 'FOUND_ALTERNATIVE', 'DRIVER_DELAY', 'PRICE_ISSUE', 'WRONG_LOCATION', 'DUPLICATE_OR_WRONG_DATE', 'SAFETY_CONCERN', 'WEATHER_OR_FORCE_MAJEURE', 'COMMUNICATION_ISSUE') NULL,
    `pickupLocation` JSON NOT NULL,
    `dropoffLocation` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `incidentType` ENUM('DRIVER', 'PASSENGER', 'ROUTE', 'BOOKING', 'SYSTEM', 'OTHER') NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `location` JSON NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `adminNote` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Report_userId_idx`(`userId`),
    INDEX `Report_status_idx`(`status`),
    INDEX `Report_incidentType_idx`(`incidentType`),
    INDEX `Report_priority_idx`(`priority`),
    INDEX `Report_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DriverVerification` ADD CONSTRAINT `DriverVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
