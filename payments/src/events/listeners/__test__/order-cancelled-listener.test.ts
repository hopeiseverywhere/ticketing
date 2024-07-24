import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { OrderCancelledEvent, OrderStatus } from "@fran-tickets/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        userId: "abc",
        version: 0,
        price: 200,
        status: OrderStatus.Created,
    });
    await order.save();

    const data: OrderCancelledEvent["data"] = {
        id: order.id,

        version: order.version + 1,
        ticket: {
            id: "string",
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, order };
};

it("Correctly updates order status to cancelled", async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("Acknowledeges the message after updating the replicated order object", async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("throws an error if the order is not found", async () => {
    const { listener, data, msg } = await setup();
    
    // Modify the data to have an incorrect order id
    data.id = new mongoose.Types.ObjectId().toHexString();
    
    await expect(listener.onMessage(data, msg)).rejects.toThrow('Order not found');
    expect(msg.ack).not.toHaveBeenCalled();
});
