/*
  Warnings:

  - You are about to alter the column `stock` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `quantity` on the `sale` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `quantity` on the `stockmovement` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `unitType` ENUM('UNIT', 'G', 'KG') NOT NULL DEFAULT 'UNIT',
    MODIFY `stock` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `sale` MODIFY `quantity` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `stockmovement` MODIFY `quantity` DOUBLE NOT NULL;
