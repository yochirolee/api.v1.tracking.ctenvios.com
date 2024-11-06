import pool from "../../config/mysql_config";

const mysql_client = async (sql: string, params: any[] = []) => {
	try {
		const connection = await pool.getConnection();
		try {
			const [rows] = await connection.query(sql, params);
			return rows as any[];
		} finally {
			connection.release();
		}
	} catch (error) {
		console.log(error);
		throw error;
	}
};

export default mysql_client;
