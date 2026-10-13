import type { Request, Response } from 'express';
import * as menuService from '../services/menu.service';
import { ok } from '../utils/response';

export async function listCategoriesController(_req: Request, res: Response) {
  return ok(res, await menuService.listCategories());
}
