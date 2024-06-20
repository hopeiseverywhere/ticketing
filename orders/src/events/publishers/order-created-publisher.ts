import { Subjects, Publisher, OrderCreatedEvent } from "@fran-tickets/common";
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
