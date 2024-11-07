import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE,
	waitForConnections: true,
	connectionLimit: 25,
	queueLimit: 0,
	connectTimeout: 10000,
	enableKeepAlive: true,
	keepAliveInitialDelay: 10000,
	maxIdle: 20,
	idleTimeout: 60000,
});



export default pool;
