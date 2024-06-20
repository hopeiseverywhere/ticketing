import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// import routers
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

// import error handler
import { errorHandler, NotFoundError } from '@fran-tickets/common';


const app = express();
// traffic is being proxy by ingress-nginx
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        // disable encryption
        signed: false,
        // true: must be on https connection
        // but when use super test, we are not making https connect
        // but plain http request
        // so if ENV is test -> false
        // else -> true
        secure: process.env.NODE_ENV !== 'test'
    })
);

// use the currentUserRouter -> 'api/users/currentuser/'
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// match any path to see if there's a NotFoundError
app.all('*', async (req, res) => {
    throw new NotFoundError();
});

// use error handler
app.use(errorHandler);

export { app };
