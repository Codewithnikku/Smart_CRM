



USE smart_crm;

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

CREATE INDEX idx_lscore_score ON lead_scores (score DESC);
