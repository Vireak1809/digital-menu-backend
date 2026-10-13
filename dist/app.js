"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middleware/error");
const upload_1 = require("./middleware/upload");
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use((0, cors_1.default)({
        origin: (origin, cb) => {
            if (!origin || env_1.env.corsOrigins.includes(origin))
                return cb(null, true);
            return cb(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)(env_1.env.isProd ? 'combined' : 'dev'));
    // Static uploads
    app.use('/uploads', express_1.default.static(upload_1.uploadDir, { maxAge: '7d' }));
    app.use('/api', routes_1.default);
    app.use(error_1.notFoundHandler);
    app.use(error_1.errorHandler);
    return app;
}
