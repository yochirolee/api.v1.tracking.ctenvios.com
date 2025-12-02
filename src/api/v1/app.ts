import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/app-router";
import path from "path";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app: Application = express();

// Trust proxy for rate limiting (AWS Lambda/API Gateway/Vercel)
app.set("trust proxy", 1);

// CORS configuration
const corsOptions = {
   origin: [
      "https://ctenvios.com",
      "https://dashboard.ctenvios.com",
      "https://www.ctenvios.com",
      "http://localhost:3000", // for development
   ],
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allowedHeaders: [
      "Content-Type",
      "Authorization",
      "api-key", // Add this!
   ],
   credentials: true,
   optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan("dev"));
app.use(
   express.json({
      limit: "10mb",
   })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());
app.use(
   rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
   })
);

// API Routes
app.use("/api/v1", router);

app.use(express.static(path.join(__dirname, "public")));

app.all("*", (req, res) => {
   res.sendFile(path.join(__dirname, "public", "index.html"));
}); // Error handling middleware

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
   console.error(err.stack);
   res.status(500).json({ error: "Something went wrong!" });
});

export default app;
