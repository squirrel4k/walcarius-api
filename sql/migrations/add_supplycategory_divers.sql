-- insert category divers in db

INSERT INTO `supplyCategories` VALUES (45,'Divers',NULL,NULL,'2022-11-24 09:08:13',NULL,NULL);

-- insert nature of category divers in db
INSERT INTO `supplyCategoryNatures` (`natureId`, `supplyCategoryId`) VALUES 
(31,45),
(29,45),
(36,45),
(40,45);