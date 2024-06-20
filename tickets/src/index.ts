import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedLintener } from "./events/listener/order-created-listener";
import { OrderCancelledListener } from "./events/listener/order-cancelled-listener";

const start = async () => {
    // check env variable is defined
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }
    // connect mongodb in a pod -> connect cluster ip srv:port/<db name>
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }
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

        new OrderCreatedLintener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDb");
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!!!!!!!");
    });
};

start();
