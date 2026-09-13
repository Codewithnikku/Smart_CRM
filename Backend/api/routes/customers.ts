import { Router } from "express";
import { pool, rows } from "../db.js";
const router = Router();
router.get("/", async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const industry = String(req.query.industry ?? "all");
    const churnTier = String(req.query.churn_tier ?? "all");
    const params: (string | number)[] = [];
    let sql = `SELECT * FROM customers WHERE 1=1`;
    if (search) {
        sql += ` AND (name LIKE ? OR company LIKE ? OR email LIKE ?)`;
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (industry !== "all") {
        sql += ` AND industry = ?`;
        params.push(industry);
    }
    if (churnTier === "high")
        sql += ` AND churn_score >= 0.40`;
    else if (churnTier === "medium")
        sql += ` AND churn_score >= 0.25 AND churn_score < 0.40`;
    else if (churnTier === "low")
        sql += ` AND churn_score >= 0.10 AND churn_score < 0.25`;
    else if (churnTier === "safe")
        sql += ` AND churn_score <  0.10`;
    sql += ` ORDER BY churn_score DESC, created_at DESC LIMIT 200`;
    const [data] = await pool.query(sql, params);
    res.json(rows(data));
});
router.get("/:id", async (req, res) => {
    const [[customer]] = (await pool.query("SELECT * FROM customers WHERE id = ?", [
        req.params.id,
    ])) as unknown as [
        [
            Record<string, unknown> | undefined
        ]
    ];
    if (!customer)
        return res.status(404).json({ error: "customer_not_found" });
    const [leads] = await pool.query(`SELECT l.*, s.name AS assigned_name, s.avatar_color AS staff_color
       FROM leads l LEFT JOIN staff s ON s.id = l.assigned_to
      WHERE l.customer_id = ? ORDER BY l.last_updated DESC`, [req.params.id]);
    const [deals] = await pool.query(`SELECT d.*, s.name AS assigned_name, s.avatar_color AS staff_color
       FROM deals d LEFT JOIN staff s ON s.id = d.assigned_to
      WHERE d.customer_id = ? ORDER BY d.value DESC`, [req.params.id]);
    const [interactions] = await pool.query(`SELECT i.*, s.name AS user_name, s.avatar_color AS staff_color
       FROM interactions i LEFT JOIN staff s ON s.id = i.user_id
      WHERE i.customer_id = ? ORDER BY i.timestamp DESC LIMIT 50`, [req.params.id]);
    res.json({ customer, leads, deals, interactions });
});
router.patch("/:id/churn-score", async (req, res) => {
    const score = Number(req.body?.churn_score ?? NaN);
    if (!Number.isFinite(score) || score < 0 || score > 1) {
        return res.status(400).json({ error: "invalid_churn_score" });
    }

    await pool.query(`UPDATE customers SET churn_score = ? WHERE id = ?`, [score, req.params.id]);
    const [[updated]] = (await pool.query("SELECT * FROM customers WHERE id = ?", [
        req.params.id,
    ])) as unknown as [[Record<string, unknown>]];
    res.json(updated);
});
export default router;
