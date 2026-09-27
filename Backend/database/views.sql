



USE smart_crm;

DROP VIEW IF EXISTS monthly_revenue;
CREATE VIEW monthly_revenue AS
SELECT
  DATE_FORMAT(expected_close, '%Y-%m') AS month,
  DATE_FORMAT(expected_close, '%b')    AS month_label,
  COUNT(*)                              AS deal_count,
  ROUND(SUM(value * win_probability / 100)) AS weighted_value,
  SUM(CASE WHEN stage = 'Closed Won' THEN value ELSE 0 END) AS won_value,
  SUM(value)                            AS pipeline_value
FROM deals
WHERE expected_close IS NOT NULL
GROUP BY DATE_FORMAT(expected_close, '%Y-%m'), DATE_FORMAT(expected_close, '%b')
ORDER BY month;

DROP VIEW IF EXISTS funnel_summary;
CREATE VIEW funnel_summary AS
SELECT
  stage,
  COUNT(*)                           AS lead_count,
  ROUND(SUM(value))                  AS total_value,
  ROUND(COUNT(*) * 100 / (SELECT COUNT(*) FROM leads)) AS pct_of_leads
FROM leads
GROUP BY stage
ORDER BY FIELD(stage,'new','contacted','qualified','proposal','won','lost');

DROP VIEW IF EXISTS customer_health;
CREATE VIEW customer_health AS
SELECT
  c.id            AS customer_id,
  c.name,
  c.company,
  c.churn_score,
  COUNT(DISTINCT l.id)              AS open_leads,
  COUNT(DISTINCT d.id)              AS active_deals,
  COALESCE(SUM(d.value), 0)         AS total_pipeline,
  MAX(i.timestamp)                  AS last_interaction,
  CASE
    WHEN c.churn_score >= 0.40 THEN 'Critical'
    WHEN c.churn_score >= 0.25 THEN 'At Risk'
    WHEN c.churn_score >= 0.10 THEN 'Monitor'
    ELSE 'Healthy'
  END AS risk_tier
FROM customers c
LEFT JOIN leads l
       ON l.customer_id = c.id AND l.stage NOT IN ('lost')
LEFT JOIN deals d
       ON d.customer_id = c.id AND d.stage NOT IN ('Closed Lost')
LEFT JOIN interactions i
       ON i.customer_id = c.id
GROUP BY c.id, c.name, c.company, c.churn_score
ORDER BY c.churn_score DESC;

DROP VIEW IF EXISTS rep_performance;
CREATE VIEW rep_performance AS
SELECT
  s.id          AS staff_id,
  s.name        AS rep_name,
  s.role,
  COUNT(DISTINCT l.id)                         AS lead_count,
  COUNT(DISTINCT d.id)                         AS deal_count,
  COALESCE(SUM(CASE WHEN l.stage = 'won'  THEN l.value ELSE 0 END), 0) AS won_lead_value,
  COALESCE(SUM(CASE WHEN d.stage = 'Closed Won' THEN d.value ELSE 0 END), 0) AS won_deal_value,
  SUM(CASE WHEN t.status <> 'done' AND t.assignee = s.id THEN 1 ELSE 0 END) AS open_tasks
FROM staff s
LEFT JOIN leads l ON l.assigned_to = s.id
LEFT JOIN deals d ON d.assigned_to = s.id
LEFT JOIN tasks t ON t.assignee   = s.id
GROUP BY s.id, s.name, s.role
ORDER BY won_deal_value DESC;
