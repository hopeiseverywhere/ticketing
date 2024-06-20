import Queue from "bull";
import { ExpirationCompletePublisher } from "../publishers/expiration-complete-publisher";
import { natsWrapper } from "../../nats-wrapper";

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
    // tell this queue to use redis
    redis: {
        host: process.env.REDIS_HOST,
    },
});

expirationQueue.process(async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    });
});

// export the queue
export { expirationQueue };
