import { Router, Request, Response } from 'express';
import { BOX_PRICES, PLAN_PRICES, PLAN_FULL_PRICES } from '../constants/prices';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    plans: {
      sapling: { token: PLAN_PRICES.sapling, full: PLAN_FULL_PRICES.sapling },
      adult:   { token: PLAN_PRICES.adult,   full: PLAN_FULL_PRICES.adult   },
      grand:   { token: PLAN_PRICES.grand,   full: PLAN_FULL_PRICES.grand   },
    },
    boxes: BOX_PRICES,
  });
});

export default router;
