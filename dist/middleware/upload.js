"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDir = exports.upload = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const dir = node_path_1.default.resolve(process.cwd(), env_1.env.UPLOAD_DIR);
node_fs_1.default.mkdirSync(dir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
        const ext = node_path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
            return cb((0, errors_1.badRequest)('Only image files are allowed'));
        }
        cb(null, true);
    },
});
exports.uploadDir = dir;
