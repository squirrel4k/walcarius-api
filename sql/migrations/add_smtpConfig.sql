--
-- Table structure for table `smtpconfig`
--



DROP TABLE IF EXISTS `smtpConfig` ;
CREATE TABLE `smtpConfig` (
  `id` INT unsigned NOT NULL AUTO_INCREMENT,
  `loginId` INT unsigned  NOT NULL,
  `username` VARCHAR(255) NULL DEFAULT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  `host` VARCHAR(50) NULL DEFAULT NULL,
  `port` INT unsigned NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_LOGIN_ID_LOGIN_idx` (`loginId`),
  CONSTRAINT `FK_LOGIN_ID_LOGIN` FOREIGN KEY (`loginId`) REFERENCES `logins` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


INSERT INTO `smtpConfig` (`loginId`, `username`, `password`, `host`, `port`, `active`) VALUES
(1, NULL, NULL, NULL, 0, 0),
(2, NULL, NULL, NULL, 0, 0),
(4, NULL, NULL, NULL, 0, 0),
(5, NULL, NULL, NULL, 0, 0),
(6, NULL, NULL, NULL, 0, 0),
(7, NULL, NULL, NULL, 0, 0),
(8, NULL, NULL, NULL, 0, 0),
(9, NULL, NULL, NULL, 0, 0),
(10, NULL, NULL, NULL, 0, 0),
(21, NULL, NULL, NULL, 0, 0),
(22, NULL, NULL, NULL, 0, 0),
(23, NULL, NULL, NULL, 0, 0),
(24, NULL, NULL, NULL, 0, 0),
(25, NULL, NULL, NULL, 0, 0),
(26, NULL, NULL, NULL, 0, 0),
(27, NULL, NULL, NULL, 0, 0),
(28, NULL, NULL, NULL, 0, 0),
(29, NULL, NULL, NULL, 0, 0),
(30, NULL, NULL, NULL, 0, 0),
(31, NULL, NULL, NULL, 0, 0)
;