import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { getAllUserLogs, getUserLogs } from "../controllers/log.controller";
import { ensureAuthorized } from "../middlewares/ensureAuthorized";

const router = Router();

router.get("/my", ensureAuthenticated, getUserLogs);
router.get(
  "/all",
  ensureAuthenticated,
  ensureAuthorized(["admin"]),
  getAllUserLogs
);

export default router;
