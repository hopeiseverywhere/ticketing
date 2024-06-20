import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

// tell ts there's a global function called getCookie
declare global {
    // return a Promise of type string array
    var getCookie: () => Promise<string[]>;
    var signin: () => string[];
}
jest.mock("../nats-wrapper");

let mongo: any;
// create a new instance of mongo memory server
// i.e. create a copy of mongodb in memory
// a hook that is going to run before all test
beforeAll(async () => {
    // set up the env
    process.env.JWT_KEY = "asdfasdf";
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

// global function that helps us writing test
global.getCookie = async () => {
    const email = "test@test.com";
    const password = "password";

    const response = await request(app)
        .post("/api/users/signup")
        .send({
            email,
            password,
        })
        .expect(201);

    const cookie = response.get("Set-Cookie");
    return cookie;
};

global.signin = () => {
    // build a JWT payload. { id, email, iat }
    const paylaod = {
        id: new mongoose.Types.ObjectId().toHexString(),
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
