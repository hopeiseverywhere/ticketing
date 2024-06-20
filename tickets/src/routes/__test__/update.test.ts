import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
    // use mongoose to generate a realistic id
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set("Cookie", global.signin())
        .send({
            title: "eajfga",
            price: 20,
        })
        .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
    // use mongoose to generate a realistic id
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: "eajfga",
            price: 20,
        })
        .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "afjowa",
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", global.signin())
        .send({
            title: "aowjfaoalwg",
            price: 1000,
        })
        .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
    // we want to make a request as the same user we were when we created the ticket.
    const cookie = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "afjowa",
            price: 20,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "",
            price: 20,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", cookie)
        .send({
            title: "foawfjav",
            price: -20,
        })
        .expect(400);
});



it("Returns 400 if user tried to updated a already reserved ticket", async () => {
    const cookie = global.signin();
    // create a ticket with one userId
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "some title",
            price: 20,
        });
    const ticketId = response.body.id;
    const newTitle = "new title";
    const newPrice = 200;

    const ticket = await Ticket.findById(ticketId);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    ticket!.save();

    // Trying to update it using same user.
    const updateResponse = await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set("Cookie", cookie)
        .send({
            title: newTitle,
            price: newPrice,
        })
        .expect(400);
});

it("Correctly updates a ticket", async () => {
    const cookie = global.signin();
    // Creating a ticket with one userId
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "A valid title",
            price: "200",
        });

    const ticketId = response.body.id;

    const newTitle = "Updated title";
    const newPrice = 600;

    // Trying to update it using same user.
    const updateResponse = await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set("Cookie", cookie)
        .send({
            title: newTitle,
            price: newPrice,
        })
        .expect(201);

    expect(updateResponse.body.title).toEqual(newTitle);
    expect(updateResponse.body.price).toEqual(newPrice);
});

it("Emits an event after updating a ticket", async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title: "A valid title",
            price: "200",
        });

    const ticketId = response.body.id;

    const newTitle = "Updated title";
    const newPrice = 600;

    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set("Cookie", cookie)
        .send({
            title: newTitle,
            price: newPrice,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
