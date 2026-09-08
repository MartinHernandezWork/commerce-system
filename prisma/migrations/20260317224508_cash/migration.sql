-- DropForeignKey
ALTER TABLE `sale` DROP FOREIGN KEY `Sale_productId_fkey`;

-- DropForeignKey
ALTER TABLE `stockmovement` DROP FOREIGN KEY `StockMovement_productId_fkey`;

-- DropIndex
DROP INDEX `Sale_productId_fkey` ON `sale`;

-- DropIndex
DROP INDEX `StockMovement_productId_fkey` ON `stockmovement`;

-- AlterTable
ALTER TABLE `sale` ADD COLUMN `groupId` INTEGER NULL;

-- CreateTable
CREATE TABLE `salegroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `total` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cashId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cashregister` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,
    `initial` DOUBLE NOT NULL,
    `final` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sale` ADD CONSTRAINT `Sale_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale` ADD CONSTRAINT `Sale_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `salegroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salegroup` ADD CONSTRAINT `SaleGroup_cashId_fkey` FOREIGN KEY (`cashId`) REFERENCES `cashregister`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stockmovement` ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
