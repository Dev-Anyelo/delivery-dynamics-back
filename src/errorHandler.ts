import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return next();
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      success: false,
      message: "Error de base de datos",
      code: err.code,
    });
    return next();
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Token inválido",
    });
    return next();
  }

  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
  return next();
};
