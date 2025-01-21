import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import parcel_routes from "./routes/parcel_routes";

import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import containersRoutes from "./routes/containerRoutes";
import issueRoutes from "./routes/issueRouter";
import statsRoutes from "./routes/statsRouter";
import path from "path";

const app = express();

// Use morgan for logging
app.use(morgan("dev"));

// Enable compression
app.use(compression());
app.use(helmet());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Limit each IP to 100 requests per windowMs
	}),
);

// Setup cache

app.use(cors());
app.use(express.json());

// You can also set different cache durations for different routes
app.use("/api/parcels", parcel_routes);
app.use("/api/users", userRoutes);
app.use("/api/containers", containersRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/stats", statsRoutes);

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
