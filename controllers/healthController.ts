import type { Request, Response } from 'express';
import { getHealth } from '../services/healthService.js';

class HealthController {
  static async check(req: Request, res: Response) {
    res.status(200).json(getHealth());
  }
}

export default HealthController;
