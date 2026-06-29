-- Migration for supplyCategoryNatures
-- -----------------------------------------------------
INSERT INTO `natures` (`id`, `name`, `type`, `nullable`, `redefine`) VALUES
(41, "basicQuantityUnit", "STRING", 1, 1);


-- Migration for supplyCategoryNatures
-- -----------------------------------------------------
INSERT INTO `supplyCategoryNatures` (`natureId`, `supplyCategoryId`) VALUES
(41, 1), (41, 2), (41, 3), (41, 4), (41, 5), (41, 6), (41, 10), (41, 11),
(41, 12), (41, 13), (41, 33), (41, 34), (41, 35), (41, 36);


-- Migration for supplyLists
-- -----------------------------------------------------
ALTER TABLE `supplyLists` ADD INDEX `fk_supplyList_priceRequests_idx` (`priceRequestId` ASC) VISIBLE;
ALTER TABLE `supplyLists` ADD CONSTRAINT `fk_supplyList_priceRequests`
  FOREIGN KEY (`priceRequestId`)
  REFERENCES `priceRequests` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


-- Migration for amalgamGroups
-- -----------------------------------------------------
ALTER TABLE `amalgamGroups` ADD COLUMN `isManual` TINYINT NOT NULL DEFAULT 0 AFTER `isCut`;


-- Migration for supplyListElements
-- -----------------------------------------------------
UPDATE
	supplyListElements SET format = REPLACE(format, ',', '.')
WHERE
	supplyCategoryId IN (7, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 8, 25, 26, 27)
    AND format LIKE "%,%";
    

-- Migration for priceRequests
-- -----------------------------------------------------
ALTER TABLE `priceRequests` ADD COLUMN `isDone` TINYINT NOT NULL DEFAULT 0 AFTER `isValidated`;


-- Migration for supplyCategories
-- -----------------------------------------------------
INSERT INTO `supplyCategories` (`id`, `name`, `parentSupplyCategoryId`, `elementGroupId`) VALUES
(37, "Métaillisation", 1, NULL),
(38, "Anodisation", 1, NULL),
(39, "Grenaillage", 1, NULL),
(40, "Oxycoupage", 1, NULL),
(41, "Bois", NULL, NULL),
(42, "Verre", NULL, NULL),
(43, "Accessoires de montage", NULL, NULL);

UPDATE `supplyCategories` SET name = "Fraisage / Usinage" WHERE id = 13;
UPDATE `supplyCategories` SET name = "Levage et manutention" WHERE id = 34;
UPDATE `supplyCategories` SET name = "Outillage" WHERE id = 35;


-- Migration for supplyCategoryNatures
-- -----------------------------------------------------
INSERT INTO `supplyCategoryNatures` (`natureId`, `supplyCategoryId`) VALUES
(29, 37), (29, 38), (29, 39), (29, 40), (29,41), (29, 42), (29, 43),
(31, 37), (31, 38), (31, 39), (31, 40), (31,41), (31, 42), (31, 43),
(36, 37), (36, 38), (36, 39), (36, 40), (36,41), (36, 42), (36, 43),
(41, 37), (41, 38), (41, 39), (41, 40), (41,41), (41, 42), (41, 43);



-- Migration for supplyCategories
-- -----------------------------------------------------
INSERT INTO `supplyCategories` (`id`, `name`, `parentSupplyCategoryId`, `elementGroupId`) VALUES
(44, "Tôles d’usures", 9, NULL);


-- Migration for supplyCategoryNatures
-- -----------------------------------------------------
INSERT INTO `supplyCategoryNatures` (`natureId`, `supplyCategoryId`) VALUES
(30, 44), (31, 44), (36, 44), (37, 44), (38, 44), (39, 44), (40, 44);


-- Migration for supplierMatters
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplierMatters`;
CREATE TABLE `supplierMatters` (
  `supplierId` int(10) unsigned NOT NULL,
  `matterId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`supplierId`,`matterId`),
  KEY `fk_supplierMatters_matters_idx` (`matterId`),
  KEY `fk_supplierMatters_suppliers_idx` (`supplierId`),
  CONSTRAINT `fk_supplierMatters_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierMatters_matters` FOREIGN KEY (`matterId`) REFERENCES `matters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Needs Manual operation
-- -----------------------------------------------------
-- Set En1090 to missing plates
SELECT
	GROUP_CONCAT(DISTINCT poe.id SEPARATOR ", ")
FROM
	purchaseOrderElements poe
    LEFT JOIN supplierOfferElements soe ON poe.supplierOfferElementId = soe.id
    LEFT JOIN priceRequestElements pre ON soe.priceRequestElementId = pre.id
    LEFT JOIN supplyListElements sle ON pre.supplyListElementId = sle.id
    LEFT JOIN supplyLists sl ON sle.supplyListId = sl.id
    LEFT JOIN projects p ON sl.projectId = p.id
WHERE
	poe.supplyCategoryId IN (9, 28, 29, 30, 31, 32)
    AND p.isEn1090 = 1;
  
UPDATE purchaseOrderElements SET isEn1090 = 1 WHERE id IN ([RESULT]);

-- Need manual re-delete of already deleted PriceRequests to clean all remaining elements