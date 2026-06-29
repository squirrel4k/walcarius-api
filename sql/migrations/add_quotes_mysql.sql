-- Migration: remplace MongoDB par MySQL pour les quotes et quote_projects

CREATE TABLE IF NOT EXISTS `quote_projects` (
    `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(255)    NOT NULL,
    `reference`  VARCHAR(255)    NOT NULL,
    `customer`   VARCHAR(255)    NOT NULL,
    `createdAt`  INT             NULL,
    `updatedAt`  INT             NULL,
    `deletedAt`  INT             NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `quotes` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `name`              VARCHAR(255)    NOT NULL,
    `number`            VARCHAR(50)     NOT NULL,
    `reference`         VARCHAR(100)    NULL,
    `isEn1090`          TINYINT(1)      NOT NULL DEFAULT 0,
    `projectId`         INT UNSIGNED    NOT NULL,
    `status`            TINYINT         NOT NULL DEFAULT 0 COMMENT '0=CREATED,1=VALIDATED,2=SENT',
    `needSandblasting`  TINYINT(1)      NOT NULL DEFAULT 0,
    `needMetallization` TINYINT(1)      NOT NULL DEFAULT 0,
    `needLacquering`    TINYINT(1)      NOT NULL DEFAULT 0,
    `needPainting`      TINYINT(1)      NOT NULL DEFAULT 0,
    `needGalvanization` TINYINT(1)      NOT NULL DEFAULT 0,
    `remarks`           TEXT            NULL,
    `totalPrice`        FLOAT           NULL,
    `elements`          LONGTEXT        NULL COMMENT 'JSON: QuoteElement[]',
    `createdAt`         INT             NULL,
    `updatedAt`         INT             NULL,
    `deletedAt`         INT             NULL,
    PRIMARY KEY (`id`),
    KEY `idx_quotes_projectId` (`projectId`),
    KEY `idx_quotes_number` (`number`),
    CONSTRAINT `fk_quotes_projectId` FOREIGN KEY (`projectId`) REFERENCES `quote_projects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
