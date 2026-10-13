import type { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { readParam } from '../utils/param';
import { ok } from '../utils/response';

export const list = async (_req: Request, res: Response) => ok(res, await userService.listUsers());
export const create = async (req: Request, res: Response) =>
  ok(res, await userService.createUser(req.body), 'User created', 201);
export const update = async (req: Request, res: Response) =>
  ok(res, await userService.updateUser(readParam(req, 'id'), req.body), 'User updated');
export const remove = async (req: Request, res: Response) => {
  await userService.deleteUser(readParam(req, 'id'));
  return ok(res, null, 'User deleted');
};