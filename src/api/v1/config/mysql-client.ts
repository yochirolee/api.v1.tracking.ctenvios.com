import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	waitForConnections: true,
	connectionLimit: 20,
	queueLimit: 50,
	connectTimeout: 10000,
	enableKeepAlive: true,
	keepAliveInitialDelay: 5000,
	maxIdle: 5,
	idleTimeout: 10000,
});
const mysql_client = async (sql: string, params: any[] = []) => {
	const connection = await pool.getConnection();
	try {
		const [rows] = await connection.query(sql, params);
		return rows as any[];
	} catch (error) {
		connection.release();
		throw error;
	} finally {
		connection.release();
	}
};
export default mysql_client;
