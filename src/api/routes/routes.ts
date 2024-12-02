import { Router } from "express";
import { getRoutes, createRoute, getDrivers } from "../controllers/routesController";

const router = Router();

router.get("/routes", getRoutes);
router.post("/routes", createRoute);
router.get("/drivers", getDrivers);

export default router;
