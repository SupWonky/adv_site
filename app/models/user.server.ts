import type { Password, User } from "@prisma/client";
import { prisma } from "~/db.server";
import bcrypt from "bcryptjs";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function createUser(
  email: User["email"],
  name: User["name"],
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      name,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
