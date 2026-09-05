import { Router } from "express";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScript = path.resolve(__dirname, "..", "..", "python", "lead_insights.py");

router.post("/lead-insights", async (req, res) => {
    try {
        const payload = req.body ?? {};
        const python = process.env.PYTHON_BIN ?? "python";

        const child = spawn(python, [pythonScript], {
            cwd: path.resolve(__dirname, "..", ".."),
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.on("error", (error) => {
            res.status(500).json({ error: "python_process_failed", message: error.message });
        });

        child.on("close", (code) => {
            if (code !== 0) {
                res.status(500).json({ error: "python_process_failed", message: stderr.trim() || "python exited unexpectedly" });
                return;
            }

            try {
                const result = JSON.parse(stdout.trim() || "{}") as Record<string, unknown>;
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ error: "invalid_python_output", message: error instanceof Error ? error.message : "unknown" });
            }
        });

        child.stdin.write(JSON.stringify(payload));
        child.stdin.end();
    }
    catch (error) {
        res.status(500).json({ error: "ai_route_failed", message: error instanceof Error ? error.message : "unknown" });
    }
});

export default router;
