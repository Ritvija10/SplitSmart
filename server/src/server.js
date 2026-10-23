import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import groupRoutes from "./routes/groupRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" , v:2});
});

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

await connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});