import { Router } from "express";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  deleteAccount,
  createRole,
} from "../controllers/auth.controller";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.put("/delete-account", ensureAuthenticated, deleteAccount);
router.post("/role", createRole);

export default router;
