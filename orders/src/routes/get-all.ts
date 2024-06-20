// create route handler
import express, { Request, Response } from "express";
import { requireAuth } from "@fran-tickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    const allOrders = await Order.find({
        userId: req.currentUser!.id,
    }).populate("ticket");

    res.send(allOrders).status(200);
});

export { router as getAllOrdersRouter };
