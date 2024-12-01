import { Router } from "express";
import { getRoutes, createRoute } from "../controllers/routesController";

const router = Router();

router.get("/routes", getRoutes);
router.post("/routes", createRoute);

export default router;
