-- CreateTable
CREATE TABLE `UserSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `smsNotifications` BOOLEAN NOT NULL DEFAULT false,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `appointmentReminders` BOOLEAN NOT NULL DEFAULT true,
    `messageNotifications` BOOLEAN NOT NULL DEFAULT true,
    `healthTips` BOOLEAN NOT NULL DEFAULT false,
    `marketingEmails` BOOLEAN NOT NULL DEFAULT false,
    `profileVisibility` VARCHAR(191) NOT NULL DEFAULT 'DOCTORS_ONLY',
    `shareMedicalHistory` BOOLEAN NOT NULL DEFAULT true,
    `allowDataAnalytics` BOOLEAN NOT NULL DEFAULT false,
    `shareForResearch` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorAuth` BOOLEAN NOT NULL DEFAULT false,
    `sessionTimeout` INTEGER NOT NULL DEFAULT 30,
    `loginNotifications` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `UserSettings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
