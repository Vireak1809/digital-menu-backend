import type { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';
import { ok } from '../utils/response';

export const get = async (_req: Request, res: Response) => ok(res, await settingsService.getSettings());

export const update = async (req: Request, res: Response) =>
  ok(res, await settingsService.updateSettings(req.body), 'Settings saved');