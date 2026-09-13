import mysql from "mysql2/promise";
import * as fs from "node:fs";
import * as path from "node:path";
const combos: Array<{
    host: string;
    port: number;
    user: string;
    password: string;
}> = [
    { host: "127.0.0.1", port: 3306, user: "root", password: "" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "root" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "password" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "admin" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "mysql" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "1234" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "123456" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "root@123" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "Pass@123" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "nakul" },
    { host: "127.0.0.1", port: 3306, user: "root", password: "Nakul@123" },
    { host: "localhost", port: 3306, user: "pma", password: "" },
    { host: "localhost", port: 3308, user: "root", password: "" },
    { host: "localhost", port: 3307, user: "root", password: "" },
    { host: "localhost", port: 33060, user: "root", password: "" },
];
const envPath = path.join(path.resolve(), ".env");
(async () => {
    for (const c of combos) {
        try {
            const conn = await mysql.createConnection({
                host: c.host, port: c.port, user: c.user, password: c.password,
                connectTimeout: 2000,
            });
            await conn.query("SELECT 1");
            await conn.end();
            console.log(`CONNECTED  host=${c.host} port=${c.port} user=${c.user} password=${JSON.stringify(c.password)}`);
            let env = fs.readFileSync(envPath, "utf8");
            const apply = (k: string, v: string) => {
                const re = new RegExp(`^${escapeReg(k)}=.*$`, "m");
                if (re.test(env))
                    env = env.replace(re, `${k}=${v}`);
                else
                    env += `\n${k}=${v}\n`;
            };
            apply("MYSQL_HOST", c.host);
            apply("MYSQL_PORT", String(c.port));
            apply("MYSQL_USER", c.user);
            apply("MYSQL_PASSWORD", c.password);
            fs.writeFileSync(envPath, env, "utf8");
            process.exit(0);
        }
        catch (_e) { }
    }
    console.log("NO_MATCH");
    process.exit(2);
})();
function escapeReg(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
