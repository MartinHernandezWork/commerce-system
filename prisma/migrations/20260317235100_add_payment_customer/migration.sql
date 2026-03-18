-- AlterTable
ALTER TABLE `salegroup` ADD COLUMN `customerName` VARCHAR(191) NULL,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'TRANSFER', 'CARD') NOT NULL DEFAULT 'CASH';
