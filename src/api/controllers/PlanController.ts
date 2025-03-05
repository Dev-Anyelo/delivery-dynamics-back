import { z } from "zod";
import { db } from "../../lib/db";
import { Request, Response } from "express";
import { PlanSchema } from "../../schemas/schemas";

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

  if (!id || id.trim() === "")
    return sendResponse(
      res,
      400,
      false,
      "ID del plan no proporcionado o inválido."
    );

  try {
    const planFromDB = await fetchPlanByIdFromDB(id);

    if (planFromDB) {
      return sendResponse(
        res,
        200,
        true,
        "Plan encontrado en la base de datos.",
        planFromDB
      );
    }

    // If not in database, fetch from external API
    try {
      const planFromExternalService = await getExternalPlan(id);

      if (planFromExternalService) {
        return sendResponse(
          res,
          200,
          true,
          "Plan encontrado en la API externa",
          planFromExternalService
        );
      }
    } catch (apiError) {
      console.log("Error al obtener plan de la API externa:", apiError);
      handleExternalAPIError(apiError);
      return;
    }

    return sendResponse(
      res,
      404,
      false,
      `Plan con ID '${id}' no encontrado en ninguna fuente.`
    );
  } catch (error) {
    console.error(`Error al obtener el plan ${id}:`, error);
    return sendResponse(res, 500, false, "Error interno al buscar el plan.");
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
    return sendResponse(
      res,
      400,
      false,
      "Parámetros de búsqueda no proporcionados."
    );
  }

  try {
    const plans = await db.plan.findMany({
      where: {
        date: new Date(date as string),
        assignedUserId: assignedUserId as string,
      },
    });

    if (plans && plans.length > 0) {
      console.log("Planes encontrados en BD:", plans);
      return sendResponse(
        res,
        200,
        true,
        "Planes encontrados en la base de datos.",
        plans
      );
    }

    try {
      const plansFromExternalService = await getExternalPlanByDateAndUser(
        date as string,
        assignedUserId as string
      );

      if (plansFromExternalService) {
        console.log(
          "Planes obtenidos desde API externa:",
          plansFromExternalService
        );
        return sendResponse(
          res,
          200,
          true,
          "Planes encontrados en la API externa.",
          plansFromExternalService
        );
      }
    } catch (apiError) {
      console.error("Error al obtener planes de la API externa:", apiError);
      return sendResponse(
        res,
        500,
        false,
        "Error al obtener planes de la API externa."
      );
    }

    return sendResponse(
      res,
      404,
      false,
      "Planes no encontrados en ninguna fuente."
    );
  } catch (error) {
    console.error("Error al buscar planes por fecha y usuario:", error);
    return sendResponse(
      res,
      500,
      false,
      "Error al buscar planes por fecha y usuario."
    );
  }
};

// Create new plan
export const createPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = PlanSchema.parse(req.body);

    const existingPlan = await planExists(validatedData.id);

    if (existingPlan) {
      return sendResponse(
        res,
        409,
        false,
        "Plan ya existe en la base de datos."
      );
    }

    // Crear nuevo plan
    const newPlan = await createNewPlan(validatedData);

    sendResponse(res, 201, true, "Plan creado exitosamente.", newPlan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Datos inválidos.", error.errors);
    }

    console.error("Error al crear el plan:", error);
    sendResponse(res, 500, false, "Error al crear el plan.");
  }
};

// Update plan by ID
export const updatePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID del plan no proporcionado o inválido."
    );
  }

  try {
    const existingPlan = await planExists(id);

    if (!existingPlan) {
      return sendResponse(res, 404, false, "Plan no encontrado.");
    }

    const validatedData = PlanSchema.safeParse(req.body);

    if (!validatedData.success) {
      return sendResponse(
        res,
        400,
        false,
        "Datos inválidos",
        validatedData.error.format()
      );
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
    return sendResponse(
      res,
      400,
      false,
      "ID del plan no proporcionado o inválido."
    );
  }

  try {
    const plan = await planExists(id);

    if (!plan) return sendResponse(res, 404, false, "Plan no encontrado.");

    await deletePlanById(id);

    sendResponse(res, 200, true, "Plan eliminado con éxito.");
  } catch (error) {
    console.error("Error al eliminar el plan:", error);
    sendResponse(res, 500, false, "Error al eliminar el plan.");
  }
};
