import { Ticket, TicketDoc } from "../../models/ticket";
import { Order } from "../../models/order";
import { OrderStatus } from "../../models/order";
import request from "supertest";
import { app } from "../../app";

export default async function createTestOrder(
    ticket: TicketDoc,
    user: string[]
) {
    const isTicketAlreadyReserved = await ticket.isReserved();
    if (isTicketAlreadyReserved) throw new Error("Ticket is already reserved");

    const { body: order } = await request(app)
        .post("/api/orders/new")
        .set("Cookie", user)
        .send({
            ticketId: ticket.id,
            
        });

    return order;
}
