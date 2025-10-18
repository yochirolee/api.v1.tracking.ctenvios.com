// Load environment variables BEFORE any other imports
import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
}).on("error", (err) => {
   console.error("Server failed to start:", err);
   process.exit(1);
});
