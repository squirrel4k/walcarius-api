-- -----------------------------------------------------
-- Table `projects`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(30) NOT NULL,
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplyLists`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplyLists`;
CREATE TABLE `supplyLists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `source` varchar(10) NOT NULL,
  `deliveryDate` timestamp NULL DEFAULT NULL,
  `status` varchar(15) NOT NULL,
  `projectId` int(10) unsigned NOT NULL,
  `priceRequestId` int(11) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplyList_projects_idx` (`projectId`),
  CONSTRAINT `fk_supplyList_projects` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplyListElements`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplyListElements`;
CREATE TABLE `supplyListElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(200) DEFAULT NULL,
  `denomination` varchar(200) DEFAULT NULL,
  `matterReference` varchar(50) DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `format` varchar(100) DEFAULT NULL,
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `remark` varchar(200) DEFAULT NULL,
  `supplyListId` int(10) unsigned NOT NULL,
  `supplyCategoryId` int(10) unsigned DEFAULT NULL,
  `elementId` int(10) unsigned DEFAULT NULL,
  `matterId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplyListElements_supplyLists_idx` (`supplyListId`),
  KEY `fk_supplyListElements_supplyCategories_idx` (`supplyCategoryId`),
  KEY `fk_supplyListElements_matters_idx` (`matterId`),
  KEY `fk_supplyListElements_elements_idx` (`elementId`),
  CONSTRAINT `fk_supplyListElements_elements` FOREIGN KEY (`elementId`) REFERENCES `elements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyListElements_matters` FOREIGN KEY (`matterId`) REFERENCES `matters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyListElements_supplyCategories` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyListElements_supplyLists` FOREIGN KEY (`supplyListId`) REFERENCES `supplyLists` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplyCategoryNatures`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplyCategoryNatures`;
CREATE TABLE `supplyCategoryNatures` (
  `natureId` int(10) unsigned NOT NULL,
  `supplyCategoryId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`natureId`,`supplyCategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Data for table `supplyCategoryNatures`
-- -----------------------------------------------------

LOCK TABLES `supplyCategoryNatures` WRITE;
/*!40000 ALTER TABLE `supplyCategoryNatures` DISABLE KEYS */;
INSERT INTO `supplyCategoryNatures` VALUES (28,7),(28,8),(28,14),(28,15),(28,16),(28,17),(28,18),(28,19),(28,20),(28,21),(28,22),(28,23),(28,24),(28,25),(28,26),(28,27),(29,1),(29,2),(29,3),(29,4),(29,5),(29,6),(29,7),(29,8),(29,9),(29,10),(29,11),(29,12),(29,13),(29,14),(29,15),(29,16),(29,17),(29,18),(29,19),(29,20),(29,21),(29,22),(29,23),(29,24),(29,25),(29,26),(29,27),(29,28),(29,29),(29,30),(29,31),(29,32),(30,7),(30,8),(30,14),(30,15),(30,16),(30,17),(30,18),(30,19),(30,20),(30,21),(30,22),(30,23),(30,24),(30,25),(30,26),(30,27),(31,1),(31,2),(31,3),(31,4),(31,5),(31,6),(31,7),(31,8),(31,9),(31,10),(31,11),(31,12),(31,13),(31,14),(31,15),(31,16),(31,17),(31,18),(31,19),(31,20),(31,21),(31,22),(31,23),(31,24),(31,25),(31,26),(31,27),(31,28),(31,29),(31,30),(31,31),(31,32),(32,7),(32,8),(32,14),(32,15),(32,16),(32,17),(32,18),(32,19),(32,20),(32,21),(32,22),(32,23),(32,24),(32,25),(32,26),(32,27),(33,7),(33,8),(33,14),(33,15),(33,16),(33,17),(33,18),(33,19),(33,20),(33,21),(33,22),(33,23),(33,24),(33,25),(33,26),(33,27),(34,7),(34,8),(34,14),(34,15),(34,16),(34,17),(34,18),(34,19),(34,20),(34,21),(34,22),(34,23),(34,24),(34,25),(34,26),(34,27),(35,7),(35,8),(35,14),(35,15),(35,16),(35,17),(35,18),(35,19),(35,20),(35,21),(35,22),(35,23),(35,24),(35,25),(35,26),(35,27),(36,1),(36,2),(36,3),(36,4),(36,5),(36,6),(36,7),(36,8),(36,9),(36,10),(36,11),(36,12),(36,13),(36,14),(36,15),(36,16),(36,17),(36,18),(36,19),(36,20),(36,21),(36,22),(36,23),(36,24),(36,25),(36,26),(36,27),(36,28),(36,29),(36,30),(36,31),(36,32);
/*!40000 ALTER TABLE `supplyCategoryNatures` ENABLE KEYS */;
UNLOCK TABLES;