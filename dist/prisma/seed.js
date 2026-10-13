"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const envPath = node_path_1.default.resolve(process.cwd(), node_path_1.default.basename(process.cwd()) === "server" ? "../.env" : ".env");
dotenv_1.default.config({ path: envPath });
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
    const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name: "Restaurant Admin", email, passwordHash, role: client_1.UserRole.ADMIN },
    });
    await prisma.restaurantSettings.upsert({
        where: { id: "default" },
        update: {},
        create: { id: "default", restaurantName: "Digital Menu", currency: "USD" },
    });
    await prisma.category.createMany({
        data: [{ name: "Mains", sortOrder: 1 }, { name: "Drinks", sortOrder: 2 }],
        skipDuplicates: true,
    });
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
});
