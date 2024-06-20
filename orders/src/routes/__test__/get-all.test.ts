import request from "supertest";
import { app } from "../../app";
import createTestOrder from "../../test/utils/createTestOrder";
import createTestTicket from "../../test/utils/createTestTicket";


it("Can only be accessed if the user is signed in", async () => {
    await request(app).get("/api/orders").send({}).expect(401);
});

it("fetches orders from an particular user", async () => {
    // Create 3 tickets
    const ticketOne = await createTestTicket();
    const ticketTwo = await createTestTicket();
    const ticketThree = await createTestTicket();

    const userOne = global.signin();
    const userTwo = global.signin();
    // Create 1 order as User #1
    await request(app)
        .post("/api/orders/new")
        .set("Cookie", userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    // Create 2 orders as User #2
    const { body: orderOne } = await request(app)
        .post("/api/orders/new")
        .set("Cookie", userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);
    const { body: orderTwo } = await request(app)
        .post("/api/orders/new")
        .set("Cookie", userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get("/api/orders")
        .set("Cookie", userTwo)
        .expect(200);

    // console.log(orderOne);
    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});

it("fetch all orders from a perticualar user", async () => {
    // Creating three test tickets
    // 1 by user#1
    // 2 by user#2
    // and check if it only fetches orders for the user#2
    const user1 = global.signin();
    const user2 = global.signin();
    const ticket1 = await createTestTicket();
    const ticket2 = await createTestTicket();
    const ticket3 = await createTestTicket();

    await createTestOrder(ticket1, user1);
    await createTestOrder(ticket2, user2);
    await createTestOrder(ticket3, user2);

    const { body: orders } = await request(app)
        .get("/api/orders")
        .set("Cookie", user2)
        .expect(200);

    expect(orders.length).toEqual(2);
});
