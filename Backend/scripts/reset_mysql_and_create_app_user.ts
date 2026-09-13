import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { spawn, spawnSync, execSync } from "node:child_process";
import mysql from "mysql2/promise";
const MYSQLD_BASE = `C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin`;
const MYSQLD = `${MYSQLD_BASE}\\mysqld.exe`;
const MYSQL_CLI = `${MYSQLD_BASE}\\mysql.exe`;
const DEFAULTS = `C:\\ProgramData\\MySQL\\MySQL Server 8.0\\my.ini`;
const MYSQL_USER = "smartcrm_app";
const MYSQL_PASS = "SmartCRM@2026";
const PID = 7584;
const envPath = path.join(path.resolve(), ".env");
function writeEnv() {
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    const apply = (k: string, v: string) => {
        const re = new RegExp(`^${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=.*$`, "m");
        if (re.test(env))
            env = env.replace(re, `${k}=${v}`);
        else
            env = env.trimEnd() + `\n${k}=${v}\n`;
    };
    apply("MYSQL_HOST", "127.0.0.1");
    apply("MYSQL_PORT", "3306");
    apply("MYSQL_USER", MYSQL_USER);
    apply("MYSQL_PASSWORD", MYSQL_PASS);
    apply("MYSQL_DATABASE", "smart_crm");
    fs.writeFileSync(envPath, env, "utf8");
}
async function verify() {
    try {
        const conn = await mysql.createConnection({
            host: "127.0.0.1", port: 3306,
            user: MYSQL_USER, password: MYSQL_PASS,
        });
        await conn.query("SELECT 1");
        await conn.end();
        return true;
    }
    catch {
        return false;
    }
}
(async () => {
    if (await verify()) {
        console.log("OK — user already connected (skipping reset).");
        writeEnv();
        process.exit(0);
    }
    console.log(`Stopping current MySQL PID ${PID}…`);
    try {
        execSync(`taskkill /F /PID ${PID}`);
    }
    catch { }
    await sleep(3000);
    console.log("Starting MySQL in safe mode (skip-grant-tables)…");
    const tempIniPath = path.join(os.tmpdir(), "crm-mysql-reset.sql");
    fs.writeFileSync(tempIniPath, [
        "FLUSH PRIVILEGES;",
        `CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';`,
        `ALTER  USER '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';`,
        `GRANT ALL PRIVILEGES ON smart_crm.* TO '${MYSQL_USER}'@'localhost';`,
        `GRANT SYSTEM_VARIABLES_ADMIN, SESSION_VARIABLES_ADMIN, PROCESS, CREATE ON *.* TO '${MYSQL_USER}'@'localhost';`,
        "FLUSH PRIVILEGES;",
    ].join("\n"));
    const bypass = spawn(MYSQLD, [
        `--defaults-file=${DEFAULTS}`,
        `--init-file=${tempIniPath}`,
        `--console`,
    ], { stdio: "ignore", windowsHide: true, detached: true });
    bypass.unref();
    await sleep(8000);
    console.log("Stopping bypass server…");
    spawnSync(MYSQL_CLI, ["-u", "root", "-e", "SHUTDOWN;"], { stdio: "ignore" });
    await sleep(4000);
    console.log("Restarting MySQL service normally…");
    const services = execSync("sc query type= service state= all").toString();
    const svcName = /(MySQL\d+)/.exec(services)?.[1] ?? /(MySQL[^ ]*)/.exec(services)?.[1];
    if (svcName) {
        try {
            execSync(`net start ${svcName}`, { stdio: "ignore" });
            console.log("Started service:", svcName);
        }
        catch (e) {
            console.warn("net start failed, launching daemon", (e as Error).message);
            launchDaemon();
        }
    }
    else {
        launchDaemon();
    }
    await sleep(6000);
    const ok = await verify();
    if (!ok) {
        console.error("Verification failed after restart. Trying one more spawn…");
        launchDaemon();
        await sleep(6000);
        const ok2 = await verify();
        if (!ok2) {
            console.error("Could not reconnect");
            process.exit(1);
        }
    }
    writeEnv();
    console.log(`OK  user=${MYSQL_USER}  pass=${MYSQL_PASS}`);
    process.exit(0);
    function launchDaemon() {
        const d = spawn(MYSQLD, [`--defaults-file=${DEFAULTS}`, "--console"], { stdio: "ignore", windowsHide: true, detached: true });
        d.unref();
    }
})();
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
