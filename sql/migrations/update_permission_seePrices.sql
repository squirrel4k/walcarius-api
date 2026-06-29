ALTER TABLE permission CHANGE readPrice seePrices BOOL DEFAULT 0 NOT NULL;
DELETE FROM permission WHERE category='see-prices';