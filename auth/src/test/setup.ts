import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

// tell ts there's a global function called getCookie
declare global {
    // return a Promise of type string array
    var getCookie: () => Promise<string[]>;
}

let mongo: any;
// create a new instance of mongo memory server
// i.e. create a copy of mongodb in memory
// a hook that is going to run before all test
beforeAll(async () => {
    // set up the env
    process.env.JWT_KEY = 'asdfasdf';
    // create a mongo memory server
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

// run before each of our test
beforeEach(async () => {
    // release and reset data in mongo memory server
    const collections = await mongoose.connection.db.collections();
    // loop and delete each
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
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password,
        })
        .expect(201);

    const cookie = response.get('Set-Cookie');
    return cookie;
};
