import { z } from "zod";
import axios from "axios";
import { db } from "../lib/db";
import { Response } from "express";
import config from "../config/config";
import { PlanSchema, RouteGroupSchema } from "../schemas/schemas";

// -------- PLANS -------- //

// Get all plans from the external service
export const getExternalPlan = async (id: string): Promise<any> => {
  const { PLAN_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;

  const url = `${PLAN_EXTERNAL_SERVICE_URL}/${id}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleExternalAPIError(error);
  }
};

// Get plan by date and user from the external service
export const getExternalPlanByDateAndUser = async (
  date: string,
  assignedUserId: string
): Promise<any> => {
  const { PLAN_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;
  const url = `${PLAN_EXTERNAL_SERVICE_URL}?date=${date}&assignedUserId=${assignedUserId}`;

  console.log("Llamando a la API externa:", url);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log("Respuesta de API externa:", response.status, response.data);
    return response.data;
  } catch (error) {
    console.error("Error en llamada a API externa:", error);
    return handleExternalAPIError(error);
  }
};

// Get all plans from the database
export const fetchAllPlans = async () => {
  try {
    const plans = await db.plan.findMany({
      include: {
        route: true,
        orders: true,
        visits: true,
        startPoint: true,
        endPoint: true,
        truck: true,
        businessSegment: true,
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      operationType: plan.operationType,
      date: plan.date,
      activeDates: plan.activeDates,
      assignedUserId: plan.assignedUserId,
      businessSegmentId: plan.businessSegmentId,
      businessSegment: plan.businessSegment,
      routeId: plan.routeId,
      route: plan.route,
      truckId: plan.truckId,
      truck: plan.truck,
      startPointId: plan.startPointId,
      startPoint: plan.startPoint,
      endPointId: plan.endPointId,
      endPoint: plan.endPoint,
      plannedStartTimestamp: plan.plannedStartTimestamp,
      plannedEndTimestamp: plan.plannedEndTimestamp,
      plannedTotalTimeH: plan.plannedTotalTimeH,
      plannedDriveTimeH: plan.plannedDriveTimeH,
      plannedServiceTimeH: plan.plannedServiceTimeH,
      plannedBreakTimeH: plan.plannedBreakTimeH,
      plannedWaitTimeH: plan.plannedWaitTimeH,
      plannedDistanceKm: plan.plannedDistanceKm,
      actualStartTimestamp: plan.actualStartTimestamp,
      actualEndTimestamp: plan.actualEndTimestamp,
      startLatitude: plan.startLatitude,
      startLongitude: plan.startLongitude,
      endLatitude: plan.endLatitude,
      endLongitude: plan.endLongitude,
      visits: plan.visits,
      orders: plan.orders,
    }));
  } catch (error) {
    console.error("Error al consultar rutas en la base de datos:", error);
    throw new Error("Error al obtener las rutas.");
  }
};

// Get a plan by ID from the database
export const fetchPlanByIdFromDB = async (id: string) => {
  try {
    return await db.plan.findUnique({
      where: { id },
      include: {
        route: true,
        orders: true,
        visits: true,
        startPoint: true,
        endPoint: true,
        truck: true,
        businessSegment: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener ruta de la base de datos:", error);
    throw new Error("Error al consultar la base de datos.");
  }
};

// Validate if a plan exists
export const planExists = async (id: string) => {
  return db.plan.findUnique({ where: { id } });
};

// Send a response
export const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  message: string,
  data: any = null
) => {
  res.status(status).json({ success, message, data });
};

// Update a plan by ID
export const createNewPlan = async (data: z.infer<typeof PlanSchema>) => {
  try {
    return db.plan.create({
      data: {
        id: data.id,
        operationType: data.operationType,
        date: data.date,
        activeDates: data.activeDates,
        assignedUserId: data.assignedUserId,
        businessSegmentId: data.businessSegmentId,
        routeId: data.routeId,
        truckId: data.truckId,
        startPointId: data.startPointId,
        endPointId: data.endPointId,
        plannedStartTimestamp: data.plannedStartTimestamp,
        plannedEndTimestamp: data.plannedEndTimestamp,
        plannedTotalTimeH: data.plannedTotalTimeH,
        plannedDriveTimeH: data.plannedDriveTimeH,
        plannedServiceTimeH: data.plannedServiceTimeH,
        plannedBreakTimeH: data.plannedBreakTimeH,
        plannedWaitTimeH: data.plannedWaitTimeH,
        plannedDistanceKm: data.plannedDistanceKm,
        actualStartTimestamp: data.actualStartTimestamp,
        actualEndTimestamp: data.actualEndTimestamp,
        startLatitude: data.startLatitude,
        startLongitude: data.startLongitude,
        endLatitude: data.endLatitude,
        endLongitude: data.endLongitude,
      },
    });
  } catch (error) {
    console.error("Error al crear la ruta:", error);
    throw new Error("Error al crear la ruta.");
  }
};

// Delete a plan by ID
export const deletePlanById = async (id: string) => {
  return db.plan.delete({ where: { id } });
};

// -------- ROUTES AND ROUTE GROUPS-------- //

// Get route groups from the external service
export const getExternalRouteGroups = async (id?: string): Promise<any> => {
  const { ROUTE_GROUPS_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;

  const url = id
    ? `${ROUTE_GROUPS_EXTERNAL_SERVICE_URL}/${id}`
    : ROUTE_GROUPS_EXTERNAL_SERVICE_URL;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleExternalAPIError(error);
  }
};

// Get a route by ID from external service
export const getExternalRouteById = async (
  routeGroupId: string,
  routeId: string
): Promise<any> => {
  const { ROUTE_GROUPS_EXTERNAL_SERVICE_URL, BEARER_TOKEN } = config;

  const url = `${ROUTE_GROUPS_EXTERNAL_SERVICE_URL}/${routeGroupId}/routes/${routeId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    return handleExternalAPIError(error);
  }
};

// Get all routes from the database
export const fetchAllRouteGroups = async () => {
  try {
    const routes = await db.route.findMany({
      include: {
        routeGroup: true,
        stops: true,
        assignedTruck: true,
        assignedTruckType: true,
        plans: true,
      },
    });

    return routes.map((route) => ({
      id: route.id,
      routeGroupId: route.routeGroupId,
      routeGroup: route.routeGroup,
      startPointId: route.startPointId,
      endPointId: route.endPointId,
      assignedTruckId: route.assignedTruckId,
      assignedTruck: route.assignedTruck,
      assignedTruckTypeId: route.assignedTruckTypeId,
      assignedTruckType: route.assignedTruckType,
      assignedUserId: route.assignedUserId,
      stops: route.stops,
      plans: route.plans,
    }));
  } catch (error) {
    console.error("Error al consultar rutas en la base de datos:", error);
    throw new Error("Error al obtener las rutas.");
  }
};

// Get a route by ID from the database
export const fetchRouteByIdFromDB = async (id: string) => {
  try {
    return await db.route.findUnique({
      where: { id },
      include: {
        routeGroup: true,
        stops: true,
        assignedTruck: true,
        assignedTruckType: true,
        plans: true,
      },
    });
  } catch (error) {
    console.error("Error al obtener ruta de la base de datos:", error);
    throw new Error("Error al consultar la base de datos.");
  }
};

// Get a route by route group ID
export const fetchRouteByID = async (routeGroupId: string, routeId: string) => {
  return db.route.findMany({
    where: { routeGroupId },
    include: {
      routeGroup: true,
      stops: true,
      assignedTruck: true,
      assignedTruckType: true,
      plans: true,
    },
  });
};

// Validate if a route group exists
export const routeExists = async (id: string) => {
  return db.route.findUnique({ where: { id } });
};

// create a new route group
export const createNewRouteGroup = async (
  data: z.infer<typeof RouteGroupSchema>
) => {
  try {
    const { routes, ...routeGroupData } = data;

    return await db.routeGroup.create({
      data: routeGroupData,
      include: {
        routes: true,
      },
    });
  } catch (error) {
    console.error("Error al crear el grupo de rutas:", error);
    throw new Error("Error al crear el grupo de rutas.");
  }
};

// Update a route group by ID
export const updateRouteGroupFromDB = async (
  id: string,
  data: z.infer<typeof RouteGroupSchema>
) => {
  try {
    const { routes, ...routeGroupData } = data;

    return db.routeGroup.update({
      where: { id },
      data: routeGroupData,
    });
  } catch (error) {
    console.error("Error al actualizar el grupo de rutas:", error);
    throw new Error("Error al actualizar el grupo de rutas.");
  }
};

// Delete a route group by ID
export const deleteRouteGroupById = async (id: string) => {
  return db.routeGroup.delete({ where: { id } });
};

// Delete a route by ID
export const deleteRouteById = async (id: string) => {
  return db.route.delete({ where: { id } });
};

// Handle external error
export const handleExternalAPIError = (error: any): null => {
  if (axios.isAxiosError(error)) {
    console.error("Error en API externa:", {
      status: error.response?.status,
      data: error.response?.data,
    });
  } else {
    console.error("Error desconocido:", error);
  }
  return null;
};
