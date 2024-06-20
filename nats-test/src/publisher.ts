import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();
// stan is a nats streaming server project
// (clusterID, clientID)
const stan = nats.connect("ticketing", "abc", {
    url: "http://localhost:4222",
});

// watch for a connect event
stan.on("connect", async () => {
    console.log("Publisher connected to NATS");

    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({
            id: "123",
            title: "concert",
            price: 20,
        });
    } catch (err) {
        console.error(err);
    }
    // info we want to share, but we can't share a plain js object -> have to convert it to JSON (string)
    // const data = JSON.stringify({
    //     id: '123',
    //     title: 'concert',
    //     price: 20,
    // });

    // // call publish function to publish the data
    // // (channel/subject, data)
    // stan.publish('ticket:created', data, () => {
    //     console.log('Event published');
    // });
});
