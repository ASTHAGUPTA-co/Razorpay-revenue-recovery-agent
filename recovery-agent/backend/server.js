import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import paymentsRouter from "./routes/payments.js";
import metricsRouter from "./routes/metrics.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api/payments", paymentsRouter);
app.use("/api/metrics", metricsRouter);

app.get("/", (req, res) => res.send("Recovery Agent API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
