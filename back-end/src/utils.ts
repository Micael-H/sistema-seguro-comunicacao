import { prisma } from "./prisma/client";

export async function logAction(
  userId: string,
  action: string,
  ip: string = ""
) {
  await prisma.accessLog.create({
    data: {
      userId,
      action,
      ipAddress: ip,
    },
  });
}
