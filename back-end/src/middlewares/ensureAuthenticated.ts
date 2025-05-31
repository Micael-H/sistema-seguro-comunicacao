/// <reference path="../@types/express/index.d.ts" />
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
}

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Token não informado." });
    return;
  }

  const [, token] = authHeader.split(" ");

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = decoded;

    next();
  } catch (e) {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
};
