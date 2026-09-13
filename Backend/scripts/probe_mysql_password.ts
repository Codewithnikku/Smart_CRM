import mysql from "mysql2/promise";
import * as fs from "node:fs";
import * as path from "node:path";
const candidates = [
    "",
    "root",
    "admin",
    "PASSWORD",
    "mysql",
    "1234",
    "123456",
    "root@123",
    "rootroot",
    "Password@123",
    "pass",
    "admin123",
];
const envPath = path.join(path.resolve(), ".env");
(async () => {
    let working = null;
    for (const pw of candidates) {
        try {
            const c = await mysql.createConnection({
                host: "localhost", port: 3306, user: "root", password: pw,
            });
            await c.query("SELECT 1");
            await c.end();
            working = pw;
            break;
        }
        catch (_e) {
        }
    }
    if (working === null) {
        console.log("NO_CREDENTIAL_MATCH");
        process.exit(2);
    }
    let env = fs.readFileSync(envPath, "utf8");
    if (/^MYSQL_PASSWORD=/m.test(env)) {
        env = env.replace(/^MYSQL_PASSWORD=.*$/m, `MYSQL_PASSWORD=${working}`);
    }
    else {
        env += `\nMYSQL_PASSWORD=${working}\n`;
    }
    fs.writeFileSync(envPath, env, "utf8");
    console.log(`OK  password="${working}"`);
})();
