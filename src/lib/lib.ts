import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { db } from "../lib/db";

// Cargar conductores desde un archivo CSV
export const loadDriversFromCSV = async (): Promise<void> => {
  const existingDrivers = await db.driver.findMany();

  // Si ya existen conductores, omite la carga
  if (existingDrivers.length > 0) {
    console.log("Los conductores ya están cargados en la base de datos.");
    return;
  }

  const drivers: { id: number; name: string }[] = [];

  // Ruta del archivo CSV
  const filePath = path.resolve(__dirname, "../assets/drivers.csv");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      drivers.push({ id: parseInt(row.ID), name: row.NAME });
    })
    .on("end", async () => {
      for (const driver of drivers) {
        try {
          await db.driver.create({
            data: {
              id: driver.id,
              name: driver.name,
            },
          });
          console.log(`Conductor ${driver.name} creado con éxito.`);
        } catch (error) {
          console.error(`Error al guardar el conductor ${driver.name}:`, error);
        }
      }
      console.log("Carga de conductores completada.");
    });
};

// Verificar si la ruta ya existe en la base de datos
export const routeExists = async (id: number): Promise<boolean> => {
  const route = await db.route.findUnique({
    where: { id },
  });

  return !!route;
};
