"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const zod_1 = require("zod");
const envPath = node_path_1.default.resolve(process.cwd(), node_path_1.default.basename(process.cwd()) === "server" ? "../.env" : ".env");
dotenv_1.default.config({ path: envPath });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(24),
    JWT_EXPIRES_IN: zod_1.z.string().default("1d"),
    CLIENT_URL: zod_1.z.string().default("http://localhost:5173"),
});
exports.env = envSchema.parse(process.env);
