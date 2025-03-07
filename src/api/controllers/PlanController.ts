import { z } from "zod";
import { db } from "../../lib/db";
import { Request, Response } from "express";
import { PlanSchema, PlansSchema } from "../../schemas/schemas";

import {
  getExternalPlan,
  createNewPlan,
  deletePlanById,
  fetchAllPlans,
  fetchPlanByIdFromDB,
  handleExternalAPIError,
  planExists,
  sendResponse,
  getExternalPlanByDateAndUser,
  fetchPlanByDateAndUserFromDb,
} from "../../lib/lib";

// Get all plans from database
export const getAllPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const plans = await fetchAllPlans();
    sendResponse(res, 200, true, "Planes cargados exitosamente.", plans);
  } catch (error: unknown) {
    console.error("Error en el controlador al cargar planes:", error);
    sendResponse(res, 500, false, "Error al cargar los planes.");
  }
};

// Get plan by ID
export const getPlanById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    sendResponse(res, 400, false, "ID del plan no proporcionado o inválido.");
    return;
  }

  try {
    const planFromDB = await fetchPlanByIdFromDB(id);

    if (planFromDB) {
      sendResponse(
        res,
        200,
        true,
        "Plan encontrado en la base de datos.",
        planFromDB
      );
    }

    try {
      const planFromExternalService = await getExternalPlan(id);

      if (planFromExternalService) {
        sendResponse(
          res,
          200,
          true,
          "Plan encontrado en la API externa",
          planFromExternalService
        );
        return;
      }
    } catch (apiError) {
      console.log("Error al obtener plan de la API externa:", apiError);
      handleExternalAPIError(apiError);
      return;
    }

    sendResponse(
      res,
      404,
      false,
      `Plan con ID '${id}' no encontrado en ninguna fuente.`
    );
    return;
  } catch (error) {
    console.error(`Error al obtener el plan ${id}:`, error);
    sendResponse(res, 500, false, "Error interno al buscar el plan.");
  }
};

// Get plan by date and user
export const getPlanByDateAndUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { date, assignedUserId } = req.query;

  console.log("Parámetros recibidos:", date, assignedUserId);

  if (!date || !assignedUserId) {
    sendResponse(
      res,
      400,
      false,
      "Parámetros de búsqueda no proporcionados o inválidos"
    );
    return;
  }

  try {
    const plans = await fetchPlanByDateAndUserFromDb(
      date as string,
      assignedUserId as string
    );

    if (plans && plans.orders && plans.orders.length > 0) {
      console.log("Planes encontrados en BD:", plans);
      sendResponse(
        res,
        200,
        true,
        "Planes encontrados en la base de datos.",
        plans
      );
      return;
    }

    try {
      const plansFromExternalService = await getExternalPlanByDateAndUser(
        date as string,
        assignedUserId as string
      );

      if (!plansFromExternalService || plansFromExternalService.length === 0) {
        sendResponse(
          res,
          404,
          false,
          `No se encontraron planes para la fecha ${date} y el usuario ${assignedUserId}.`
        );
        return;
      }

      sendResponse(
        res,
        200,
        true,
        "Planes encontrados en la API externa.",
        plansFromExternalService
      );
      return;
    } catch (apiError) {
      console.error("Error al obtener planes de la API externa:", apiError);
      handleExternalAPIError(apiError);
      return;
    }
  } catch (error) {
    console.error("Error al buscar planes por fecha y usuario:", error);
    sendResponse(
      res,
      500,
      false,
      "Error al buscar planes por fecha y usuario."
    );
  }
};

// Create new plan
export const createPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedPlans = PlansSchema.parse(req.body);
    const newPlans = [];

    for (const plan of validatedPlans) {
      const existingPlan = await planExists(plan.id);
      if (existingPlan) {
        sendResponse(
          res,
          409,
          false,
          `El plan con ID ${plan.id} ya existe en la base de datos.`
        );
        return;
      }

      const newPlan = await createNewPlan(plan);
      newPlans.push(newPlan);
    }

    sendResponse(res, 201, true, "Planes creados exitosamente.", newPlans);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Datos inválidos al crear planes:", error.errors);
      sendResponse(res, 400, false, "Datos inválidos", error.errors);
      return;
    }
    console.error("Error al crear los planes:", error);
    sendResponse(res, 500, false, "Error al crear los planes.");
  }
};

// Update plan by ID
export const updatePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    sendResponse(res, 400, false, "ID del plan no proporcionado o inválido.");
    return;
  }

  try {
    const existingPlan = await planExists(id);

    if (!existingPlan) {
      sendResponse(res, 404, false, "Plan no encontrado.");
      return;
    }

    const validatedData = PlanSchema.safeParse(req.body);

    if (!validatedData.success) {
      sendResponse(res, 400, false, "Datos inválidos.", validatedData.error);
      return;
    }

    const updatedPlan = await db.plan.update({
      where: { id },
      data: validatedData.data,
    });

    sendResponse(res, 200, true, "Plan actualizado correctamente", updatedPlan);
  } catch (error) {
    console.error("Error al actualizar el plan:", error);
    sendResponse(res, 500, false, "Error al actualizar el plan.");
  }
};

// Delete plan by ID
export const deletePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    sendResponse(res, 400, false, "ID del plan no proporcionado o inválido.");
    return;
  }

  try {
    const plan = await planExists(id);

    if (!plan) {
      sendResponse(res, 404, false, "Plan no encontrado.");
      return;
    }

    await deletePlanById(id);

    sendResponse(res, 200, true, "Plan eliminado con éxito.");
  } catch (error) {
    console.error("Error al eliminar el plan:", error);
    sendResponse(res, 500, false, "Error al eliminar el plan.");
  }
};
