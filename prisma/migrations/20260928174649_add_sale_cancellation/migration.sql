-- AlterTable
ALTER TABLE `salegroup` ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `cancelledById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `salegroup` ADD CONSTRAINT `salegroup_cancelledById_fkey` FOREIGN KEY (`cancelledById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
