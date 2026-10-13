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
exports.getMenu = getMenu;
exports.createOrder = createOrder;
exports.getOrder = getOrder;
exports.callWaiter = callWaiter;
exports.requestBill = requestBill;
exports.getTableSession = getTableSession;
const menuService = __importStar(require("../services/menu.service"));
const orderService = __importStar(require("../services/order.service"));
const tableService = __importStar(require("../services/table.service"));
const param_1 = require("../utils/param");
const response_1 = require("../utils/response");
async function getMenu(req, res) {
    const qrToken = (0, param_1.readParam)(req, 'qrToken');
    const { table, categories } = await menuService.getPublicMenu(qrToken);
    return (0, response_1.ok)(res, {
        table: { id: table.id, number: table.number, name: table.name, status: table.status },
        categories,
    });
}
async function createOrder(req, res) {
    const qrToken = (0, param_1.readParam)(req, 'qrToken');
    const order = await orderService.createOrder({ qrToken, ...req.body });
    return (0, response_1.ok)(res, order, 'Order placed', 201);
}
async function getOrder(req, res) {
    const order = await orderService.getOrderById((0, param_1.readParam)(req, 'orderId'));
    // Public projection — never leak internal fields.
    return (0, response_1.ok)(res, {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        note: order.note,
        createdAt: order.createdAt,
        table: order.table,
        items: order.items.map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            note: i.note,
            itemStatus: i.itemStatus,
        })),
    });
}
async function callWaiter(req, res) {
    const qrToken = (0, param_1.readParam)(req, 'qrToken');
    await tableService.getTableByToken(qrToken);
    const result = await orderService.requestWaiter(qrToken, 'waiter');
    return (0, response_1.ok)(res, result, 'Waiter notified');
}
async function requestBill(req, res) {
    const qrToken = (0, param_1.readParam)(req, 'qrToken');
    await tableService.getTableByToken(qrToken);
    const result = await orderService.requestWaiter(qrToken, 'bill');
    return (0, response_1.ok)(res, result, 'Bill requested');
}
async function getTableSession(req, res) {
    const qrToken = (0, param_1.readParam)(req, 'qrToken');
    const table = await tableService.getTableByToken(qrToken);
    const orders = await orderService.listOrders({ tableId: table.id, limit: 20 });
    return (0, response_1.ok)(res, orders);
}
