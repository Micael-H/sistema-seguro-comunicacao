import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { logAction } from "../utils";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const createRole = async (req: Request, res: Response): Promise<any> => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  try {
    const newRole = await prisma.role.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json(newRole);
  } catch (error) {
    console.error("Erro ao criar role:", error);
    return res.status(500).json({ error: "Erro interno ao criar função" });
  }
};

export const register = async (req: Request, res: Response): Promise<any> => {
  const { name, email, password, roleId } = req.body;

  try {
    if (!name || !email || !password) {
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

    let finalRoleId = roleId;

    if (!roleId) {
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

      finalRoleId = defaultRole.id;
    } else {
      const roleExists = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!roleExists) {
        return res.status(400).json({ message: "RoleId inválido." });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        roleId: finalRoleId,
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

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(200).json({
      message:
        "Se o e-mail estiver cadastrado, um link de redefinição será exibido.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  const resetLink = `http://localhost:5501/front-end/pages/reset-password.html?token=${token}`;

  return res.status(200).json({
    message: "Token gerado. Use o link abaixo para redefinir sua senha.",
    resetLink,
    token,
  });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ message: "Token e nova senha são obrigatórios." });
  }

  try {
    const resetEntry = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetEntry || resetEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }

    const user = await prisma.user.findUnique({
      where: { id: resetEntry.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const newHashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHashedPassword,
        updatedAt: new Date(),
      },
    });

    await prisma.passwordReset.delete({
      where: { token },
    });

    return res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (e) {
    console.error("Erro ao redefinir senha:", e);
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user?.userId;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await logAction(userId ?? "", "ACCOUNT_DELETED", req.ip);

    return res.status(200).json({ message: "Conta excluída com sucesso." });
  } catch (e) {
    return res.status(500).json({ message: "Erro ao excluir conta." });
  }
};
