"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
exports.imageUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith("image/"))
            return callback(new errors_1.AppError("Only image uploads are allowed", 400));
        callback(null, true);
    },
});
