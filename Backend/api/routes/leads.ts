import { Router } from "express";
import { pool, rows } from "../db.js";
const router = Router();
router.get("/", async (req, res) => {
    const stage = String(req.query.stage ?? "all");
    const params: (string | number)[] = [];
    let sql = `SELECT l.*, s.name AS assigned_name, s.avatar_color AS staff_color
               FROM leads l LEFT JOIN staff s ON s.id = l.assigned_to`;
    if (stage !== "all") {
        sql += ` WHERE l.stage = ?`;
        params.push(stage);
    }
    sql += ` ORDER BY l.value DESC`;
    const [data] = await pool.query(sql, params);
    res.json(rows(data));
});
router.patch("/:id/stage", async (req, res) => {
    const { stage } = req.body ?? {};
    const valid = ["new", "contacted", "qualified", "proposal", "won", "lost"];
    if (!valid.includes(String(stage))) {
        return res.status(400).json({ error: "invalid_stage", expected: valid });
    }
    await pool.query(`UPDATE leads SET stage = ?, last_updated = CURDATE() WHERE id = ?`, [stage, req.params.id]);
    const [[updated]] = (await pool.query("SELECT * FROM leads WHERE id = ?", [
        req.params.id,
    ])) as unknown as [
        [
            Record<string, unknown>
        ]
    ];
    res.json(updated);
});
export default router;
