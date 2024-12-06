import { z } from "zod";
import axios from "axios";
import { db } from "../../lib/db";
import config from "../../config/config";
import { Request, Response } from "express";
import { RouteSchema } from "../../schemas/schemas";

import {
  createNewRoute,
  deleteRouteById,
  fetchAllDrivers,
  fetchAllRoutes,
  fetchRouteByIdFromDB,
  handleExternalRouteError,
  routeExists,
  sendResponse,
} from "../../lib/lib";

// Obtener todas las rutas
export const getAllRoutes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const routes = await fetchAllRoutes();
    sendResponse(res, 200, true, "Rutas cargadas exitosamente.", routes);
  } catch (error: unknown) {
    console.error("Error en el controlador al cargar rutas:", error);
    sendResponse(res, 500, false, "Error al cargar rutas.");
  }
};

// Obtener ruta por ID
export const getRouteById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return sendResponse(res, 400, false, "ID de ruta inválido.");
  }

  try {
    // Buscar ruta en la base de datos
    const routeFromDB = await fetchRouteByIdFromDB(Number(id));

    if (routeFromDB) {
      return sendResponse(
        res,
        200,
        true,
        "Ruta encontrada en la base de datos.",
        routeFromDB
      );
    }

    // Si no se encuentra en la base de datos, buscar en el servicio externo
    const routeFromExternalService = await getExternalRoute(id);

    if (routeFromExternalService) {
      return sendResponse(
        res,
        200,
        true,
        "Ruta encontrada en el servicio externo.",
        routeFromExternalService
      );
    }

    // Si no se encuentra ni en la base de datos ni en el servicio externo
    return sendResponse(
      res,
      404,
      false,
      "Ruta no encontrada en la base de datos ni en el servicio externo."
    );
  } catch (error) {
    console.error("Error al obtener la ruta:", error);
    return sendResponse(res, 500, false, "Error al buscar la ruta.");
  }
};

// Crear una nueva ruta
export const createRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = RouteSchema.parse(req.body);

    // Verificar si la ruta ya existe
    const existingRoute = await routeExists(validatedData.id);
    if (existingRoute) {
      return sendResponse(
        res,
        409,
        false,
        "La ruta ya existe en la base de datos."
      );
    }

    // Crear nueva ruta
    const newRoute = await createNewRoute(validatedData);

    sendResponse(res, 201, true, "Ruta creada exitosamente.", newRoute);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendResponse(res, 400, false, "Datos inválidos.", error.errors);
    }

    console.error("Error al crear la ruta:", error);
    sendResponse(res, 500, false, "Error al crear la ruta.");
  }
};

// Obtener una ruta desde un servicio externo
export const getExternalRoute = async (id: string): Promise<any> => {
  const { EXTERNAL_SERVICE_URL } = config;

  try {
    const response = await axios.get(`${EXTERNAL_SERVICE_URL}/${id}`);
    return response.data;
  } catch (error) {
    return handleExternalRouteError(error);
  }
};

// Actualizar una ruta por ID
export const updateRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return sendResponse(res, 400, false, "ID de ruta inválido");
  }

  try {
    const route = await routeExists(Number(id));

    if (!route) {
      return sendResponse(res, 404, false, "Ruta no encontrada");
    }

    const parsed = RouteSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendResponse(
        res,
        400,
        false,
        "Datos inválidos",
        parsed.error.format()
      );
    }

    const { driverId, date, notes, orders } = parsed.data;

    // Actualizar ruta
    const updatedRoute = await db.route.update({
      where: { id: Number(id) },
      data: {
        driverId,
        date: new Date(date),
        notes,
      },
      include: { driver: true, orders: true },
    });

    // Actualizar o crear órdenes
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        if (order.id) {
          return db.order.update({
            where: { id: order.id },
            data: {
              sequence: order.sequence,
              value: order.value,
              priority: order.priority,
            },
          });
        } else {
          return db.order.create({
            data: {
              routeId: Number(id),
              sequence: order.sequence,
              value: order.value,
              priority: order.priority,
            },
          });
        }
      })
    );

    sendResponse(res, 200, true, "Ruta actualizada correctamente", {
      ...updatedRoute,
      orders: updatedOrders,
    });
  } catch (error: any) {
    sendResponse(res, 500, false, "Error al actualizar la ruta", {
      error: error.message,
    });
  }
};

// Obtener todos los conductores
export const getDrivers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const drivers = await fetchAllDrivers();
    sendResponse(res, 200, true, "Conductores cargados exitosamente.", drivers);
  } catch (error: unknown) {
    console.error("Error en el controlador al cargar conductores:", error);
    sendResponse(res, 500, false, "Error al cargar conductores.");
  }
};

// Eliminar una ruta por ID
export const deleteRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return sendResponse(res, 400, false, "ID de ruta inválido.");
  }

  try {
    const route = await routeExists(Number(id));
    if (!route) {
      return sendResponse(res, 404, false, "Ruta no encontrada.");
    }

    // Eliminar ruta por ID
    await deleteRouteById(Number(id));

    // Respuesta exitosa
    sendResponse(res, 200, true, "Ruta eliminada con éxito.");
  } catch (error) {
    // Manejo de errores genéricos
    console.error("Error al eliminar la ruta:", error);
    sendResponse(res, 500, false, "Error al eliminar la ruta.");
  }
};
