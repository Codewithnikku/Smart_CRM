import { Router } from "express";
import { pool, rows } from "../db.js";
const router = Router();
router.get("/kpis", async (_req, res) => {
    const [[won]] = (await pool.query(`SELECT COALESCE(SUM(value),0) AS revenue, COUNT(*) AS won_count
       FROM deals WHERE stage = 'Closed Won'
         AND YEAR(expected_close) = YEAR(CURDATE())`)) as unknown as [
        [
            {
                revenue: number;
                won_count: number;
            }
        ]
    ];
    const [[leadStats]] = (await pool.query(`SELECT COUNT(*) AS total_leads,
            SUM(stage='won')/COUNT(*) AS conv_rate
       FROM leads`)) as unknown as [
        [
            {
                total_leads: number;
                conv_rate: number;
            }
        ]
    ];
    const [[atRisk]] = (await pool.query(`SELECT COUNT(*) AS at_risk_count FROM customers WHERE churn_score >= 0.35`)) as unknown as [
        [
            {
                at_risk_count: number;
            }
        ]
    ];
    res.json({
        revenue: Number(won.revenue),
        leads: Number(leadStats.total_leads),
        conversionRate: Number(leadStats.conv_rate ?? 0),
        atRiskChurn: Number(atRisk.at_risk_count),
        wonDealsThisMonth: Number(won.won_count),
    });
});
router.get("/revenue", async (_req, res) => {
    const [data] = await pool.query(`SELECT month, month_label, won_value, weighted_value, pipeline_value, deal_count
       FROM monthly_revenue ORDER BY month`);
    res.json(rows(data));
});
router.get("/funnel", async (_req, res) => {
    const [data] = await pool.query(`SELECT stage, lead_count, total_value, pct_of_leads FROM funnel_summary`);
    res.json(rows(data));
});
router.get("/activity", async (_req, res) => {
    const [data] = await pool.query(`SELECT i.*, c.name AS customer_name, c.company, s.name AS user_name, s.avatar_color AS staff_color
       FROM interactions i
       LEFT JOIN customers c ON c.id = i.customer_id
       LEFT JOIN staff s ON s.id = i.user_id
      ORDER BY i.timestamp DESC LIMIT 20`);
    res.json(rows(data));
});
router.get("/at-risk", async (_req, res) => {
    const [data] = await pool.query(`SELECT * FROM customers WHERE churn_score >= 0.35 ORDER BY churn_score DESC LIMIT 10`);
    res.json(rows(data));
});
export default router;
