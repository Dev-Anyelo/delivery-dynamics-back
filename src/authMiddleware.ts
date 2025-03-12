import jwt from "jsonwebtoken";
import config from "./config/config";
import { UserRole } from "@prisma/client";
import { Request, Response, NextFunction, RequestHandler } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

const validRoles = Object.values(UserRole);

export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { JWT_SECRET_KEY } = config;
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ success: false, message: "No autorizado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as {
      userId: string;
      role: UserRole;
      iat: number;
      exp: number;
    };

    if (!decoded.userId || !validRoles.includes(decoded.role)) {
      throw new Error("Token inválido");
    }

    req.user = { userId: decoded.userId, role: decoded.role };
    return next();
  } catch (error) {
    res.status(401).json({ success: false, message: "No autorizado" });
    return;
  }
};
