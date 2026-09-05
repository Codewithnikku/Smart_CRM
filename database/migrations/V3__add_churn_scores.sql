



USE smart_crm;

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

CREATE INDEX idx_cscore_score ON churn_scores (score DESC);
