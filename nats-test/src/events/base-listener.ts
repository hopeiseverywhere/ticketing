import nats, { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";
interface Event {
    subject: Subjects;
    data: any;
}

// making listener more abstract
export abstract class Listener<T extends Event> {
    // name of the channel this listener is going to listen to
    abstract subject: T["subject"];
    // name of the queue group this listner will join
    abstract queueGroupName: string;
    // function to run when a message is recieved
    abstract onMessage(data: T["data"], msg: Message): void;
    // pre initialized NATS client
    private client: Stan;
    // number of seconds this listener has to acknowledge a message
    protected ackWait = 5 * 1000;
    constructor(client: Stan) {
        this.client = client;
    }
    // default subscription options
    subscriptionOptions() {
        return this.client
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName);
    }
    /**
     * code to set up the subsciption
     */
    listen() {
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        );
        subscription.on("message", (msg: Message) => {
            console.log(
                `Message recieved: ${this.subject} / ${this.queueGroupName}`
            );

            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }
    /**
     * Parse the incoming data
     */
    parseMessage(msg: Message) {
        const data = msg.getData();
        // string or buffer
        return typeof data === "string"
            ? JSON.parse(data)
            : JSON.parse(data.toString("utf8"));
    }
}
