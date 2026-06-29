-- -----------------------------------------------------
-- Table `suppliers`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `supplierContacts`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierContacts`;
CREATE TABLE `supplierContacts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(30) DEFAULT NULL,
  `lastname` varchar(30) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `function` varchar(100) DEFAULT NULL,
  `isFavorite` tinyint(4) NOT NULL DEFAULT '0',
  `language` varchar(10) NOT NULL,
  `supplierId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_suppierContacts_suppliers_idx` (`supplierId`),
  CONSTRAINT `fk_suppierContacts_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `supplyCategories`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplyCategories`;
CREATE TABLE `supplyCategories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `parentSupplyCategoryId` int(10) unsigned DEFAULT NULL,
  `elementGroupId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_supplyCategories_supplyCategories_idx` (`parentSupplyCategoryId`),
  KEY `fk_supplyCategories_elementGroups_idx` (`elementGroupId`),
  CONSTRAINT `fk_supplyCategories_elementGroups` FOREIGN KEY (`elementGroupId`) REFERENCES `elementGroups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyCategories_supplyCategories` FOREIGN KEY (`parentSupplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table structure for table `supplyCategoriesSuppliers`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplyCategoriesSuppliers`;
CREATE TABLE `supplyCategoriesSuppliers` (
  `supplierId` int(10) unsigned NOT NULL,
  `supplyCategoryId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`supplierId`,`supplyCategoryId`),
  KEY `fk_supplyCategoriesSuppliers_supplyCategories_idx` (`supplyCategoryId`),
  CONSTRAINT `fk_supplyCategoriesSuppliers_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyCategoriesSuppliers_supplyCategories` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Data for table `supplyCategories`
-- -----------------------------------------------------

LOCK TABLES `supplyCategories` WRITE;
/*!40000 ALTER TABLE `supplyCategories` DISABLE KEYS */;
INSERT INTO `supplyCategories` VALUES (1,'Sous-traitant',NULL,NULL,'2019-04-17 16:08:13',NULL,NULL),(2,'Peinture achat',NULL,NULL,'2019-04-17 16:08:13',NULL,NULL),(3,'Petit outillage',NULL,NULL,'2019-04-17 16:08:13',NULL,NULL),(4,'Matériel soudure',NULL,NULL,'2019-04-17 16:08:13',NULL,NULL),(5,'Bardage',NULL,NULL,'2019-04-17 16:08:13',NULL,NULL),(6,'Location matériel',NULL,NULL,'2019-04-17 16:08:13',NULL,NULL),(7,'Poutrelle',NULL,NULL,'2019-04-17 16:08:14',NULL,NULL),(8,'Tube',NULL,NULL,'2019-04-17 16:08:14',NULL,NULL),(9,'Tôle',NULL,NULL,'2019-04-17 16:08:14',NULL,NULL),(10,'Boulonnerie',NULL,NULL,'2019-04-17 16:08:14',NULL,NULL),(11,'Peinture',1,NULL,'2019-04-17 16:11:37',NULL,NULL),(12,'Galvanisation',1,NULL,'2019-04-17 16:11:37',NULL,NULL),(13,'Fraisage',1,NULL,'2019-04-17 16:11:37',NULL,NULL),(14,'HEA',7,1,'2019-04-17 16:14:18',NULL,NULL),(15,'HEB',7,2,'2019-04-17 16:14:18',NULL,NULL),(16,'HEM',7,3,'2019-04-17 16:14:18',NULL,NULL),(17,'IPE',7,4,'2019-04-17 16:14:18',NULL,NULL),(18,'UPN',7,5,'2019-04-17 16:14:18',NULL,NULL),(19,'UPE',7,6,'2019-04-17 16:14:18',NULL,NULL),(20,'IPN',7,7,'2019-04-17 16:14:18',NULL,NULL),(21,'Cornière égale',7,8,'2019-04-17 16:14:18',NULL,NULL),(22,'Cornière inégale',7,9,'2019-04-17 16:14:18',NULL,NULL),(23,'T',7,10,'2019-04-17 16:14:18',NULL,NULL),(24,'U',7,11,'2019-04-17 16:14:18',NULL,NULL),(25,'Tube carré',8,12,'2019-04-17 16:14:19',NULL,NULL),(26,'Tube rectangle',8,13,'2019-04-17 16:14:19',NULL,NULL),(27,'Tube rond',8,19,'2019-04-17 16:14:19',NULL,NULL),(28,'S235',9,14,'2019-04-17 16:14:19','2019-04-19 09:42:04',NULL),(29,'S355',9,15,'2019-04-17 16:14:19','2019-04-19 09:42:04',NULL),(30,'INOX',9,16,'2019-04-17 16:14:19',NULL,NULL),(31,'Galva',9,17,'2019-04-17 16:14:19',NULL,NULL),(32,'Alu',9,18,'2019-04-17 16:14:19',NULL,NULL);
/*!40000 ALTER TABLE `supplyCategories` ENABLE KEYS */;
UNLOCK TABLES;