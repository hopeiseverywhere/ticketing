import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

// tell ts there's a global function called getCookie
declare global {
    // return a Promise of type string array
    var signin: (id?: string) => string[];
}
jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
    "sk_test_51PPBtM04PJgrgaxR6pYaHX2L5W2PmbM2n7cSim2xDuJJlyMvoLTfATw92Xm7TOVoeAbryJeoauz47aXvZ4aaO7QA00s3SGMqgO";

let mongo: any;
// create a new instance of mongo memory server
// i.e. create a copy of mongodb in memory
// a hook that is going to run before all test
beforeAll(async () => {
    // set up the env
    process.env.JWT_KEY = "asdfasdf";
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    // create a mongo memory server
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

// run before each of our test
beforeEach(async () => {
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

global.signin = (userId?: string) => {
    // build a JWT payload. { id, email, iat }
    const paylaod = {
        id: userId || new mongoose.Types.ObjectId().toHexString(),
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
