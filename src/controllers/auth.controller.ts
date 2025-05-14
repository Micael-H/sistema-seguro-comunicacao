import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const register = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, roleId } = req.body;

  try {
    if (!name || !email || !password || !roleId) {
      return res
        .status(400)
        .json({ message: "Preencha todos os campos obrigatórios." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Usuário já existente." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let defaultRole = await prisma.role.findFirst({
      where: { name: "user" },
    });

    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: "user",
          description: "Usuário padrão do sistema",
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        roleId: defaultRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (e) {
    console.error("Erro no registro:", e);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      await prisma.accessLog.create({
        data: {
          userId: user?.id || "Desconhecido",
          action: "LOGIN_FAILED",
          ipAddress: req.ip || "",
        },
      });

      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      await prisma.accessLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_FAILED",
          ipAddress: req.ip || "",
        },
      });

      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_SUCCESS",
        ipAddress: req.ip || "",
      },
    });

    return res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (e) {
    console.error("Erro no login", e);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};
