import { Router } from "express";
import { pool, rows } from "../db.js";
const router = Router();
router.get("/", async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const params: string[] = [];
    let sql = `SELECT d.*, c.name AS customer_name, c.company, s.name AS assigned_name, s.avatar_color AS staff_color
               FROM deals d
               JOIN customers c ON c.id = d.customer_id
               LEFT JOIN staff s ON s.id = d.assigned_to`;
    if (search) {
        sql += ` WHERE d.name LIKE ? OR c.name LIKE ? OR c.company LIKE ? OR s.name LIKE ?`;
        const like = `%${search}%`;
        params.push(like, like, like, like);
    }
    sql += ` ORDER BY d.value DESC`;
    const [data] = await pool.query(sql, params);
    res.json(rows(data));
});
export default router;
