CREATE VIEW purchaseOrderElementsPrice AS
SELECT p1.*,
       s.name AS supplierName
FROM purchaseorderelements p1
JOIN
  (SELECT denomination,
          matterReference,
          unit,
          MAX(DATE(poe.createdAt)) AS maxDate,
          COUNT(*) AS COUNT
   FROM purchaseorderelements poe
   LEFT JOIN supplycategories sc ON poe.supplyCategoryId = sc.id
   LEFT JOIN elementgroups eg ON sc.elementGroupId = eg.id
   LEFT JOIN categories c ON eg.categoryId = c.id
   WHERE c.name IN ("Poutrelle",
                    "Tôle",
                    "Tube")
   GROUP BY denomination,
            matterReference,
            unit) AS ss ON ss.denomination = p1.denomination
AND ss.matterReference = p1.matterReference
AND ss.unit = p1.unit
AND ss.maxDate = Date(p1.createdAt)
LEFT JOIN supplierofferelements soe ON soe.id = p1.supplierOfferElementId
LEFT JOIN supplieroffers so ON soe.supplierOfferId = so.id
LEFT JOIN suppliers s ON so.supplierId = s.id;

ALTER TABLE barsetGenerations DROP COLUMN lossPercent;
ALTER TABLE barsetGenerations
ADD COLUMN lossPercent DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN `amalgamsTotalLength` = 0 OR `amalgamsTotalLength` IS NULL THEN NULL
            ELSE ((`amalgamsTotalLength` - `partsTotalLength`) / `amalgamsTotalLength`) * 100
        END
   ) VIRTUAL;