SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP SCHEMA IF EXISTS `gestion_res`;
CREATE SCHEMA IF NOT EXISTS `gestion_res` DEFAULT CHARACTER SET utf8;
USE `gestion_res`;


-- -----------------------------------------------------
-- Table `gestion_res`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`users` (
  `id` varchar(10) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'USER') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expiry` TIMESTAMP NULL,
  `last_login` TIMESTAMP NULL,
  `failed_login_attempts` INT DEFAULT 0,
  `account_locked` BOOLEAN DEFAULT FALSE,
  `account_locked_until` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `reset_token_idx` (`reset_token` ASC) VISIBLE
) ENGINE = InnoDB;

INSERT INTO users (id, email, password, role, created_at, updated_at, last_login, failed_login_attempts, account_locked)
VALUES ('USR-001', 'admin@marsamaroc.co.ma', '$2a$10$dCIu5sZmJQgBBB8LMjfCr.i8jGIiJW9c/ZdJIlYRJWJfLj1t0Fiz6', 'ADMIN', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 0, FALSE);

-- Insert regular user with generated ID
INSERT INTO users (id, email, password, role, created_at, updated_at, last_login, failed_login_attempts, account_locked)
VALUES ('USR-002', 'user@marsamaroc.co.ma', '$2a$10$jH7LIAGpyfZkR9CcO9XCLukxcQQMsthRwDQZ/FKP/zW9Qpd.EMtDy', 'USER', 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, 0, FALSE);


-- -----------------------------------------------------
-- Table `gestion_res`.`engin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`engin` (
  `ID_engin` VARCHAR(45) NOT NULL,
  `NOM_engin` VARCHAR(45) NOT NULL,
  `TYPE_engin` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID_engin`),
  UNIQUE INDEX `ID_engin_UNIQUE` (`ID_engin` ASC) VISIBLE,
  UNIQUE INDEX `NOM_engin_UNIQUE` (`NOM_engin` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`engin_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_engin`
BEFORE INSERT ON `gestion_res`.`engin`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_engin VARCHAR(45);
  INSERT INTO `gestion_res`.`engin_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_engin = CONCAT('ENG-', LPAD(next_num, 3, '0'));
  SET NEW.ID_engin = formatted_engin;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`personnel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`personnel` (
  `ID_personnel` INT NOT NULL AUTO_INCREMENT,
  `MATRICULE_personnel` VARCHAR(45) NOT NULL,
  `NOM_personnel` VARCHAR(45) NOT NULL,
  `PRENOM_personnel` VARCHAR(45) NOT NULL,
  `FONCTION_personnel` VARCHAR(45) NOT NULL,
  `CONTACT_personnel` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`ID_personnel`, `MATRICULE_personnel`),
  UNIQUE INDEX `ID_personnelle_UNIQUE` (`ID_personnel` ASC) VISIBLE,
  UNIQUE INDEX `MATRICULE_personnelle_UNIQUE` (`MATRICULE_personnel` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`matricule_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_personnel`
BEFORE INSERT ON `gestion_res`.`personnel`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_matricule VARCHAR(45);
  INSERT INTO `gestion_res`.`matricule_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_matricule = CONCAT('MARMA-', LPAD(next_num, 3, '0'));
  SET NEW.MATRICULE_personnel = formatted_matricule;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`soustraiteure`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`soustraiteure` (
  `ID_soustraiteure` INT NOT NULL AUTO_INCREMENT,
  `MATRICULE_soustraiteure` VARCHAR(45) NOT NULL,
  `NOM_soustraiteure` VARCHAR(45) NOT NULL,
  `PRENOM_soustraiteure` VARCHAR(45) NOT NULL,
  `FONCTION_soustraiteure` VARCHAR(45) NOT NULL,
  `CONTACT_soustraiteure` VARCHAR(45) NULL DEFAULT NULL,
  `ENTREPRISE_soustraiteure` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`ID_soustraiteure`, `MATRICULE_soustraiteure`),
  UNIQUE INDEX `ID_soustraiteure_UNIQUE` (`ID_soustraiteure` ASC) VISIBLE,
  UNIQUE INDEX `MATRICULE_sous_raiteur_UNIQUE` (`MATRICULE_soustraiteure` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`sous_matricule_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_soustraiteure`
BEFORE INSERT ON `gestion_res`.`soustraiteure`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_matricule VARCHAR(45);
  INSERT INTO `gestion_res`.`sous_matricule_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_matricule = CONCAT('SUSTR-', LPAD(next_num, 3, '0'));
  SET NEW.MATRICULE_soustraiteure = formatted_matricule;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`navire`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`navire` (
  `ID_navire` VARCHAR(45) NOT NULL,
  `NOM_navire` VARCHAR(256) NOT NULL,
  `MATRICULE_navire` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID_navire`),
  UNIQUE INDEX `ID_navire_UNIQUE` (`ID_navire` ASC) VISIBLE,
  UNIQUE INDEX `MATRICULE_navire_UNIQUE` (`MATRICULE_navire` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`navire_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_navire`
BEFORE INSERT ON `gestion_res`.`navire`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_navire VARCHAR(45);
  INSERT INTO `gestion_res`.`navire_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_navire = CONCAT('NAV-', LPAD(next_num, 3, '0'));
  SET NEW.ID_navire = formatted_navire;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`escale`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`escale` (
  `NUM_escale` VARCHAR(45) NOT NULL,
  `NOM_navire` VARCHAR(256) NOT NULL,
  `MATRICULE_navire` VARCHAR(45) NOT NULL,
  `DATE_accostage` DATETIME NOT NULL,
  `DATE_sortie` DATETIME NOT NULL,
  PRIMARY KEY (`NUM_escale`),
  UNIQUE INDEX `NUM_escale_UNIQUE` (`NUM_escale` ASC) VISIBLE,
  INDEX `NOM_navire_idx` (`NOM_navire` ASC) VISIBLE,
  INDEX `fk_escale_navire_idx` (`MATRICULE_navire` ASC) VISIBLE,
  CONSTRAINT `fk_escale_navire`
    FOREIGN KEY (`MATRICULE_navire`)
    REFERENCES `gestion_res`.`navire` (`MATRICULE_navire`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`num_escale_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_escale`
BEFORE INSERT ON `gestion_res`.`escale`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_num_escale VARCHAR(45);
  INSERT INTO `gestion_res`.`num_escale_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_num_escale = CONCAT('ESC-', LPAD(next_num, 3, '0'));
  SET NEW.NUM_escale = formatted_num_escale;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`shift`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`shift` (
  `ID_shift` VARCHAR(45) NOT NULL,
  `NOM_shift` VARCHAR(45) NOT NULL,
  `HEURE_debut` TIME NOT NULL,
  `HEURE_fin` TIME NOT NULL,
  PRIMARY KEY (`ID_shift`),
  UNIQUE INDEX `ID_shift_UNIQUE` (`ID_shift` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`shift_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_shift`
BEFORE INSERT ON `gestion_res`.`shift`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_shift VARCHAR(45);
  INSERT INTO `gestion_res`.`shift_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_shift = CONCAT('SH-', LPAD(next_num, 3, '0'));
  SET NEW.ID_shift = formatted_shift;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`equipe`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`equipe` (
  `ID_equipe` VARCHAR(45) NOT NULL,
  `NOM_equipe` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`ID_equipe`),
  UNIQUE INDEX `ID_equipe_UNIQUE` (`ID_equipe` ASC) VISIBLE,
  UNIQUE INDEX `NOM_equipe_UNIQUE` (`NOM_equipe` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`equipe_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_equipe`
BEFORE INSERT ON `gestion_res`.`equipe`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_equipe VARCHAR(45);
  INSERT INTO `gestion_res`.`equipe_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_equipe = CONCAT('EQ-', LPAD(next_num, 3, '0'));
  SET NEW.ID_equipe = formatted_equipe;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`operation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`operation` (
  `ID_operation` VARCHAR(45) NOT NULL,
  `TYPE_operation` VARCHAR(45) NOT NULL,
  `ID_shift` VARCHAR(45),
  `ID_escale` VARCHAR(45) NOT NULL,
  `ID_conteneure` TEXT NULL,
  `ID_engin` TEXT NULL,
  `ID_equipe` VARCHAR(45) NOT NULL,
  `DATE_debut` DATETIME NOT NULL,
  `DATE_fin` DATETIME NOT NULL,
  `status` VARCHAR(45) NULL DEFAULT 'En cours',
  PRIMARY KEY (`ID_operation`),
  UNIQUE INDEX `ID_operation_UNIQUE` (`ID_operation` ASC) VISIBLE,
  INDEX `ID_shift_idx` (`ID_shift` ASC) VISIBLE,
  INDEX `ID_escale_idx` (`ID_escale` ASC) VISIBLE,
  INDEX `ID_equipe_idx` (`ID_equipe` ASC) VISIBLE,
  CONSTRAINT `ID_shift`
    FOREIGN KEY (`ID_shift`)
    REFERENCES `gestion_res`.`shift` (`ID_shift`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `ID_escale`
    FOREIGN KEY (`ID_escale`)
    REFERENCES `gestion_res`.`escale` (`NUM_escale`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `ID_equipe`
    FOREIGN KEY (`ID_equipe`)
    REFERENCES `gestion_res`.`equipe` (`ID_equipe`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`operation_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_operation`
BEFORE INSERT ON `gestion_res`.`operation`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_operation VARCHAR(45);
  INSERT INTO `gestion_res`.`operation_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_operation = CONCAT('OP-', LPAD(next_num, 3, '0'));
  SET NEW.ID_operation = formatted_operation;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`arret`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`arret` (
  `ID_arret` VARCHAR(45) NOT NULL,
  `ID_operation` VARCHAR(45),
  `NUM_escale` VARCHAR(45) NOT NULL,
  `MOTIF_arret` VARCHAR(256) NOT NULL,
  `DURE_arret` INT NOT NULL,
  `DATE_DEBUT_arret` DATETIME NOT NULL,
  `DATE_FIN_arret` DATETIME NOT NULL,
  PRIMARY KEY (`ID_arret`),
  UNIQUE INDEX `ID_arret_UNIQUE` (`ID_arret` ASC) VISIBLE,
  INDEX `NUM_escale_idx` (`NUM_escale` ASC) VISIBLE,
  INDEX `ID_operation_idx` (`ID_operation` ASC) VISIBLE,
  CONSTRAINT `fk_arret_num_escale`
    FOREIGN KEY (`NUM_escale`)
    REFERENCES `gestion_res`.`escale` (`NUM_escale`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_arret_id_operation`
    FOREIGN KEY (`ID_operation`)
    REFERENCES `gestion_res`.`operation`(`ID_operation`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`arret_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_arret`
BEFORE INSERT ON `gestion_res`.`arret`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_arret VARCHAR(45);
  INSERT INTO `gestion_res`.`arret_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_arret = CONCAT('AR-', LPAD(next_num, 3, '0'));
  SET NEW.ID_arret = formatted_arret;
END$$
DELIMITER ;



-- -----------------------------------------------------
-- Table `gestion_res`.`conteneure`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`conteneure` (
  `ID_conteneure` VARCHAR(45) NOT NULL,
  `NOM_conteneure` VARCHAR(45) NOT NULL,
  `TYPE_conteneure` VARCHAR(45) NOT NULL,
  `ID_type` INT NULL,
  `ID_navire` VARCHAR(45) NULL,
  `DATE_AJOUT` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `DERNIERE_OPERATION` VARCHAR(45) NULL,
  PRIMARY KEY (`ID_conteneure`),
  UNIQUE INDEX `ID_conteneure_UNIQUE` (`ID_conteneure` ASC) VISIBLE,
  INDEX `fk_conteneure_navire_idx` (`ID_navire` ASC) VISIBLE,
  INDEX `fk_conteneure_operation_idx` (`DERNIERE_OPERATION` ASC) VISIBLE,
  CONSTRAINT `fk_conteneure_navire`
    FOREIGN KEY (`ID_navire`)
    REFERENCES `gestion_res`.`navire` (`ID_navire`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_conteneure_operation`
    FOREIGN KEY (`DERNIERE_OPERATION`)
    REFERENCES `gestion_res`.`operation` (`ID_operation`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`conteneure_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_conteneure`
BEFORE INSERT ON `gestion_res`.`conteneure`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_conteneure VARCHAR(45);
  INSERT INTO `gestion_res`.`conteneure_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_conteneure = CONCAT('CTR-', LPAD(next_num, 3, '0'));
  SET NEW.ID_conteneure = formatted_conteneure;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`motif`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`motif` (
  `ID_motif` VARCHAR(45) NOT NULL,
  `NOM_motif` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID_motif`),
  UNIQUE INDEX `ID_motif_UNIQUE` (`ID_motif` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `gestion_res`.`motif_counter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

DELIMITER $$
CREATE TRIGGER `before_insert_motif`
BEFORE INSERT ON `gestion_res`.`motif`
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE formatted_motif VARCHAR(45);
  INSERT INTO `gestion_res`.`motif_counter` VALUES ();
  SET next_num = LAST_INSERT_ID();
  SET formatted_motif = CONCAT('MOT-', LPAD(next_num, 3, '0'));
  SET NEW.ID_motif = formatted_motif;
END$$
DELIMITER ;

-- -----------------------------------------------------
-- Table `gestion_res`.`equipe_has_personnel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`equipe_has_personnel` (
  `equipe_ID_equipe` VARCHAR(45) ,
  `personnel_ID_personnel` INT ,
  `personnel_MATRICULE_personnel` VARCHAR(45) ,
  PRIMARY KEY (`equipe_ID_equipe`, `personnel_ID_personnel`, `personnel_MATRICULE_personnel`),
  INDEX `fk_equipe_has_personnel_personnel1_idx` (`personnel_ID_personnel` ASC, `personnel_MATRICULE_personnel` ASC) VISIBLE,
  INDEX `fk_equipe_has_personnel_equipe1_idx` (`equipe_ID_equipe` ASC) VISIBLE,
  CONSTRAINT `fk_equipe_has_personnel_equipe1`
    FOREIGN KEY (`equipe_ID_equipe`)
    REFERENCES `gestion_res`.`equipe` (`ID_equipe`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_equipe_has_personnel_personnel1`
    FOREIGN KEY (`personnel_ID_personnel`, `personnel_MATRICULE_personnel`)
    REFERENCES `gestion_res`.`personnel` (`ID_personnel`, `MATRICULE_personnel`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `gestion_res`.`equipe_has_soustraiteure`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gestion_res`.`equipe_has_soustraiteure` (
  `equipe_ID_equipe` VARCHAR(45) ,
  `soustraiteure_ID_soustraiteure` INT,
  `soustraiteure_MATRICULE_soustraiteure` VARCHAR(45) ,
  PRIMARY KEY (`equipe_ID_equipe`, `soustraiteure_ID_soustraiteure`, `soustraiteure_MATRICULE_soustraiteure`),
  INDEX `fk_equipe_has_soustraiteure_soustraiteure1_idx` (`soustraiteure_ID_soustraiteure` ASC, `soustraiteure_MATRICULE_soustraiteure` ASC) VISIBLE,
  INDEX `fk_equipe_has_soustraiteure_equipe1_idx` (`equipe_ID_equipe` ASC) VISIBLE,
  CONSTRAINT `fk_equipe_has_soustraiteure_equipe1`
    FOREIGN KEY (`equipe_ID_equipe`)
    REFERENCES `gestion_res`.`equipe` (`ID_equipe`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_equipe_has_soustraiteure_soustraiteure1`
    FOREIGN KEY (`soustraiteure_ID_soustraiteure`, `soustraiteure_MATRICULE_soustraiteure`)
    REFERENCES `gestion_res`.`soustraiteure` (`ID_soustraiteure`, `MATRICULE_soustraiteure`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
