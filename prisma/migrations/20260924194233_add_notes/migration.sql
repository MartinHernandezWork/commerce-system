-- CreateTable
CREATE TABLE `note` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('MERCADERIA_INGRESO', 'MERCADERIA_PERDIDA', 'CAMBIO', 'OTRA') NOT NULL,
    `content` TEXT NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `note_type_idx`(`type`),
    INDEX `note_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
