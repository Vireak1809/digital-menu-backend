"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAvailability = exports.stats = exports.updateItemStatus = exports.updateStatus = exports.get = exports.list = void 0;
const orderService = __importStar(require("../services/order.service"));
const menuService = __importStar(require("../services/menu.service"));
const param_1 = require("../utils/param");
const response_1 = require("../utils/response");
const emitter_1 = require("../sockets/emitter");
const list = async (req, res) => (0, response_1.ok)(res, await orderService.listOrders(req.query));
exports.list = list;
const get = async (req, res) => (0, response_1.ok)(res, await orderService.getOrderById((0, param_1.readParam)(req, 'id')));
exports.get = get;
const updateStatus = async (req, res) => (0, response_1.ok)(res, await orderService.updateOrderStatus((0, param_1.readParam)(req, 'id'), req.body.status, req.body.cancelReason), 'Status updated');
exports.updateStatus = updateStatus;
const updateItemStatus = async (req, res) => (0, response_1.ok)(res, await orderService.updateOrderItemStatus((0, param_1.readParam)(req, 'id'), (0, param_1.readParam)(req, 'itemId'), req.body.status), 'Item status updated');
exports.updateItemStatus = updateItemStatus;
const stats = async (_req, res) => (0, response_1.ok)(res, await orderService.todayStats());
exports.stats = stats;
/** Availability can be toggled by ADMIN, STAFF, or CHEF (kitchen 86'ing an item). */
const toggleAvailability = async (req, res) => {
    const item = await menuService.setItemAvailability((0, param_1.readParam)(req, 'id'), req.body.isAvailable);
    (0, emitter_1.emitToRoom)('admin', 'order:itemAvailability', { menuItemId: item.id, isAvailable: item.isAvailable });
    (0, emitter_1.emitToRoom)('chef', 'order:itemAvailability', { menuItemId: item.id, isAvailable: item.isAvailable });
    return (0, response_1.ok)(res, item, item.isAvailable ? 'Item available' : 'Item marked out of stock');
};
exports.toggleAvailability = toggleAvailability;
