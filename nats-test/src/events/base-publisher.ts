import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Publisher<T extends Event> {
    abstract subject: T["subject"];
    private client: Stan;
    constructor(client: Stan) {
        this.client = client;
    }

    publish(data: T["data"]): Promise<void> {
        // This function takes a generic data type and returns a Promise that resolves
        // with nothing (void) upon successful publishing.
        // Create a new Promise object with resolve and reject functions
        return new Promise((resolve, reject) => {
            // Call the client's publish method with the subject, stringified data,
            // and a callback function to handle the result
            this.client.publish(this.subject, JSON.stringify(data), (err) => {
                // If there's an error, reject the Promise with the error message
                if (err) return reject(err);
                // If successful, resolve the Promise
                console.log("Event published to subject->", this.subject);
                resolve();
            });
        });
    }
}
