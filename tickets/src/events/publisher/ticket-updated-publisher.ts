import { Publisher, Subjects, TicketUpdatedEvent } from "@fran-tickets/common";
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
