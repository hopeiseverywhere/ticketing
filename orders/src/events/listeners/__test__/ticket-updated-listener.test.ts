import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@fran-tickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
    // create a listner
    const listener = new TicketUpdatedListener(natsWrapper.client);
    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20,
    });
    await ticket.save();
    // create a fake data object
    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: "movie",
        price: 999,
        userId: "gejgaj",
    };
    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };
    // return all of this stuff
    return { listener, msg, data, ticket };
};

it("finds, updates and saves a ticket", async () => {
    const { listener, msg, data, ticket } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { listener, msg, data, ticket } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
    const { listener, msg, data, ticket } = await setup();
    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();
});
