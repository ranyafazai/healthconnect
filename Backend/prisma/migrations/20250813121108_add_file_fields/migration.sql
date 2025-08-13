-- AlterTable
ALTER TABLE `file` ADD COLUMN `filename` VARCHAR(191) NULL,
    ADD COLUMN `mimetype` VARCHAR(191) NULL,
    ADD COLUMN `originalname` VARCHAR(191) NULL,
    ADD COLUMN `size` INTEGER NULL;
