import request from "supertest";
import { app } from "../../app";
import createTestTicket from "../../test/utils/createTestTicket";
import createTestOrder from "../../test/utils/createTestOrder";

it("Has a route hanlder listening to /api/orders/:orderId for get requests", async () => {
    const response = await request(app).get("/api/orders/abc").send({});
    expect(response.status).not.toEqual(404);
});

it("Can only be accessed if the user is signed in", async () => {
    await request(app).get("/api/orders/abc").send({}).expect(401);
});

it("Cannot fetch order created by different user", async () => {
    const user1 = global.signin();
    const user2 = global.signin();
    const ticket = await createTestTicket();
    const order = await createTestOrder(ticket, user1);
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user2)
        .expect(401);
});


it("fetches the order by id", async () => {
    const user = global.signin();

    // Created a ticket
    const ticket = await createTestTicket();

    // make a request to build an order with this ticket
    const order = await createTestOrder(ticket, user);
    // make request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200);


    expect(fetchedOrder.id).toEqual(order.id);
});
