




CREATE DATABASE IF NOT EXISTS smart_crm
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE smart_crm;




DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id            CHAR(32)     NOT NULL,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(80)  NOT NULL DEFAULT 'Sales Executive',
  avatar_color  CHAR(7)      NOT NULL DEFAULT '#3B3486',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
  id            CHAR(32)     NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'Sales Executive',
  avatar_color  CHAR(7)      NOT NULL DEFAULT '#3B3486',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;




DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  id            CHAR(32)      NOT NULL,
  name          VARCHAR(150)  NOT NULL,
  email         VARCHAR(180)  NOT NULL,
  company       VARCHAR(180)  NOT NULL,
  phone         VARCHAR(30)   NOT NULL,
  location      VARCHAR(120)  NULL,
  industry      VARCHAR(80)   NULL,
  avatar_color  CHAR(7)       NOT NULL DEFAULT '#3B3486',
  churn_score   DECIMAL(5,4)  NOT NULL DEFAULT 0.0000,
  created_at    DATE          NOT NULL,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT uq_cust_email UNIQUE (email)
) ENGINE=InnoDB;




DROP TABLE IF EXISTS leads;
CREATE TABLE leads (
  id            CHAR(32)      NOT NULL,
  customer_id   CHAR(32)      NOT NULL,
  name          VARCHAR(200)  NOT NULL,
  company       VARCHAR(180)  NOT NULL,
  stage         ENUM('new','contacted','qualified','proposal','won','lost')
                              NOT NULL DEFAULT 'new',
  value         DECIMAL(14,2) NOT NULL DEFAULT 0,
  lead_score    DECIMAL(5,4)  NOT NULL DEFAULT 0.0000,
  assigned_to   CHAR(32)      NULL,
  notes         TEXT          NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated  DATE          NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_leads_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_leads_staff    FOREIGN KEY (assigned_to)
    REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;




DROP TABLE IF EXISTS deals;
CREATE TABLE deals (
  id                 CHAR(32)      NOT NULL,
  customer_id        CHAR(32)      NOT NULL,
  name               VARCHAR(200)  NOT NULL,
  stage              VARCHAR(40)   NOT NULL DEFAULT 'Discovery',
  value              DECIMAL(14,2) NOT NULL DEFAULT 0,
  win_probability    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expected_close     DATE          NULL,
  assigned_to        CHAR(32)      NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_win_pct CHECK (win_probability BETWEEN 0 AND 100),
  CONSTRAINT fk_deals_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_deals_staff    FOREIGN KEY (assigned_to)
    REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;




DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  id           CHAR(32)      NOT NULL,
  title        VARCHAR(200)  NOT NULL,
  description  TEXT          NULL,
  status       ENUM('todo','in_progress','done')
                             NOT NULL DEFAULT 'todo',
  priority     ENUM('low','medium','high')
                             NOT NULL DEFAULT 'medium',
  due_date     DATE          NULL,
  assignee     CHAR(32)      NULL,
  related_id   CHAR(32)      NULL,
  related_type VARCHAR(20)   NULL,
  created_at   DATE          NOT NULL,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_tasks_staff FOREIGN KEY (assignee)
    REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;




DROP TABLE IF EXISTS interactions;
CREATE TABLE interactions (
  id           CHAR(32)     NOT NULL,
  type         ENUM('note','call','meeting','email','task')
                            NOT NULL DEFAULT 'note',
  customer_id  CHAR(32)     NULL,
  title        VARCHAR(220) NOT NULL,
  description  TEXT         NULL,
  user_id      CHAR(32)     NULL,
  timestamp    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_inter_cust  FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_inter_staff FOREIGN KEY (user_id)
    REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB;




DROP TABLE IF EXISTS lead_scores;
CREATE TABLE lead_scores (
  id            BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
  lead_id       CHAR(32)      NOT NULL UNIQUE,
  score         DECIMAL(5,4)  NOT NULL DEFAULT 0,
  features_json JSON          NULL,
  scored_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_lscore_lead FOREIGN KEY (lead_id)
    REFERENCES leads(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS churn_scores;
CREATE TABLE churn_scores (
  id             BIGINT UNSIGNED AUTO_INCREMENT NOT NULL,
  customer_id    CHAR(32)      NOT NULL UNIQUE,
  score          DECIMAL(5,4)  NOT NULL DEFAULT 0,
  features_json  JSON          NULL,
  scored_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_cscore_cust FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;
