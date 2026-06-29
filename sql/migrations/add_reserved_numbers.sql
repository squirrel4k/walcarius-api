-- Migration: replace Redis with MySQL for unique number reservation
-- Replaces the Redis sets: quoteNumbers, priceRequestReferences, purchaseOrderReferences

CREATE TABLE IF NOT EXISTS `reserved_numbers` (
    `id`       INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `type`     TINYINT         NOT NULL COMMENT '0=QUOTE, 1=PRICE_REQUEST, 2=PURCHASE_ORDER',
    `username` VARCHAR(255)    NOT NULL,
    `number`   VARCHAR(64)     NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_reserved_numbers_type_username` (`type`, `username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
