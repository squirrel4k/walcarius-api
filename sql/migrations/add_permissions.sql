ALTER TABLE `logins` ADD 
`userGroup` VARCHAR(30) CHARACTER SET utf8 COLLATE utf8_general_ci
NOT NULL DEFAULT 'workshop' AFTER `resetToken`;

UPDATE `logins` SET `userGroup` = 'administrator' WHERE isAdmin = 1;