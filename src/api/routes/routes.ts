import { Router } from "express";
import { authenticate } from "../../authMiddleware";

import {
  deletePlan,
  getPlanById,
  updatePlan,
  getPlanByDateAndUser,
  createPlans,
} from "../controllers/PlanController";

import {
  login,
  logout,
  register,
  verify,
} from "../controllers/AuthenticationController";

const router = Router();

// Authentication
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/register", register);
router.get("/auth/verify", authenticate, verify);

// Plans
router.get("/plans", authenticate, getPlanByDateAndUser);
router.get("/plans/:id", authenticate, getPlanById);
router.post("/plans", authenticate, createPlans);
router.put("/plans/:id", authenticate, updatePlan);
router.delete("/plans/:id", authenticate, deletePlan);

export default router;
