import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: { name: true },
        },
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};
