// a handler to create a new ticket
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@fran-tickets/common";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publisher/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// create a ticket
router.post(
    "/api/tickets",
    requireAuth,
    [
        // validate different properties using express-validator
        // check title
        body("title").not().isEmpty().withMessage("Title is required"),
        // check price
        body("price")
            .isFloat({ gt: 0 }) //grater than 0
            .withMessage("Price must be greater than 0"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        // pull of title and price from the body of incoming req
        const { title, price } = req.body;

        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id,
        });
        await ticket.save();
        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });
        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };
