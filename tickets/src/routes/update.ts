import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
    validateRequest,
    NotFoundError,
    requireAuth,
    NotAuthorizedError,
    BadRequestError,
} from "@fran-tickets/common";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publisher/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
// Update a ticket
router.put(
    "/api/tickets/:id",
    requireAuth,
    [
        // check the incoming body
        body("title").not().isEmpty().withMessage("Title is required"),
        body("price")
            .isFloat({ gt: 0 })
            .withMessage("Price must be provided and must be greater than 0"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        // make sure the ticket exists
        if (!ticket) {
            throw new NotFoundError();
        }

        // decide whether or not we should allow the ticket to be edited
        // incase it's reserved
        if (ticket.orderId) {
            throw new BadRequestError("Can't update a reserved ticket");
        }

        // make sure the user is authorized
        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        // update
        ticket.set({
            title: req.body.title,
            price: req.body.price,
        });
        await ticket.save();
        // emit updated event
        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        });

        res.status(201).send(ticket);
    }
);

export { router as updateTicketRouter };
