import { Request, Response } from 'express';
import { e2eService } from '../services/e2eService.js';

async function deleteAll(req: Request, res: Response) {
    await e2eService.deleteAll();
    res.send(200);
}

export const e2eTestController = {
    deleteAll,
};
