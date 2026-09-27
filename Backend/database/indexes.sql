



USE smart_crm;


CREATE INDEX idx_cust_company    ON customers (company);
CREATE INDEX idx_cust_industry   ON customers (industry);
CREATE INDEX idx_cust_churn      ON customers (churn_score DESC);
CREATE INDEX idx_cust_created    ON customers (created_at DESC);


CREATE INDEX idx_leads_stage     ON leads (stage);
CREATE INDEX idx_leads_value     ON leads (value DESC);
CREATE INDEX idx_leads_customer  ON leads (customer_id);
CREATE INDEX idx_leads_assigned  ON leads (assigned_to);
CREATE INDEX idx_leads_updated   ON leads (last_updated DESC);
CREATE INDEX idx_leads_composite ON leads (stage, assigned_to, value DESC);


CREATE INDEX idx_deals_stage        ON deals (stage);
CREATE INDEX idx_deals_customer     ON deals (customer_id);
CREATE INDEX idx_deals_expected     ON deals (expected_close);
CREATE INDEX idx_deals_value        ON deals (value DESC);
CREATE INDEX idx_deals_pipeline     ON deals (stage, expected_close, win_probability DESC);


CREATE INDEX idx_tasks_status    ON tasks (status);
CREATE INDEX idx_tasks_priority  ON tasks (priority DESC);
CREATE INDEX idx_tasks_assignee  ON tasks (assignee);
CREATE INDEX idx_tasks_due       ON tasks (due_date);
CREATE INDEX idx_tasks_work      ON tasks (assignee, status, due_date);


CREATE INDEX idx_inter_customer  ON interactions (customer_id, timestamp DESC);
CREATE INDEX idx_inter_user      ON interactions (user_id);
CREATE INDEX idx_inter_time      ON interactions (timestamp DESC);
CREATE INDEX idx_inter_type      ON interactions (type);


CREATE INDEX idx_lscore_score    ON lead_scores (score DESC);
CREATE INDEX idx_cscore_score    ON churn_scores (score DESC);
