const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = "Furia2333";
  const employeePassword = "lodeldonaldvm";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const employeeHash = await bcrypt.hash(employeePassword, 12);

  await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {
      passwordHash: adminHash,
      role: "ADMIN",
    },
    create: {
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: {
      username: "empleado",
    },
    update: {
      passwordHash: employeeHash,
      role: "EMPLOYEE",
    },
    create: {
      username: "empleado",
      passwordHash: employeeHash,
      role: "EMPLOYEE",
    },
  });

  console.log("Usuarios creados correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });