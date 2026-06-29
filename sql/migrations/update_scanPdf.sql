ALTER TABLE scanPdf ADD createdAt timestamp DEFAULT current_timestamp() NOT NULL;
ALTER TABLE scanPdf ADD comment text DEFAULT NULL AFTER url;
