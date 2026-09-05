import mysql, { type RowDataPacket } from "mysql2/promise";
import "dotenv/config";

const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT ?? 20);

export const pool = mysql.createPool({
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "smart_crm",
    waitForConnections: true,
    connectionLimit: connectionLimit,
    maxIdle: Math.floor(connectionLimit * 0.75),
    idleTimeout: 60_000,
    queueLimit: 0,
    charset: "utf8mb4",
    timezone: "+00:00",
    connectTimeout: 10_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

export async function pingDb() {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 + 1 AS ok");
    return rows?.[0]?.ok === 2;
}

export function rows<T extends object>(result: unknown): T[] {
    if (Array.isArray(result))
        return result as T[];
    return [];
}

export async function withTransaction<T>(
    fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}
