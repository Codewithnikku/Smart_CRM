import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        return res.status(400).json({ error: "email_and_password_required" });
    }

    const [rows] = await pool.query("SELECT id, name, email, role, avatar_color FROM staff WHERE email = ? AND password_hash = ?", [
        String(email).trim(),
        String(password),
    ]);

    const users = Array.isArray(rows) ? rows : [];
    if (users.length === 0) {
        return res.status(401).json({ error: "invalid_credentials" });
    }

    const user = users[0] as {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar_color: string;
    };

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatar_color,
    });
});

export default router;
