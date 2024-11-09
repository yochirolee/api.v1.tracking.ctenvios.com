import winston from "winston";
import { supabase_db } from "../../databases/supabase/supabase_db";
import { Writable } from "stream";

const logger = winston.createLogger({
	level: "error",
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new winston.transports.File({ filename: "error.log" }),
		// Custom transport for Supabase
		new winston.transports.Stream({
			stream: new Writable({
				write: (message: string, _encoding: string, callback: Function) => {
					const errorLog = JSON.parse(message);
					supabase_db.logger.log(errorLog);
					callback();
				},
			}),
		}),
	],
});

export default logger;
