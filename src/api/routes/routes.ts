import { Router } from "express";

import {
  getAllPlans,
  deletePlan,
  getPlanById,
  updatePlan,
  getPlanByDateAndUser,
  createPlans,
} from "../controllers/PlanController";

import {
  getAllRouteGroups,
  getRouteGroupsById,
  createRouteGroup,
  updateRouteGroup,
  getRouteByID,
  createRoute,
  updateRoute,
  deleteRoute,
  deleteRouteGroup,
} from "../controllers/RouteController";

const router = Router();

// ------ PLANS ------ //
router.get("/plans", async (req, res) => {
  const { date, assignedUserId } = req.query;

  // If date and assignedUserId are provided, get plan by date and user
  if (date && assignedUserId) {
    return getPlanByDateAndUser(req, res);
  } else {
    return getAllPlans(req, res);
  }
});

router.get("/plans/:id", getPlanById);
router.post("/plans", createPlans);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

// ------ ROUTES GROUP ------ //
router.get("/route-groups", getAllRouteGroups);
router.get("/route-groups/:id", getRouteGroupsById);
router.post("/route-groups", createRouteGroup);
router.put("/route-groups/:id", updateRouteGroup);
router.delete("/route-groups/:id", deleteRouteGroup);

// ------ ROUTES ------ //
router.get("/route-groups/:routeGroupId/routes/:routeId:", getRouteByID);
router.post("/route-groups/:routeGroupId/routes", createRoute);
router.put("/route-groups/:routeGroupId/routes/:routeId", updateRoute);
router.delete("/route-groups/:routeGroupId/routes/:routeId", deleteRoute);

export default router;
