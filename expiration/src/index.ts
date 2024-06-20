import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./event/listeners/order-created-listener";

const start = async () => {
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID must be defined");
    }
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL must be defined");
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID must be defined");
    }
    try {
        await natsWrapper.connect(
            // "ticketing",
            // "laskgejf",
            // "http://nats-srv:4222"
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        // capture any close event
        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed!");
            // end this process
            process.exit();
        });

        // 2 listeners on the process to make sure if there's iterrupt or terminate
        // close everything down
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
    } catch (err) {
        console.error(err);
    }
};

start();
