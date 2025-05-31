/// <reference path="./@types/express/index.d.ts" />
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import logRoutes from "./routes/log.routes";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello from Typescript + Express");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/log", logRoutes);

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
