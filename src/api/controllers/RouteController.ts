import { z } from "zod";
import { db } from "../../lib/db";
import { Request, Response } from "express";
import { RouteGroupSchema, RouteSchema } from "../../schemas/schemas";

import {
  createNewRouteGroup,
  fetchAllRouteGroups,
  handleExternalAPIError,
  routeExists,
  sendResponse,
  fetchRouteByIdFromDB,
  getExternalRouteGroups,
  fetchRouteByID,
  getExternalRouteById,
  updateRouteGroupFromDB,
  deleteRouteById,
  deleteRouteGroupById,
} from "../../lib/lib";

// ------ ROUTE GROUPS ------ //

// Get all route groups
export const getAllRouteGroups = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const routesFromDB = await fetchAllRouteGroups();

    if (routesFromDB && routesFromDB.length > 0) {
      return sendResponse(
        res,
        200,
        true,
        "Rutas encontradas en la base de datos.",
        routesFromDB
      );
    }

    // No routes in DB, fetch from external API
    try {
      const routesFromExternalService = await getExternalRouteGroups();

      if (routesFromExternalService && routesFromExternalService.length > 0) {
        return sendResponse(
          res,
          200,
          true,
          "Rutas encontradas en la API externa.",
          routesFromExternalService
        );
      }

      return sendResponse(
        res,
        404,
        false,
        "No se encontraron rutas en ninguna fuente"
      );
    } catch (error) {
      console.error("Error al obtener las rutas de la API externa:", error);
      handleExternalAPIError(error);
      return sendResponse(
        res,
        500,
        false,
        "Error al obtener rutas de la API externa"
      );
    }
  } catch (error: unknown) {
    console.error("Error en el controlador al cargar las rutas:", error);
    sendResponse(res, 500, false, "Error al cargar las rutas.");
  }
};

// Get route groups by ID
export const getRouteGroupsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "")
    return sendResponse(
      res,
      400,
      false,
      "ID de la ruta no proporcionado o inválido."
    );

  try {
    const routeFromDB = await fetchRouteByIdFromDB(id);

    if (routeFromDB) {
      return sendResponse(
        res,
        200,
        true,
        "Ruta encontrada en la base de datos.",
        routeFromDB
      );
    }

    // If not in database, fetch from external API
    try {
      const routeFromExternalService = await getExternalRouteGroups(id);

      if (routeFromExternalService) {
        return sendResponse(
          res,
          200,
          true,
          "Ruta encontrada en la API externa",
          routeFromExternalService
        );
      }
    } catch (apiError) {
      console.log("Error al obtener la ruta de la API externa:", apiError);
      handleExternalAPIError(apiError);
      return;
    }

    return sendResponse(
      res,
      404,
      false,
      `Ruta con ID '${id}' no encontrada en ninguna fuente.`
    );
  } catch (error) {
    console.error(`Error al obtener la ruta ${id}:`, error);
    return sendResponse(res, 500, false, "Error interno al buscar la ruta.");
  }
};

// Create new route group

export const createRouteGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = RouteGroupSchema.parse(req.body);

    const existingRoute = await routeExists(validatedData.id);

    if (existingRoute) {
      return sendResponse(
        res,
        409,
        false,
        "La Ruta ya existe en la base de datos."
      );
    }

    // Crear nueva ruta
    const newRouteGroup = await createNewRouteGroup(validatedData);

    sendResponse(res, 201, true, "Ruta creada exitosamente.", newRouteGroup);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Datos inválidos.", error.errors);
    }

    console.error("Error al crear la ruta:", error);
    sendResponse(res, 500, false, "Error al crear la ruta.");
  }
};

// Update route group by ID
export const updateRouteGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID del route group no proporcionado o inválido."
    );
  }

  try {
    const existingRoute = await routeExists(id);

    if (!existingRoute) {
      return sendResponse(res, 404, false, "Route Group no encontrado.");
    }

    const validatedData = RouteGroupSchema.safeParse(req.body);

    if (!validatedData.success) {
      return sendResponse(
        res,
        400,
        false,
        "Datos inválidos",
        validatedData.error.format()
      );
    }

    const updateRouteGroup = await updateRouteGroupFromDB(
      id,
      validatedData.data
    );

    sendResponse(
      res,
      200,
      true,
      "Route Group actualizado correctamente",
      updateRouteGroup
    );
  } catch (error) {
    console.error("Error al actualizar el route group:", error);
    sendResponse(res, 500, false, "Error al actualizar el route group.");
  }
};

// Delete route group by ID
export const deleteRouteGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || id.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID del route group no proporcionado o inválido."
    );
  }

  try {
    const existingRoute = await routeExists(id);

    if (!existingRoute) {
      return sendResponse(res, 404, false, "Route Group no encontrado.");
    }

    await deleteRouteGroupById(id);

    sendResponse(res, 200, true, "Route Group eliminado correctamente.");
  } catch (error) {
    console.error("Error al eliminar el route group:", error);
    sendResponse(res, 500, false, "Error al eliminar el route group.");
  }
};

// ------ ROUTE ------ //

// Get a route by route group ID
export const getRouteByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { routeGroupId, routeId } = req.params;

  if (!routeGroupId || routeGroupId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de grupo de rutas no proporcionado o inválido."
    );
  }

  if (!routeId || routeId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de ruta no proporcionado o inválido."
    );
  }

  try {
    const routes = await fetchRouteByID(routeGroupId, routeId);

    if (routes && routes.length > 0) {
      return sendResponse(
        res,
        200,
        true,
        "Rutas encontradas en la base de datos.",
        routes
      );
    }

    // No routes in DB, fetch from external API
    try {
      const externalRoute = await getExternalRouteById(routeGroupId, routeId);

      if (externalRoute) {
        return sendResponse(
          res,
          200,
          true,
          "Rutas encontradas en la API externa.",
          externalRoute
        );
      }
    } catch (error) {
      console.error("Error al obtener las rutas de la API externa:", error);
      handleExternalAPIError(error);
      return sendResponse(
        res,
        500,
        false,
        "Error al obtener rutas de la API externa."
      );
    }

    return sendResponse(res, 404, false, "No se encontraron rutas.");
  } catch (error) {
    console.error("Error al obtener las rutas:", error);
    sendResponse(res, 500, false, "Error al obtener las rutas.");
  }
};

// Create new route
export const createRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { routeGroupId } = req.params;

  if (!routeGroupId || routeGroupId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de grupo de rutas no proporcionado o inválido."
    );
  }

  try {
    const validatedData = RouteSchema.parse(req.body);

    const existingRoute = await routeExists(validatedData.id);

    if (existingRoute) {
      return sendResponse(
        res,
        409,
        false,
        "La ruta ya existe en la base de datos."
      );
    }

    const newRoute = await db.route.create({
      data: validatedData,
    });

    sendResponse(res, 201, true, "Ruta creada exitosamente.", newRoute);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Datos inválidos.", error.errors);
    }

    console.error("Error al crear la ruta:", error);
    sendResponse(res, 500, false, "Error al crear la ruta.");
  }
};

// Update route by ID
export const updateRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { routeGroupId, routeId } = req.params;

  if (!routeGroupId || routeGroupId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de grupo de rutas no proporcionado o inválido."
    );
  }

  if (!routeId || routeId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de ruta no proporcionado o inválido."
    );
  }

  try {
    const existingRoute = await routeExists(routeId);

    if (!existingRoute) {
      return sendResponse(res, 404, false, "Ruta no encontrada.");
    }

    const validatedData = RouteSchema.safeParse(req.body);

    if (!validatedData.success) {
      return sendResponse(
        res,
        400,
        false,
        "Datos inválidos",
        validatedData.error.format()
      );
    }

    const updatedRoute = await db.route.update({
      where: { id: routeId },
      data: validatedData.data,
    });

    sendResponse(
      res,
      200,
      true,
      "Ruta actualizada correctamente",
      updatedRoute
    );
  } catch (error) {
    console.error("Error al actualizar la ruta:", error);
    sendResponse(res, 500, false, "Error al actualizar la ruta.");
  }
};

// Delete route by ID
export const deleteRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { routeGroupId, routeId } = req.params;

  if (!routeGroupId || routeGroupId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de grupo de rutas no proporcionado o inválido."
    );
  }

  if (!routeId || routeId.trim() === "") {
    return sendResponse(
      res,
      400,
      false,
      "ID de ruta no proporcionado o inválido."
    );
  }

  try {
    const existingRoute = await routeExists(routeId);

    if (!existingRoute) {
      return sendResponse(res, 404, false, "Ruta no encontrada.");
    }

    await deleteRouteById(routeId);

    sendResponse(res, 200, true, "Ruta eliminada correctamente.");
  } catch (error) {
    console.error("Error al eliminar la ruta:", error);
    sendResponse(res, 500, false, "Error al eliminar la ruta.");
  }
};
