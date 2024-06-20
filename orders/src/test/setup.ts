import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// tell ts there's a global function called getCookie
declare global {
    var signin: () => string[];
}
jest.mock("../nats-wrapper");

let mongo: any;
// create a new instance of mongo memory server
// i.e. create a copy of mongodb in memory
// a hook that is going to run before all test
beforeAll(async () => {
    // set up the env
    process.env.JWT_KEY = "abcd";
    // create a mongo memory server
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

// run before each of our test
beforeEach(async () => {
    // clear all the fake function implementation data
    jest.clearAllMocks();
    // release and reset data in mongo memory server
    const collections = await mongoose.connection.db.collections();
    // loop and delete all collections within the db
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

// hook that run after all tests are complete
afterAll(async () => {
    // stop the mongo memory server and disconnect
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signin = () => {
    const randomId = new mongoose.Types.ObjectId().toHexString();
    // build a JWT payload. { id, email, iat }
    const paylaod = {
        id: randomId,
        email: "test@test.com",
    };

    // create the JWT using JWT lib
    const token = jwt.sign(paylaod, process.env.JWT_KEY!);

    // build session object. { jwt: MY_JWT }
    const session = { jwt: token };

    // turn the session into JSON
    const sessionJSON = JSON.stringify(session);

    //  Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString("base64");

    // return a string that the cookie with the encoded data
    return [`session=${base64}`];
};
