import axios from "axios";
import { db } from "../../lib/db";
import config from "../../config/config";
import { Request, Response } from "express";
import { routeExists } from "../../lib/lib";
import { RouteSchema } from "../../schemas/schemas";

// Obtener todas las rutas
export const getAllRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await db.route.findMany({
      include: {
        driver: true,
        orders: true,
      },
    });

    const formattedRoutes = routes.map((route) => ({
      id: route.id,
      driverId: route.driverId,
      driver: route.driver,
      date: route.date.toISOString().split("T")[0],
      notes: route.notes,
      orders: route.orders,
    }));

    res.status(200).json(formattedRoutes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las rutas", error });
  }
};

// Obtener una ruta por ID
export const getRouteById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  // Validación del ID de la ruta
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ message: "ID de ruta inválido" });
  }

  try {
    // Verificar si la ruta existe en la base de datos
    const route = await db.route.findUnique({
      where: { id: Number(id) },
      include: { orders: true, driver: true },
    });

    // Si la ruta se encuentra en la base de datos
    if (route) {
      return res.status(200).json({
        success: true,
        data: route,
        message: "Ruta encontrada desde la base de datos",
      });
    }

    // Si la ruta no existe en la base de datos, intentar obtenerla desde el servicio externo
    const externalRouteData = await getExternalRoute(id);

    // Si la ruta se encuentra en el servicio externo
    if (externalRouteData) {
      return res.status(200).json({
        success: true,
        data: externalRouteData,
        message: "Ruta encontrada en servicio externo",
      });
    }

    return res.status(404).json({
      success: false,
      message:
        "Ruta no encontrada en la base de datos ni en el servicio externo",
    });
  } catch (error: any) {
    // Manejo de errores
    return res.status(500).json({
      success: false,
      message: "Error al obtener la ruta",
      error: error.message,
    });
  }
};

// Crear una nueva ruta
export const createRoute = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id, driverId, date, notes, orders } = req.body;

  try {
    // Verificar si la ruta ya existe en la base de datos
    const existingRoute = await db.route.findUnique({
      where: { id },
    });

    if (existingRoute) {
      // Si la ruta ya existe, devolver un mensaje de error
      return res.status(200).json({
        success: false,
        message: "La ruta ya existe en la base de datos",
        data: existingRoute,
      });
    }

    // Si la ruta no existe, crear una nueva
    const newRoute = await db.route.create({
      data: {
        id,
        driverId,
        date: new Date(date),
        notes,
        orders: {
          create: orders,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Ruta creada exitosamente",
      data: newRoute,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error al crear la ruta",
      error: error.message,
    });
  }
};

// Actualizar una ruta por ID
export const updateRoute = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ message: "ID de ruta inválido" });
  }

  try {
    const route = await routeExists(Number(id));

    if (!route) return res.status(404).json({ message: "Ruta no encontrada" });

    const parsed = RouteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Datos inválidos", errors: parsed.error.format() });
    }

    const { driverId, date, notes, orders } = parsed.data;

    // Primero actualizamos la ruta
    const updatedRoute = await db.route.update({
      where: { id: Number(id) },
      data: {
        driverId,
        date: new Date(date),
        notes,
      },
      include: { driver: true, orders: true },
    });

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
          // Si la orden no existe, la insertamos
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

    res.status(200).json({
      message: "Ruta actualizada correctamente",
      data: { ...updatedRoute, orders: updatedOrders },
    });
  } catch (error: any) {
    console.error("Error al actualizar la ruta:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar la ruta", error: error.message });
  }
};

// Obtener todos los conductores
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await db.driver.findMany({
      select: { id: true, name: true },
    });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error loading drivers." });
  }
};

// Obtener una ruta desde un servicio externo
export const getExternalRoute = async (id: string) => {
  try {
    const { EXTERNAL_SERVICE_URL } = config;
    const response = await axios.get(`${EXTERNAL_SERVICE_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    } else {
      throw new Error("Error fetching route from external service");
    }
  }
};

// Eliminar una ruta por ID
export const deleteRoute = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ message: "ID de ruta inválido" });
  }

  try {
    const route = await routeExists(Number(id));

    if (!route) return res.status(404).json({ message: "Ruta no encontrada" });

    await db.route.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Ruta eliminada con éxito" });
  } catch (error: any) {
    console.error("Error al eliminar la ruta:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar la ruta", error: error.message });
  }
};
