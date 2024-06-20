// create route handler
import express, { Request, Response } from "express";
import {
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
} from "@fran-tickets/common";
import { Order } from "../models/order";

const router = express.Router();

router.get(
    "/api/orders/:orderId",
    requireAuth,
    async (req: Request, res: Response) => {
        const reqOrderId = req.params.orderId;

        const order = await Order.findById(reqOrderId).populate("ticket");

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        // console.log('oderid: ' + order.userId);
        // console.log("curr user id: " + req.currentUser!.id);

        res.status(200).send(order);
    }
);

export { router as getOrderByIdRouter };
