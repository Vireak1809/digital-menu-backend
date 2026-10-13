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
exports.reorderItems = exports.deleteItem = exports.updateItem = exports.createItem = exports.listItems = exports.reorderCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = void 0;
const menuService = __importStar(require("../services/menu.service"));
const param_1 = require("../utils/param");
const response_1 = require("../utils/response");
const listCategories = async (_req, res) => (0, response_1.ok)(res, await menuService.listCategories());
exports.listCategories = listCategories;
const createCategory = async (req, res) => (0, response_1.ok)(res, await menuService.createCategory(req.body), 'Category created', 201);
exports.createCategory = createCategory;
const updateCategory = async (req, res) => (0, response_1.ok)(res, await menuService.updateCategory((0, param_1.readParam)(req, 'id'), req.body), 'Category updated');
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    await menuService.deleteCategory((0, param_1.readParam)(req, 'id'));
    return (0, response_1.ok)(res, null, 'Category deleted');
};
exports.deleteCategory = deleteCategory;
const reorderCategories = async (req, res) => {
    await menuService.reorderCategories(req.body.ids);
    return (0, response_1.ok)(res, null, 'Order saved');
};
exports.reorderCategories = reorderCategories;
const listItems = async (req, res) => (0, response_1.ok)(res, await menuService.listMenuItems(req.query));
exports.listItems = listItems;
const createItem = async (req, res) => (0, response_1.ok)(res, await menuService.createMenuItem(req.body), 'Item created', 201);
exports.createItem = createItem;
const updateItem = async (req, res) => (0, response_1.ok)(res, await menuService.updateMenuItem((0, param_1.readParam)(req, 'id'), req.body), 'Item updated');
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    await menuService.deleteMenuItem((0, param_1.readParam)(req, 'id'));
    return (0, response_1.ok)(res, null, 'Item deleted');
};
exports.deleteItem = deleteItem;
const reorderItems = async (req, res) => {
    await menuService.reorderMenuItems(req.body.ids);
    return (0, response_1.ok)(res, null, 'Order saved');
};
exports.reorderItems = reorderItems;
