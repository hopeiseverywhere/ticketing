import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

// (clusterID, clientID), clientID need to be unique for each listener
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
    url: "http://localhost:4222",
});

// watch for a connect event
stan.on("connect", () => {
    console.log("Listener connected to NATS");

    // anytime if we close of disconnect this client
    stan.on("close", () => {
        console.log("NATS connection closed!");
        // end this process
        process.exit();
    });

    // options to customize listener
    // set manual acknowledgement mode to true
    // const options = stan
    //     .subscriptionOptions()
    //     .setManualAckMode(true)
    //     .setDeliverAllAvailable()
    //     .setDurableName("accounting-service");

    // create a subscription based on
    // name of the channel/subject
    // and a queue group
    // const subscription = stan.subscribe(
    //     "ticket:created",
    //     "queue-group-name",
    //     // 'orders-services-queue-group',
    //     options
    // );
    new TicketCreatedListener(stan).listen();
    // subscription.on("message", (msg: Message) => {
    //     const data = msg.getData();

    //     if (typeof data == "string") {
    //         console.log(
    //             `Received event #${msg.getSequence()}, with data: ${data}`
    //         );
    //     }

    //     // acknowledgement
    //     msg.ack();
    // });
});

// 2 handlers that watches if anyone is closing the process
// watching for interrupt signals or terminate signals
// if so, close the client first
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
