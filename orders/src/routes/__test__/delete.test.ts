import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import createTestTicket from "../../test/utils/createTestTicket";
import createTestOrder from "../../test/utils/createTestOrder";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("Has a route hanlder listening to /api/orders/:orderId for delete requests", async () => {
    const response = await request(app).delete("/api/orders/abc").send({});
    expect(response.status).not.toEqual(404);
});

it("Can only be accessed if the user is signed in", async () => {
    await request(app).delete("/api/orders/abc").send({}).expect(401);
});

it("Returns 401 if the user is not authenticated", async () => {
    await request(app).delete("/api/orders/abc").send({}).expect(401);
});

it("Returns 404 if the order is not found", async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .delete(`/api/orders/delete/${fakeId}`)
        .set("Cookie", global.signin())
        .expect(404);
});

it("Deletes the order if the every other check is passed", async () => {
    const user = global.signin();
    const ticket = await createTestTicket();
    const order = await createTestOrder(ticket, user);
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("Emits an event when an order is cancelled", async () => {
    const user = global.signin();
    const ticket = await createTestTicket();
    const order = await createTestOrder(ticket, user);
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .expect(204);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
