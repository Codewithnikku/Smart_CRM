



USE smart_crm;


INSERT INTO staff (id, name, email, password_hash, role, avatar_color) VALUES
('s1','Aarav Sharma','aarav@smartcrm.io','smartcrm123','Sales Manager','#3B3486'),
('s2','Priya Patel','priya@smartcrm.io','smartcrm123','Account Executive','#0E8388'),
('s3','Rohan Mehta','rohan@smartcrm.io','smartcrm123','SDR','#C05621'),
('s4','Ananya Desai','ananya@smartcrm.io','smartcrm123','CSM','#805AD5'),
('s5','Karan Kapoor','karan@smartcrm.io','smartcrm123','Account Executive','#B7791F');


INSERT INTO customers (id, name, email, company, phone, location, industry, avatar_color, churn_score, created_at) VALUES
('c1','Vikram Singh','vikram@tecnova.in','Tecnova Solutions','+91 98210 11234','Bangalore, IN','SaaS','#3B3486', 0.12,'2025-09-12'),
('c2','Neha Gupta','neha@quantumretail.com','Quantum Retail','+91 99887 65432','Mumbai, IN','E-commerce','#0E8388',0.08,'2025-08-03'),
('c3','Arjun Rao','arjun@helixhealth.com','Helix Health Systems','+91 98123 45678','Hyderabad, IN','Healthcare','#C05621',0.38,'2025-07-21'),
('c4','Mira Iyer','mira@finvista.in','FinVista Capital','+91 90123 54321','Delhi, IN','FinTech','#805AD5',0.05,'2025-10-01'),
('c5','Rahul Verma','rahul@buildmat.in','BuildMat Industries','+91 97654 32100','Pune, IN','Manufacturing','#B7791F',0.52,'2025-06-18'),
('c6','Sneha Nair','sneha@logispeed.net','LogiSpeed Logistics','+91 98333 22111','Chennai, IN','Logistics','#3182CE',0.21,'2025-09-28'),
('c7','Aditya Jain','aditya@edumax.ac.in','EduMax Academy','+91 99911 44777','Jaipur, IN','EdTech','#38A169',0.15,'2025-11-05'),
('c8','Kavya Menon','kavya@mediacraft.co','MediaCraft Agency','+91 98400 66200','Kochi, IN','Marketing','#D53F8C',0.44,'2025-05-12'),
('c9','Siddharth Kohli','siddharth@aeroeng.co','AeroEng Components','+91 98100 99888','Bangalore, IN','Aerospace','#3B3486',0.09,'2025-08-19'),
('c10','Tanvi Shah','tanvi@greenenergysolar.in','Green Energy Solar','+91 90909 12121','Ahmedabad, IN','Energy','#0E8388',0.27,'2025-10-22');


INSERT INTO leads (id, customer_id, name, company, stage, value, lead_score, assigned_to, last_updated, notes) VALUES
('l1','c1','Enterprise API License','Tecnova Solutions','proposal', 480000, 0.91, 's1','2026-07-20','Sent proposal for 200-seat plan. Decision expected next week.'),
('l2','c2','Platform Upgrade','Quantum Retail','qualified', 240000, 0.78, 's2','2026-07-22','Tech team reviewing architecture docs.'),
('l3','c3','Patient Module Rollout','Helix Health Systems','new', 820000, 0.55, 's3','2026-07-25','First contact made, intro call scheduled.'),
('l4','c4','Wealth Suite Subscription','FinVista Capital','won', 620000, 0.97, 's1','2026-07-15','Signed 2-year contract. Kickoff next Monday.'),
('l5','c5','Factory Floor Automation','BuildMat Industries','contacted',1200000,0.38,'s5','2026-07-24','Budget constraints, exploring phased approach.'),
('l6','c6','Fleet Tracking Tier 2','LogiSpeed Logistics','proposal', 180000, 0.82, 's2','2026-07-21','Proposal revised after Q2 feedback.'),
('l7','c7','LMS Expansion','EduMax Academy','qualified', 310000, 0.69, 's3','2026-07-23','Evaluating against competitor LMS.'),
('l8','c8','Creative Studio Bundle','MediaCraft Agency','lost', 95000, 0.22, 's4','2026-07-10','Lost to cheaper alternative, revisit in Q4.'),
('l9','c9','Supply Chain Predictor','AeroEng Components','contacted', 540000, 0.61, 's5','2026-07-19','Strong interest, procurement cycle 90+ days.'),
('l10','c10','Microgrid Monitoring','Green Energy Solar','new', 380000, 0.47, 's3','2026-07-26','Inbound lead from website form.'),
('l11','c2','Customer Data Platform Add-on','Quantum Retail','new', 150000, 0.65, 's2','2026-07-25','Follow-up to platform upgrade discussions.'),
('l12','c4','Risk Analytics Premium','FinVista Capital','qualified', 410000, 0.85, 's1','2026-07-22','Compliance team reviewing.');


INSERT INTO deals (id, customer_id, name, stage, value, win_probability, expected_close, assigned_to) VALUES
('d1','c4','Wealth Suite - 2yr Plan','Closed Won', 620000, 100,'2026-07-15','s1'),
('d2','c1','Enterprise API - 200 seats','Proposal', 480000,  65,'2026-08-10','s1'),
('d3','c6','Fleet Tracking Tier 2','Proposal', 180000,  60,'2026-08-01','s2'),
('d4','c2','Platform Upgrade','Negotiation', 240000,  75,'2026-08-05','s2'),
('d5','c7','LMS Expansion','Qualified', 310000,  40,'2026-08-28','s3'),
('d6','c4','Risk Analytics Premium','Qualified', 410000,  50,'2026-09-12','s1'),
('d7','c9','Supply Chain Predictor','Discovery', 540000,  25,'2026-10-01','s5'),
('d8','c5','Factory Floor Phase 1','Discovery', 450000,  20,'2026-09-20','s5'),
('d9','c3','Patient Module Pilot','Discovery', 280000,  18,'2026-10-15','s3'),
('d10','c8','Creative Studio Bundle','Closed Lost', 95000, 0,'2026-07-10','s4');


INSERT INTO tasks (id, title, description, status, priority, due_date, assignee, related_id, related_type, created_at) VALUES
('t1','Follow up on Tecnova proposal','Send revised pricing sheet after call with Vikram.','todo','high','2026-07-28','s1','l1','lead','2026-07-25'),
('t2','Schedule FinVista kickoff','Coordinate with FinVista onboarding team for Monday kickoff.','in_progress','high','2026-07-27','s1','l4','lead','2026-07-20'),
('t3','Send Quantum retail case studies','Share 3 e-commerce case studies with Neha.','todo','medium','2026-07-29','s2','l2','lead','2026-07-23'),
('t4','Intro call with Helix Health','First discovery call scheduled at 11:00 AM.','todo','high','2026-07-28','s3','l3','lead','2026-07-26'),
('t5','Churn risk call with BuildMat','Rahul flagged at-risk in QBR, schedule urgent call.','in_progress','high','2026-07-28','s4','c5','customer','2026-07-22'),
('t6','LogiSpeed revision walkthrough','Walk Sneha through revised proposal changes.','done','medium','2026-07-22','s2','l6','lead','2026-07-18'),
('t7','EduMax competitor comparison','Build one-page comparison vs. primary LMS competitor.','todo','medium','2026-07-30','s3','l7','lead','2026-07-24'),
('t8','MediaCraft loss postmortem','Internal debrief on lost deal — document learnings.','done','low','2026-07-18','s4','l8','lead','2026-07-12'),
('t9','AeroEng procurement update','Check in with Siddharth on budget approval timeline.','todo','low','2026-08-02','s5','l9','lead','2026-07-21'),
('t10','Green Energy Solar reply','Reply to inbound website lead with product overview.','in_progress','medium','2026-07-27','s3','l10','lead','2026-07-26'),
('t11','Prep QBR for FinVista','Compile usage metrics and upsell opportunities.','todo','medium','2026-08-05','s4','c4','customer','2026-07-25'),
('t12','Team pipeline review','Weekly sync on pipeline health and blockers.','done','low','2026-07-24','s1',NULL,'internal','2026-07-22');


INSERT INTO interactions (id, type, customer_id, title, description, user_id, timestamp) VALUES
('a1','meeting','c1','Proposal review with Tecnova','Detailed walkthrough of SOW and pricing tiers.','s1','2026-07-26 14:30:00'),
('a2','email','c4','Kickoff agenda sent','Sent welcome pack and kickoff agenda to FinVista.','s1','2026-07-26 09:15:00'),
('a3','call','c5','Churn mitigation call','Spoke with Rahul regarding Q3 concerns and roadmap.','s4','2026-07-25 17:45:00'),
('a4','task',NULL,'Revised proposal uploaded','LogiSpeed Tier 2 proposal v2 attached to deal.','s2','2026-07-25 12:05:00'),
('a5','note','c3','Key contacts captured','Added CTO and Head of Clinical Informatics contacts.','s3','2026-07-24 19:22:00'),
('a6','meeting','c2','Tech deep-dive with Quantum team','Architecture review and integration discussion.','s2','2026-07-24 10:30:00'),
('a7','email','c10','Outbound intro reply sent','Acknowledged inbound and scheduled product tour.','s3','2026-07-23 15:10:00'),
('a8','call','c7','EduMax discovery follow-up','Confirmed evaluation team and timeline.','s3','2026-07-22 11:00:00');


INSERT INTO lead_scores (lead_id, score, features_json) SELECT id, lead_score,
  JSON_OBJECT('industry', (SELECT industry FROM customers c WHERE c.id=customer_id),
              'assigned_active', (SELECT COUNT(*) FROM tasks WHERE related_id=leads.id AND status<>'done'))
FROM leads;


INSERT INTO churn_scores (customer_id, score, features_json) SELECT id, churn_score,
  JSON_OBJECT('industry', industry, 'tenure_days', DATEDIFF(CURDATE(), created_at))
FROM customers;
