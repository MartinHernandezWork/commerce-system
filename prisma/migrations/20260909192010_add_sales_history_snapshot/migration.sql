-- AlterTable
ALTER TABLE `recipesale` ADD COLUMN `recipeName` VARCHAR(191) NULL,
    ADD COLUMN `unitPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `sale` ADD COLUMN `productName` VARCHAR(191) NULL,
    ADD COLUMN `unitPrice` DOUBLE NULL;
