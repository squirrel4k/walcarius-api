ALTER TABLE supplierOfferAdditionnalCosts
  ADD `denomination` varchar(255) DEFAULT NULL,
  ADD `quantity` int(10) unsigned NOT NULL DEFAULT 1,
  ADD `unit` varchar(100) DEFAULT NULL,
  ADD `inputPrice` decimal(10,3) DEFAULT NULL;