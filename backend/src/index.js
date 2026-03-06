import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import mentalRoutes from "./routes/mentalRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(console.error);

app.use("/api/mental", mentalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/predict", predictRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
