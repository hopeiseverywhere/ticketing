import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import createTestTicket from "../../test/utils/createTestTicket";
import createTestOrder from "../../test/utils/createTestOrder";
import { natsWrapper } from "../../nats-wrapper";

it("Can only be accessed if the user is signed in",async ()=>{
    await request(app)
        .post('/api/orders/new')
        .send({})
        .expect(401);
})

it("returns an error if the ticket does not exist", async () => {
    // Random id
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
        .post("/api/orders/new")
        .set("Cookie", global.signin())
        .send({
            ticketId: ticketId,
        })
        .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
    // Create a ticket and save it
    const ticket = await createTestTicket();
    const order = Order.build({
        ticket: ticket,
        userId: "laskdflkajsdf",
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });
    await order.save();
    await request(app)
        .post("/api/orders/new")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it("reserves a ticket", async () => {
    const ticket = await createTestTicket();
    await request(app)
        .post("/api/orders/new")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it("emits an order created event", async () => {
    const ticket = await createTestTicket();
    await request(app)
        .post("/api/orders/new")
        .set("Cookie", global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled(); 
});
