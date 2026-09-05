import { Router } from "express";
import { pool, rows } from "../db.js";
const router = Router();
router.get("/", async (_req, res) => {
    const [data] = await pool.query(`SELECT t.*, s.name AS assignee_name, s.avatar_color AS staff_color
       FROM tasks t LEFT JOIN staff s ON s.id = t.assignee
      ORDER BY FIELD(t.status,'todo','in_progress','done'),
               FIELD(t.priority,'high','medium','low'), t.due_date ASC`);
    res.json(rows(data));
});
router.patch("/:id/status", async (req, res) => {
    const [[row]] = (await pool.query("SELECT status FROM tasks WHERE id = ?", [req.params.id])) as unknown as [
        [
            {
                status: string;
            } | undefined
        ]
    ];
    if (!row)
        return res.status(404).json({ error: "task_not_found" });
    const requested = String(req.body?.status ?? "").trim();
    const valid = ["todo", "in_progress", "done"];
    const next = valid.includes(requested) ? requested : row.status === "done" ? "todo" : row.status === "todo" ? "in_progress" : "done";
    await pool.query(`UPDATE tasks SET status = ? WHERE id = ?`, [next, req.params.id]);
    const [[updated]] = (await pool.query("SELECT * FROM tasks WHERE id = ?", [
        req.params.id,
    ])) as unknown as [
        [
            Record<string, unknown>
        ]
    ];
    res.json(updated);
});
export default router;
