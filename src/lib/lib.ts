import fs from "fs";
import path from "path";
import axios from "axios";
import csv from "csv-parser";
import { db } from "../lib/db";
import { Response } from "express";

// Obtener todas las rutas
export const fetchAllRoutes = async () => {
  try {
    const routes = await db.route.findMany({
      include: {
        driver: true,
        orders: true,
      },
    });

    return routes.map((route) => ({
      id: route.id,
      driverId: route.driverId,
      driver: route.driver,
      date: route.date.toISOString().split("T")[0],
      notes: route.notes,
      orders: route.orders,
    }));
  } catch (error) {
    console.error("Error al consultar rutas en la base de datos:", error);
    throw new Error("Error al obtener las rutas.");
  }
};

// Obterner una ruta por ID desde la base de datos
export const fetchRouteByIdFromDB = async (id: number) => {
  try {
    return await db.route.findUnique({
      where: { id },
      include: { orders: true, driver: true },
    });
  } catch (error) {
    console.error("Error al obtener ruta de la base de datos:", error);
    throw new Error("Error al consultar la base de datos.");
  }
};

// Verificar si la ruta ya existe
export const routeExists = async (id: number) => {
  return db.route.findUnique({ where: { id } });
};

// Obtener todos los conductores
export const fetchAllDrivers = async () => {
  try {
    const drivers = await db.driver.findMany({
      select: { id: true, name: true },
    });
    return drivers;
  } catch (error) {
    console.error("Error al consultar conductores en la base de datos:", error);
    throw new Error("Error al obtener los conductores.");
  }
};

// Enviar una respuesta JSON
export const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  message: string,
  data: any = null
) => {
  res.status(status).json({ success, message, data });
};

// Crear una nueva ruta
export const createNewRoute = async (data: {
  id: number;
  driverId: number;
  date: string;
  notes: string | null;
  orders: { id: number; sequence: number; value: number; priority: boolean }[];
}) => {
  const { id, driverId, date, notes, orders } = data;

  return db.route.create({
    data: {
      id,
      driverId,
      date: new Date(date),
      notes,
      orders: { create: orders },
    },
  });
};

// Función para eliminar una ruta por ID
export const deleteRouteById = async (id: number) => {
  return db.route.delete({ where: { id } });
};

// Función para manejar errores del servicio externo
export const handleExternalRouteError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      return null;
    } else {
      console.error(
        "Error al obtener ruta del servicio externo:",
        error.message
      );
      throw new Error("Error al obtener la ruta del servicio externo");
    }
  } else {
    console.error(
      "Error inesperado al obtener ruta del servicio externo:",
      error
    );
    throw new Error("Error inesperado al obtener la ruta");
  }
};

// Cargar conductores desde un archivo CSV
export const loadDriversFromCSV = async (): Promise<void> => {
  try {
    // Comprobar si ya existen conductores en la base de datos
    const count = await db.driver.count();
    if (count > 0) {
      console.log("Los conductores ya están cargados en la base de datos.");
      return;
    }

    // Ruta del archivo CSV
    const filePath = path.resolve(__dirname, "../assets/drivers.csv");

    const drivers: { id: number; name: string }[] = [];

    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      drivers.push({ id: parseInt(row.ID), name: row.NAME });
    }

    if (drivers.length === 0) {
      console.log("No se encontraron conductores en el archivo CSV.");
      return;
    }

    await db.driver.createMany({
      data: drivers,
      skipDuplicates: true,
    });

    console.log(`${drivers.length} conductores cargados con éxito.`);
  } catch (error) {
    console.error("Error al cargar los conductores desde el CSV:", error);
  }
};
