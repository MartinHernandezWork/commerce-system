-- CreateTable
CREATE TABLE `RecipeSale` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipeId` INTEGER NOT NULL,
    `groupId` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecipeSale` ADD CONSTRAINT `RecipeSale_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeSale` ADD CONSTRAINT `RecipeSale_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `SaleGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
