import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("it has a route handler listening to /api/tickets for post request", async () => {
    const response = await request(app).post("/api/tickets").send({});

    expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
    await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({});
    expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "",
            price: 10,
        })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "",
            price: 10,
        })
        .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "faefa",
            price: -10,
        })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "gagea",
        })
        .expect(400);
});

it("creates a tickets with valid inputs", async () => {
    // add in a check to make sure a ticket was saved to DB
    // find all ticket documents within tickets collection
    let tickets = await Ticket.find({});
    // recall the setup beforeEach twest, there should be no documents
    expect(tickets.length).toEqual(0);

    const title = "asldkfj";

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title,
            price: 20,
        })
        .expect(201);

    // now there should be one document

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(20);
});

it("publishes an event", async () => {
    const title = "asldkfj";

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title,
            price: 20,
        })
        .expect(201);
    
    // publish function is called
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});
