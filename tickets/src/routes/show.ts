import express, { Request, Response } from 'express';
import { NotFoundError } from '@fran-tickets/common';
import { Ticket } from '../models/ticket';


const router = express.Router();

// retrieve ticket with a specific id
router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    // look into collection and find the ticket by id
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFoundError();        
    }

    res.send(ticket);
});


export { router as showTicketRouter };
