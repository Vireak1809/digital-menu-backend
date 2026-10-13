import type { Request, Response } from 'express';
import * as menuService from '../services/menu.service';
import { readParam } from '../utils/param';
import { ok } from '../utils/response';

export const listCategories = async (_req: Request, res: Response) =>
  ok(res, await menuService.listCategories());

export const createCategory = async (req: Request, res: Response) =>
  ok(res, await menuService.createCategory(req.body), 'Category created', 201);

export const updateCategory = async (req: Request, res: Response) =>
  ok(res, await menuService.updateCategory(readParam(req, 'id'), req.body), 'Category updated');

export const deleteCategory = async (req: Request, res: Response) => {
  await menuService.deleteCategory(readParam(req, 'id'));
  return ok(res, null, 'Category deleted');
};

export const reorderCategories = async (req: Request, res: Response) => {
  await menuService.reorderCategories(req.body.ids);
  return ok(res, null, 'Order saved');
};

export const listItems = async (req: Request, res: Response) =>
  ok(res, await menuService.listMenuItems(req.query as never));

export const createItem = async (req: Request, res: Response) =>
  ok(res, await menuService.createMenuItem(req.body), 'Item created', 201);

export const updateItem = async (req: Request, res: Response) =>
  ok(res, await menuService.updateMenuItem(readParam(req, 'id'), req.body), 'Item updated');

export const deleteItem = async (req: Request, res: Response) => {
  await menuService.deleteMenuItem(readParam(req, 'id'));
  return ok(res, null, 'Item deleted');
};

export const reorderItems = async (req: Request, res: Response) => {
  await menuService.reorderMenuItems(req.body.ids);
  return ok(res, null, 'Order saved');
};