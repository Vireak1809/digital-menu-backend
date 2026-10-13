import type { Request, Response } from 'express';
import * as menuService from '../services/menu.service';
import * as orderService from '../services/order.service';
import * as tableService from '../services/table.service';
import { readParam } from '../utils/param';
import { ok } from '../utils/response';

export async function getMenu(req: Request, res: Response) {
  const qrToken = readParam(req, 'qrToken');
  const { table, categories } = await menuService.getPublicMenu(qrToken);
  return ok(res, {
    table: { id: table.id, number: table.number, name: table.name, status: table.status },
    categories,
  });
}

export async function createOrder(req: Request, res: Response) {
  const qrToken = readParam(req, 'qrToken');
  const order = await orderService.createOrder({ qrToken, ...req.body });
  return ok(res, order, 'Order placed', 201);
}

export async function getOrder(req: Request, res: Response) {
  const order = await orderService.getOrderById(readParam(req, 'orderId'));
  // Public projection — never leak internal fields.
  return ok(res, {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    note: order.note,
    createdAt: order.createdAt,
    table: order.table,
    items: order.items.map((i: any) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      note: i.note,
      itemStatus: i.itemStatus,
    })),
  });
}

export async function callWaiter(req: Request, res: Response) {
  const qrToken = readParam(req, 'qrToken');
  await tableService.getTableByToken(qrToken);
  const result = await orderService.requestWaiter(qrToken, 'waiter');
  return ok(res, result, 'Waiter notified');
}

export async function requestBill(req: Request, res: Response) {
  const qrToken = readParam(req, 'qrToken');
  await tableService.getTableByToken(qrToken);
  const result = await orderService.requestWaiter(qrToken, 'bill');
  return ok(res, result, 'Bill requested');
}

export async function getTableSession(req: Request, res: Response) {
  const qrToken = readParam(req, 'qrToken');
  const table = await tableService.getTableByToken(qrToken);
  const orders = await orderService.listOrders({ tableId: table.id, limit: 20 });
  return ok(res, orders);
}