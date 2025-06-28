import { PrismaClient } from "@prisma/client";
import { singelton } from "./singelton.server";

const prisma = singelton("prsima", () => new PrismaClient());

prisma.$connect();

export { prisma };
