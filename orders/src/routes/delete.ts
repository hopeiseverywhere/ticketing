// create route handler
import express, { Request, Response } from "express";
import {
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
} from "@fran-tickets/common";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
    "/api/orders/:orderId",
    requireAuth,
    async (req: Request, res: Response) => {
        // poll order id
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("ticket");
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        // update order status
        order.status = OrderStatus.Cancelled;
        await order.save();

        // publishing an event saying this was cancelled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });
        res.status(204).send(order);
    }
);

export { router as deleteOrderRouter };
