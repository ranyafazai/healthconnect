-- AlterTable
ALTER TABLE `review` ADD COLUMN `appointmentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
