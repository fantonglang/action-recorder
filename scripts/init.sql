CREATE SCHEMA `browser-events` DEFAULT CHARACTER SET utf8mb4 ;

CREATE TABLE `browser-events`.`events` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  `data` TEXT NOT NULL,
  `time` BIGINT NOT NULL,
  `duration` INT NOT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `browser-events`.`events` 
ADD COLUMN `page_last` INT(1) NOT NULL DEFAULT 0 AFTER `duration`;

ALTER TABLE `browser-events`.`events` 
ADD COLUMN `session` BIGINT NOT NULL AFTER `page_last`,
CHANGE COLUMN `duration` `duration` INT(11) NOT NULL DEFAULT 0 ;
