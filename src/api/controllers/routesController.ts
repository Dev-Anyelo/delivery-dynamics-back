import { Request, Response } from "express";

export const getRoutes = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Get all routes" });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving routes" });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { id, driverId, date, notes, orders } = req.body;

    // Puedes agregar lógica aquí para guardar los datos en la base de datos
    res
      .status(201)
      .json({
        message: "Route created successfully",
        data: { id, driverId, date, notes, orders },
      });
  } catch (error) {
    res.status(500).json({ message: "Error creating route" });
  }
};
