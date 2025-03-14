import { Router } from "express";
import { authenticate } from "../../authMiddleware";
import { login, logout, verify } from "../controllers/AuthenticationController";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/UserController";

import {
  deletePlan,
  getPlanById,
  updatePlan,
  getPlanByDateAndUser,
  createPlans,
} from "../controllers/PlanController";

const router = Router();

// Authentication
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/verify", authenticate, verify);

// User
router.get("/users", getUsers);
router.get("/user/:id", getUserById);
router.post("/user", createUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

// Plans
//TODO: Add authentication middleware and send cookie from frontend
router.get("/plans", getPlanByDateAndUser);
router.get("/plans/:id", getPlanById);
router.post("/plans", createPlans);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

export default router;
