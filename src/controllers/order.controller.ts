import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import * as menuService from '../services/menu.service';
import { readParam } from '../utils/param';
import { ok } from '../utils/response';
import { emitToRoom } from '../sockets/emitter';

export const list = async (req: Request, res: Response) =>
  ok(res, await orderService.listOrders(req.query as never));

export const get = async (req: Request, res: Response) => ok(res, await orderService.getOrderById(readParam(req, 'id')));

export const updateStatus = async (req: Request, res: Response) =>
  ok(res, await orderService.updateOrderStatus(readParam(req, 'id'), req.body.status, req.body.cancelReason), 'Status updated');

export const updateItemStatus = async (req: Request, res: Response) =>
  ok(
    res,
    await orderService.updateOrderItemStatus(readParam(req, 'id'), readParam(req, 'itemId'), req.body.status),
    'Item status updated',
  );

export const stats = async (_req: Request, res: Response) => ok(res, await orderService.todayStats());

/** Availability can be toggled by ADMIN, STAFF, or CHEF (kitchen 86'ing an item). */
export const toggleAvailability = async (req: Request, res: Response) => {
  const item = await menuService.setItemAvailability(readParam(req, 'id'), req.body.isAvailable);
  emitToRoom('admin', 'order:itemAvailability', { menuItemId: item.id, isAvailable: item.isAvailable });
  emitToRoom('chef', 'order:itemAvailability', { menuItemId: item.id, isAvailable: item.isAvailable });
  return ok(res, item, item.isAvailable ? 'Item available' : 'Item marked out of stock');
};