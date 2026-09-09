/*
  Warnings:

  - Made the column `recipeName` on table `recipesale` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitPrice` on table `recipesale` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productName` on table `sale` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitPrice` on table `sale` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `recipesale` MODIFY `recipeName` VARCHAR(191) NOT NULL,
    MODIFY `unitPrice` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `sale` MODIFY `productName` VARCHAR(191) NOT NULL,
    MODIFY `unitPrice` DOUBLE NOT NULL;
