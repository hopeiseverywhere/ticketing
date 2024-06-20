import { ExpirationComplteListner } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import createTestOrder from "../../../test/utils/createTestOrder";
import createTestTicket from "../../../test/utils/createTestTicket";
import { ExpirationCompleteEvent, OrderStatus } from "@fran-tickets/common";

const setup = async () => {
    const listener = new ExpirationComplteListner(natsWrapper.client);

    const ticket = await createTestTicket();
    const user = global.signin();
    const order = await createTestOrder(ticket, user);

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, ticket, data, msg };
};

it("updates thr oder status to cancelled", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.orderId);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("ack the message", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
