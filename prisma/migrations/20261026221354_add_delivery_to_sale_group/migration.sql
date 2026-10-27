-- AlterTable
ALTER TABLE `salegroup` ADD COLUMN `deliveryFee` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `deliveryRequired` BOOLEAN NOT NULL DEFAULT false;
