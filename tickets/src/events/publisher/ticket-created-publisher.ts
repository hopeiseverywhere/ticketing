import { Publisher, Subjects, TicketCreatedEvent } from "@fran-tickets/common";
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
