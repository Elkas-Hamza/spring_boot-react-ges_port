-- This script updates the passwords for the default users
-- New password hashes generated using BCrypt with strength 10

-- Update admin user password (admin123)
UPDATE `gestion_res`.`users` 
SET `password` = '$2a$10$dCIu5sZmJQgBBB8LMjfCr.i8jGIiJW9c/ZdJIlYRJWJfLj1t0Fiz6' 
WHERE `email` = 'admin@marsamaroc.co.ma';

-- Update regular user password (user123)
UPDATE `gestion_res`.`users` 
SET `password` = '$2a$10$jH7LIAGpyfZkR9CcO9XCLukxcQQMsthRwDQZ/FKP/zW9Qpd.EMtDy' 
WHERE `email` = 'user@marsamaroc.co.ma';

-- Verify updates
SELECT id, email, SUBSTR(password, 1, 12) AS password_prefix, LENGTH(password) AS password_length
FROM `gestion_res`.`users`
WHERE email IN ('admin@marsamaroc.co.ma', 'user@marsamaroc.co.ma'); 