import { Router } from "express";
import { pool, rows } from "../db.js";
const router = Router();
router.get("/", async (_req, res) => {
    const [data] = await pool.query("SELECT * FROM staff ORDER BY created_at ASC");
    res.json(rows(data));
});
router.get("/:id", async (req, res) => {
    const [[s]] = (await pool.query("SELECT * FROM staff WHERE id = ?", [
        req.params.id,
    ])) as unknown as [
        [
            Record<string, unknown> | undefined
        ]
    ];
    if (!s)
        return res.status(404).json({ error: "staff_not_found" });
    res.json(s);
});
export default router;
