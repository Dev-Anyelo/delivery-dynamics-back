import { db } from "./db";
import { Response } from "express";
import { User } from "@prisma/client";

// Handle login attempts and block user if necessary
export const handleLoginAttempts = async (
  user: User,
  res: Response
): Promise<boolean> => {
  if (user.loginAttempts >= 3 && user.lastLoginAttempt) {
    const timeDiff = Date.now() - user.lastLoginAttempt.getTime();

    // 15 minutes ago
    if (timeDiff < 15 * 60 * 1000) {
      res.status(429).json({
        success: false,
        message:
          "Su cuenta ha sido temporalmente bloqueada debido a múltiples intentos fallidos de inicio de sesión. Por favor, espere 15 minutos antes de intentar nuevamente.",
      });
      return true;
    }
  }
  return false;
};

// Reset login attempts
export const resetLoginAttempts = async (user: User): Promise<void> => {
  await db.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: 0,
      lastLoginAttempt: null,
    },
  });
};

// update last login attempt
export const updateLoginAttempt = async (user: User): Promise<void> => {
  await db.user.update({
    where: { id: user.id },
    data: {
      loginAttempts: { increment: 1 },
      lastLoginAttempt: new Date(),
    },
  });
};
