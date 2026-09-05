





USE smart_crm;






CREATE DATABASE IF NOT EXISTS smart_crm
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE smart_crm;


CREATE TABLE IF NOT EXISTS staff (
  id            CHAR(32)     NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  role          VARCHAR(50)  NOT NULL DEFAULT 'Sales Executive',
  avatar_color  CHAR(7)      NOT NULL DEFAULT '#3B3486',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;


ALTER TABLE staff
  ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER avatar_color;

ALTER TABLE staff
  ADD INDEX idx_staff_role (role);












INSERT INTO staff (id, name, email, role, avatar_color) VALUES
('s6','Ishita Verma','ishita@smartcrm.io','SDR','#D53F8C');


INSERT INTO staff (id, name, email, role, avatar_color) VALUES
('s1','Aarav Sharma','aarav@smartcrm.io','Sales Manager','#3B3486'),
('s2','Priya Patel','priya@smartcrm.io','Account Executive','#0E8388')
ON DUPLICATE KEY UPDATE
  name         = VALUES(name),
  role         = VALUES(role),
  avatar_color = VALUES(avatar_color);


INSERT INTO customers
  (id, name, email, company, phone, location, industry, avatar_color, churn_score, created_at)
VALUES
  ('c11','Ritika Joshi','ritika@aify.io','AI For You Labs','+91 98888 12345',
   'Gurgaon, IN','AI','#805AD5', 0.17, CURDATE());


INSERT INTO leads
  (id, customer_id, name, company, stage, value, lead_score, assigned_to, last_updated, notes)
VALUES
  ('l13','c11','AI Ops Pilot','AI For You Labs','new', 260000, 0.68, 's3', CURDATE(),
   'Initial demo booked for next Thursday.');


INSERT INTO deals
  (id, customer_id, name, stage, value, win_probability, expected_close, assigned_to)
VALUES
  ('d11','c11','AI Ops Pilot - 1yr','Discovery', 260000, 20, DATE_ADD(CURDATE(), INTERVAL 60 DAY), 's3');


INSERT INTO tasks
  (id, title, description, status, priority, due_date, assignee, related_id, related_type, created_at)
VALUES
  ('t13','Demo prep for AI For You Labs','Create 30-min custom deck using customer website content.',
   'todo','high', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 's3', 'l13','lead', CURDATE());


INSERT INTO interactions (type, customer_id, title, description, user_id, timestamp) VALUES
('email','c11','Intro + agenda sent','Shared proposed AI Ops pilot agenda with Ritika.', 's3', NOW());


INSERT INTO lead_scores (lead_id, score, features_json)
VALUES ('l13', 0.68, JSON_OBJECT('industry','AI','days_since_create',0))
ON DUPLICATE KEY UPDATE
  score         = VALUES(score),
  features_json = VALUES(features_json),
  scored_at     = NOW();


INSERT INTO churn_scores (customer_id, score, features_json)
VALUES ('c11', 0.17, JSON_OBJECT('industry','AI','tenure_days',0))
ON DUPLICATE KEY UPDATE
  score         = VALUES(score),
  features_json = VALUES(features_json),
  scored_at     = NOW();







SELECT * FROM staff ORDER BY created_at DESC;
SELECT id, name, company, email, churn_score FROM customers LIMIT 10;


SELECT name, company, value, stage, lead_score
FROM leads
WHERE stage IN ('qualified','proposal')
  AND lead_score >= 0.70
ORDER BY value DESC
LIMIT 20;


SELECT c.name, c.company, c.email, c.industry
FROM customers c
WHERE c.name LIKE '%Vikram%' OR c.company LIKE '%Tech%' OR c.email LIKE '%@%';


SELECT
  COUNT(*)                              AS total_leads,
  ROUND(SUM(value))                     AS total_pipeline_value,
  ROUND(AVG(lead_score) * 100, 1)       AS avg_lead_score_pct,
  SUM(stage = 'won')                    AS won_count,
  SUM(stage = 'lost')                   AS lost_count
FROM leads;


SELECT stage,
       COUNT(*)                 AS lead_count,
       ROUND(SUM(value),0)     AS total_value,
       ROUND(AVG(lead_score)*100,1) AS avg_score_pct
FROM leads
GROUP BY stage
ORDER BY FIELD(stage,'new','contacted','qualified','proposal','won','lost');


SELECT
  l.id        AS lead_id,
  l.name      AS lead_name,
  l.stage,
  l.value,
  l.lead_score,
  c.name      AS contact_name,
  c.company,
  c.industry,
  s.name      AS owner,
  s.role      AS owner_role
FROM leads l
JOIN customers c ON c.id = l.customer_id
LEFT JOIN staff s      ON s.id = l.assigned_to
WHERE l.stage NOT IN ('lost')
ORDER BY l.value DESC;


SELECT
  c.name AS customer,
  c.company,
  c.churn_score,
  COUNT(DISTINCT l.id)  AS open_leads,
  COUNT(DISTINCT d.id)  AS open_deals,
  COALESCE(SUM(d.value),0)       AS total_deal_value,
  MAX(i.timestamp)               AS last_contact
FROM customers c
LEFT JOIN leads l ON l.customer_id = c.id AND l.stage <> 'lost'
LEFT JOIN deals d ON d.customer_id = c.id AND d.stage <> 'Closed Lost'
LEFT JOIN interactions i ON i.customer_id = c.id
GROUP BY c.id, c.name, c.company, c.churn_score
ORDER BY c.churn_score DESC;


SELECT
  s.id, s.name, s.role,
  SUM(CASE WHEN d.stage = 'Closed Won' AND MONTH(d.expected_close) = MONTH(CURDATE())
           THEN d.value ELSE 0 END) AS closed_this_month
FROM staff s
LEFT JOIN deals d ON d.assigned_to = s.id
GROUP BY s.id, s.name, s.role
ORDER BY closed_this_month DESC
LIMIT 3;


SELECT
  c.name AS customer,
  d.name AS deal,
  d.value,
  d.stage,
  RANK() OVER (PARTITION BY d.customer_id ORDER BY d.value DESC) AS deal_rank
FROM deals d
JOIN customers c ON c.id = d.customer_id;


SELECT * FROM monthly_revenue ORDER BY month;
SELECT * FROM funnel_summary;
SELECT * FROM customer_health  WHERE risk_tier IN ('Critical','At Risk');
SELECT * FROM rep_performance;







UPDATE customers
   SET churn_score = 0.24,
       updated_at  = NOW()
 WHERE id = 'c11';


UPDATE leads
   SET stage        = 'contacted',
       last_updated = CURDATE()
 WHERE id = 'l13';


UPDATE deals
   SET win_probability = 45,
       expected_close  = DATE_ADD(expected_close, INTERVAL 7 DAY)
 WHERE id = 'd11';


UPDATE tasks
   SET status = CASE
                  WHEN status = 'todo'        THEN 'in_progress'
                  WHEN status = 'in_progress' THEN 'done'
                  ELSE 'todo'
                END,
       updated_at = NOW()
 WHERE id = 't13';


UPDATE tasks
   SET assignee   = 's2',
       updated_at = NOW()
 WHERE assignee = 's6';


UPDATE churn_scores
   SET score = LEAST(GREATEST(
           0.05 + IFNULL(features_json->>'$.tenure_days',0) * 0.0001,
           0),1),
       scored_at = NOW()
 WHERE customer_id = 'c11';







ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted TINYINT(1) NOT NULL DEFAULT 0;
UPDATE customers SET deleted = 1, updated_at = NOW() WHERE id = 'c11';


DELETE FROM tasks
 WHERE id = 't13'
 LIMIT 1;


DELETE FROM leads
 WHERE stage = 'lost'
   AND last_updated < DATE_SUB(CURDATE(), INTERVAL 90 DAY);



UPDATE leads SET assigned_to = NULL WHERE assigned_to = 's6';
UPDATE deals SET assigned_to = NULL WHERE assigned_to = 's6';
UPDATE tasks SET assignee    = NULL WHERE assignee    = 's6';
UPDATE interactions SET user_id = NULL WHERE user_id = 's6';
DELETE FROM staff WHERE id = 's6' LIMIT 1;







ALTER TABLE customers
  ADD COLUMN account_manager CHAR(32) NULL AFTER churn_score,
  ADD CONSTRAINT fk_cust_am FOREIGN KEY (account_manager)
      REFERENCES staff(id) ON DELETE SET NULL,
  ADD INDEX idx_cust_am (account_manager);


ALTER TABLE deals
  MODIFY COLUMN stage VARCHAR(60) NOT NULL DEFAULT 'Discovery';


ALTER TABLE interactions
  MODIFY COLUMN title VARCHAR(220)
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;


ALTER TABLE staff
  DROP COLUMN is_active,
  DROP INDEX idx_staff_role;







DELIMITER $$
DROP PROCEDURE IF EXISTS advance_lead$$
CREATE PROCEDURE advance_lead(IN p_lead_id CHAR(32))
BEGIN
  DECLARE cur ENUM('new','contacted','qualified','proposal','won','lost');
  SELECT stage INTO cur FROM leads WHERE id = p_lead_id;
  SET @next = CASE cur
        WHEN 'new'       THEN 'contacted'
        WHEN 'contacted' THEN 'qualified'
        WHEN 'qualified' THEN 'proposal'
        WHEN 'proposal'  THEN 'won'
        ELSE cur END;
  UPDATE leads SET stage = @next, last_updated = CURDATE() WHERE id = p_lead_id;
  SELECT * FROM leads WHERE id = p_lead_id;
END$$
DELIMITER ;



DELIMITER $$
DROP TRIGGER IF EXISTS trg_lead_after_update$$
CREATE TRIGGER trg_lead_after_update AFTER UPDATE ON leads
FOR EACH ROW BEGIN
  IF OLD.stage <> NEW.stage THEN
    UPDATE customers SET updated_at = NOW() WHERE id = NEW.customer_id;
    INSERT INTO interactions (type, customer_id, title, user_id, timestamp)
    VALUES ('note', NEW.customer_id,
            CONCAT('Lead moved to ', NEW.stage, ': ', NEW.name),
            NEW.assigned_to, NOW());
  END IF;
END$$
DELIMITER ;
