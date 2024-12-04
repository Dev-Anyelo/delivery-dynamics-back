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

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ message: "ID de ruta inválido" });
  }

  try {
    // Buscar en la base de datos
    const route = await db.route.findUnique({
      where: { id: Number(id) },
      include: { orders: true, driver: true },
    });

    if (route) {
      const formattedRoute = {
        id: route.id,
        driverId: route.driverId,
        driver: {
          id: route.driver.id,
          name: route.driver.name,
        },
        date: route.date.toISOString().split("T")[0],
        notes: route.notes,
        orders: route.orders,
      };

      return res.status(200).json({
        message: "Ruta encontrada correctamente desde la base de datos",
        data: formattedRoute,
      });
    }

    // Si no está en la base de datos, buscar en el servicio externo
    const { EXTERNAL_SERVICE_URL } = config;

    try {
      const externalServiceResponse = await axios.get(
        `${EXTERNAL_SERVICE_URL}/${id}`
      );

      return res.status(200).json({
        message: "Ruta encontrada correctamente desde el servicio externo",
        data: externalServiceResponse.data,
      });
    } catch (externalError: any) {
      if (externalError.response?.status === 404) {
        return res.status(404).json({
          message:
            "Ruta no encontrada en el servicio externo ni en la base de datos",
        });
      }
      throw externalError;
    }
  } catch (error: any) {
    console.error("Error al obtener la ruta:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener la ruta", error: error.message });
  }
};

// Crear una nueva ruta
export const createRoute = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsed = RouteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Datos inválidos", errors: parsed.error.format() });
    }

    const { id, driverId, date, notes, orders } = parsed.data;

    // Verifica si la ruta ya existe en la base de datos
    const existingRoute = await db.route.findUnique({
      where: { id: Number(id) },
      include: { orders: true, driver: true },
    });

    if (existingRoute) {
      return res.status(400).json({
        message: "La ruta ya existe, por favor intenta nuevamente",
      });
    }

    // Si no existe, la creamos en la base de datos
    const newRoute = await db.route.create({
      data: {
        id,
        driverId,
        date: new Date(date),
        notes,
        orders: {
          create: orders.map((order) => ({
            id: order.id,
            sequence: order.sequence,
            value: order.value,
            priority: order.priority,
          })),
        },
      },
      include: { driver: true, orders: true },
    });

    return res
      .status(201)
      .json({ message: "Ruta creada exitosamente.", data: newRoute });
  } catch (error: any) {
    console.error("Error al crear la ruta:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor.", error: error.message });
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
export const getExternalRoute = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`http://localhost:3002/routes/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({ message: "Route not found in external service" });
    } else {
      res
        .status(500)
        .json({ message: "Error fetching route from external service" });
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
