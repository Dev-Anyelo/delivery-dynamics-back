import { db } from "../../lib/db";
import { Request, Response } from "express";

// Get all routes
export const getRoutes = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Get all routes" });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving routes" });
  }
};

// Create a route
export const createRoute = async (req: Request, res: Response) => {
  try {
    const { id, driverId, date, notes, orders } = req.body;

    res.status(201).json({
      message: "Route created successfully",
      data: { id, driverId, date, notes, orders },
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating route" });
  }
};

// Get all drivers
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await db.driver.findMany();

    res.status(200).json({ drivers });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving drivers", error });
  }
};
