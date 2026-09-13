import "dotenv/config";
import express from "express";
import cors from "cors";
import { pingDb } from "./db.js";
import customersRouter from "./routes/customers.js";
import leadsRouter from "./routes/leads.js";
import dealsRouter from "./routes/deals.js";
import tasksRouter from "./routes/tasks.js";
import dashboardRouter from "./routes/dashboard.js";
import staffRouter from "./routes/staff.js";
import authRouter from "./routes/auth.js";
import aiRouter from "./routes/ai.js";
const app = express();
const PORT = process.env.API_PORT ?? 4000;
const WEB_ORIGINS = (process.env.WEB_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const VERCEL_ORIGINS = [
    /\.vercel\.app$/,
    /\.vercel\.dev$/,
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (WEB_ORIGINS.includes(origin))
            return callback(null, true);
        if (VERCEL_ORIGINS.some((re) => re.test(origin)))
            return callback(null, true);
        if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))
            return callback(null, true);
        callback(null, true);
    },
    credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.set("trust proxy", true);
app.get("/healthz", async (_req, res) => {
    try {
        const ok = await pingDb();
        res.json({ ok: true, database: ok ? "connected" : "unknown", version: "1.0.0" });
    }
    catch (err) {
        res.status(503).json({
            ok: false,
            error: err instanceof Error ? err.message : "db_error",
        });
    }
});
app.use("/api/customers", customersRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/deals", dealsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/staff", staffRouter);
app.use("/api/auth", authRouter);
app.use("/api/ai", aiRouter);
app.use(((err, _req, res, _next) => {
    console.error("[API ERROR]", err);
    res.status(500).json({ error: err.message ?? "internal_error" });
}) as express.ErrorRequestHandler);
app.listen(PORT, () => {
    console.log(`[smart-crm-api] MySQL backend ready on http://localhost:${PORT}`);
});
