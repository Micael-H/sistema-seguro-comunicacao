import { Request, Response, NextFunction } from "express";

export function ensureAuthorized(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      res.status(403).json({ message: "Acesso negado." });
      return;
    }

    next();
  };
}
