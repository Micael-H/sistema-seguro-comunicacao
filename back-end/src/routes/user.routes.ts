import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { getCurrentUser } from "../controllers/user.controller";

const router = Router();

router.get("/me", ensureAuthenticated, getCurrentUser);

export default router;
