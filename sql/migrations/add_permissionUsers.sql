--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission` ;
CREATE TABLE `permission` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT,
  `userGroup` VARCHAR(255) NULL DEFAULT NULL,
  `category` VARCHAR(255) NULL DEFAULT NULL,
  `read` BOOLEAN NOT NULL DEFAULT 0,
  `write` BOOLEAN NOT NULL DEFAULT 0,
  `delete` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

INSERT INTO `permission` (`userGroup`, `category`, `read`, `write`, `delete`) VALUES
("administrator", "quotations", 1, 1, 1),
("administrator", "projects", 1, 1, 1),
("administrator", "price-requests", 1, 1, 1),
("administrator", "purchase-orders", 1, 1, 1),
("administrator", "suppliers", 1, 1, 1),
("administrator", "catalog", 1, 1, 1),
("administrator", "users", 1, 1, 1),
("administrator", "see-prices", 1, 1, 1),
("quoter", "quotations", 1, 1, 1),
("quoter", "projects", 1, 0, 0),
("quoter", "price-requests", 1, 0, 0),
("quoter", "purchase-orders", 1, 0, 0),
("quoter", "suppliers", 1, 0, 0),
("quoter", "catalog", 1, 0, 0),
("quoter", "users", 1, 0, 0),
("quoter", "see-prices", 0, 0, 0),
("design-office", "quotations", 1, 0, 0),
("design-office", "projects", 1, 1, 1),
("design-office", "price-requests", 1, 1, 1),
("design-office", "purchase-orders", 1, 0, 0),
("design-office", "suppliers", 1, 0, 0),
("design-office", "catalog", 1, 0, 0),
("design-office", "users", 1, 0, 0),
("design-office", "see-prices", 0, 0, 0),
("workshop", "quotations", 1, 0, 0),
("workshop", "projects", 1, 0, 0),
("workshop", "price-requests", 1, 0, 0),
("workshop", "purchase-orders", 1, 0, 0),
("workshop", "suppliers", 1, 0, 0),
("workshop", "catalog", 1, 0, 0),
("workshop", "users", 1, 0, 0),
("workshop", "see-prices", 0, 0, 0);