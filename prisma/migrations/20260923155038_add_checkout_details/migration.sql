/*
  Warnings:

  - Added the required column `category` to the `orderitemextra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orderitemextra` ADD COLUMN `category` ENUM('ADEREZO', 'DESCARTABLE') NOT NULL;

-- AlterTable
ALTER TABLE `salegroup` ADD COLUMN `cashReceived` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `change` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `orderitemingredient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `orderitem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `orderitem_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `recipe`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitemingredient` ADD CONSTRAINT `orderitemingredient_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `orderitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitemingredient` ADD CONSTRAINT `orderitemingredient_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitemextra` ADD CONSTRAINT `orderitemextra_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
