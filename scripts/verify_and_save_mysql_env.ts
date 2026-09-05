import mysql from "mysql2/promise";
import * as fs from "node:fs";
import * as path from "node:path";
const envPath = path.join(path.resolve(), ".env");
(async () => {
    const cfg = { host: "127.0.0.1", port: 3307, user: "root", password: "" };
    try {
        const conn = await mysql.createConnection(cfg);
        const [rows] = await conn.query<Array<Record<string, unknown>>>("SELECT VERSION() AS v");
        await conn.end();
        console.log("CONNECTED  version=", rows[0].v);
        let env = fs.readFileSync(envPath, "utf8");
        const apply = (k: string, v: string) => {
            const re = new RegExp(`^${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=.*$`, "m");
            if (re.test(env))
                env = env.replace(re, `${k}=${v}`);
            else
                env = env.trimEnd() + `\n${k}=${v}\n`;
        };
        apply("MYSQL_HOST", cfg.host);
        apply("MYSQL_PORT", String(cfg.port));
        apply("MYSQL_USER", cfg.user);
        apply("MYSQL_PASSWORD", cfg.password);
        apply("MYSQL_DATABASE", "smart_crm");
        fs.writeFileSync(envPath, env, "utf8");
        process.exit(0);
    }
    catch (e) {
        console.error("FAIL", (e as Error).message);
        process.exit(1);
    }
})();
