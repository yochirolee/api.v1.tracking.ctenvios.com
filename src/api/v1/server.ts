import app from "./app";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

app
	.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	})
	.on("error", (err) => {
		console.error("Server failed to start:", err);
		process.exit(1);
	});
