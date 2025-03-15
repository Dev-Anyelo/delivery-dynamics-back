import { db } from "../../lib/db";
import { User } from "../../types/types";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../../lib/lib";
import { UserSchema } from "../../schemas/schemas";
import { NextFunction, Request, RequestHandler, Response } from "express";

// Get All Users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get User By Id
export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create User
export const createUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = UserSchema.parse(req.body);

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "El usuario ya existe, por favor intenta nuevamente",
      });
      return;
    }

    // Validate the role
    if (!role || !Object.values(UserRole).includes(role)) {
      res.status(400).json({
        success: false,
        message: "Rol inválido, elige entre USER, ADMIN o MANAGER",
      });
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password!);

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
    res.status(400).json({ success: false, message: "Error en el registro" });
  }
};

// Update User
export const updateUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, role, password, isActive } = UserSchema.parse(
      req.body
    );

    const user = await db.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    // Validate the role
    if (!role || !Object.values(UserRole).includes(role)) {
      res.status(400).json({
        success: false,
        message: "Rol inválido, elige entre USER, ADMIN o MANAGER",
      });
      return;
    }

    // Check if the email is already in use by another user
    if (email !== user.email) {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "El correo electrónico ya está en uso, intenta nuevamente",
        });
        return;
      }
    }

    const updateData: Partial<User> = { name, email, role, isActive };

    // Hash the password if provided
    if (password) updateData.password = await hashPassword(password);

    await db.user.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      user: updateData,
    });
  } catch (error) {
    console.error("Update error:", error);
    next(error);
    res
      .status(400)
      .json({ success: false, message: "Error al actualizar el usuario" });
  }
};

// Delete User
export const deleteUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;

    // Validate user ID format
    if (!userId || typeof userId !== "string") {
      res.status(400).json({
        success: false,
        message: "ID de usuario inválido",
      });
      return;
    }

    const user = await db.user.findUnique({ where: { id: userId } });

    // Check if user exists
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    await db.user.delete({ where: { id: userId } });

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Delete error:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
    });
  }
};
