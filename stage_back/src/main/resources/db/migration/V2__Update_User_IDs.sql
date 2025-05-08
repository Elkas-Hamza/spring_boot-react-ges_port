-- Rename original users table to users_old
RENAME TABLE users TO users_old;

-- Create new users table with string ID
CREATE TABLE users (
  id VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry TIMESTAMP NULL,
  last_login TIMESTAMP NULL,
  failed_login_attempts INT DEFAULT 0,
  account_locked BOOLEAN DEFAULT FALSE,
  account_locked_until TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE,
  INDEX reset_token_idx (reset_token ASC) VISIBLE
) ENGINE = InnoDB;

-- Insert admin user with generated ID
INSERT INTO users (id, email, password, role, created_at, updated_at, last_login, failed_login_attempts, account_locked)
VALUES ('USR-001', 'admin@marsamaroc.co.ma', '$2a$10$dCIu5sZmJQgBBB8LMjfCr.i8jGIiJW9c/ZdJIlYRJWJfLj1t0Fiz6', 'ADMIN', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 0, FALSE);

-- Insert regular user with generated ID
INSERT INTO users (id, email, password, role, created_at, updated_at, last_login, failed_login_attempts, account_locked)
VALUES ('USR-002', 'user@marsamaroc.co.ma', '$2a$10$jH7LIAGpyfZkR9CcO9XCLukxcQQMsthRwDQZ/FKP/zW9Qpd.EMtDy', 'USER', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 0, FALSE);

-- Copy existing users (besides the default ones) from the old table
-- This is commented out as we need to handle the ID conversion separately if there are existing users
-- INSERT INTO users (...) 