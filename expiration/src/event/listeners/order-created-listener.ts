import { Listener, OrderCreatedEvent, Subjects } from "@fran-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // future time - current time
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("waiting this milliseconds to process the job: ", delay);

        // create a new job and keep it up
        // add payload obj
        await expirationQueue.add(
            {
                orderId: data.id,
            },
            {
                // e.x. delay fro 10 seconds (10000 millisecond)
                delay,
            }
        );

        msg.ack();
    }
}
