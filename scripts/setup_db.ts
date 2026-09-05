import "dotenv/config";
import mysql from "mysql2/promise";
import * as fs from "node:fs";
import * as path from "node:path";
const HOST = process.env.MYSQL_HOST ?? "localhost";
const PORT = Number(process.env.MYSQL_PORT ?? 3306);
const USER = process.env.MYSQL_USER ?? "root";
const PASSWORD = process.env.MYSQL_PASSWORD ?? "";
const DB = process.env.MYSQL_DATABASE ?? "smart_crm";
const PROJECT_ROOT = path.resolve(import.meta.dirname ?? process.cwd(), "..");
const SQL_DIR = path.join(PROJECT_ROOT, "database");
async function execScript(conn: mysql.Connection, file: string, name: string) {
    const sql = fs.readFileSync(path.join(SQL_DIR, file), "utf8");
    const statements = sql
        .replace(/^--.*$/gm, "")
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    console.log(`  ▶ ${name}  (${statements.length} statements)`);
    for (const stmt of statements) {
        try {
            await conn.query(stmt);
        }
        catch (err) {
            console.error(`    ✗ FAILED statement:\n${stmt.slice(0, 200)}\n`, err);
            throw err;
        }
    }
}
(async () => {
    console.log(`\n🗄️  MySQL setup → ${USER}@${HOST}:${PORT}/${DB}\n`);
    const conn = await mysql.createConnection({
        host: HOST, port: PORT, user: USER, password: PASSWORD,
        multipleStatements: true, charset: "utf8mb4",
    });
    try {
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        await execScript(conn, "schema.sql", "schema.sql      (CREATE TABLEs + FKs)");
        await conn.changeUser({ database: DB });
        await execScript(conn, "indexes.sql", "indexes.sql     (performance indexes)");
        await execScript(conn, "views.sql", "views.sql       (monthly_revenue, funnel_summary, …)");
        await execScript(conn, "seed_data.sql", "seed_data.sql   (sample customers / leads / deals)");
        const [[cnt]] = (await conn.query("SELECT (SELECT COUNT(*) FROM customers) AS c, " +
            "(SELECT COUNT(*) FROM leads) AS l, " +
            "(SELECT COUNT(*) FROM deals) AS d, " +
            "(SELECT COUNT(*) FROM tasks) AS t")) as unknown as [
            [
                {
                    c: number;
                    l: number;
                    d: number;
                    t: number;
                }
            ]
        ];
        console.log(`\n✅  Done. Rows inserted:  customers=${cnt.c}  leads=${cnt.l}  deals=${cnt.d}  tasks=${cnt.t}`);
        console.log(`\nNext:  npm run dev:all   (starts React Web + MySQL API together)\n`);
    }
    finally {
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");
        await conn.end();
    }
})().catch((err) => {
    console.error("\n❌  MySQL setup failed:", err?.message ?? err);
    process.exit(1);
});
