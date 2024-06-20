import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
    console.log("Starting up....");
    // check env variable is defined
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }
    // connect mongodb in a pod -> connect cluster ip srv:port/<db name>
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDb");
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!!!!!!!v2");
    });
};

start();
