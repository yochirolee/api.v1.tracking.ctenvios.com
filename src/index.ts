import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import parcelRoutes from "./routes/parcelRoutes";

import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import containersRoutes from "./routes/containerRoutes";
import issueRoutes from "./routes/issueRouter";
import path from "path";

const app = express();

// Use morgan for logging
app.use(morgan("dev"));

// Enable compression
app.use(compression());

// Setup cache

app.use(cors());
app.use(express.json());

// You can also set different cache durations for different routes
app.use("/api/parcels", parcelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/containers", containersRoutes);
app.use("/api/issues", issueRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.all("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
