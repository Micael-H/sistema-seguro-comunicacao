import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getUserLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    const logs = await prisma.accessLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        action: true,
        timestamp: true,
      },
    });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
};

export const getAllUserLogs = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const logs = await prisma.accessLog.findMany({
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        userId: true,
        action: true,
        timestamp: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Erro ao buscar logs", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
