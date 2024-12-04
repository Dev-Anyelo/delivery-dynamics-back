import { Router } from "express";

import {
  getAllRoutes,
  createRoute,
  getDrivers,
  getRouteById,
  deleteRoute,
  updateRoute
} from "../controllers/routesController";

const router = Router();

router.get("/routes", getAllRoutes);

router.get("/drivers", getDrivers);

router.get("/routes/:id", getRouteById);

router.post("/routes", createRoute);

router.put("/routes/:id", updateRoute);

router.delete("/routes/:id", deleteRoute);

export default router;
