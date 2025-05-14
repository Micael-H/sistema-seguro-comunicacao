import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth.routes";
import { ensureAuthenticated } from "./middlewares/ensureAuthenticated";
import { ensureAuthorized } from "./middlewares/ensureAuthorized";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello from Typescript + Express");
});

app.get(
  "/user-only",
  ensureAuthenticated,
  ensureAuthorized(["user"]),
  (req, res) => {
    res.json({ message: "Você é um user comum!" });
  }
);

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
