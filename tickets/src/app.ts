import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@fran-tickets/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';

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

app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// match any path to see if there's a NotFoundError
app.all('*', async (req, res) => {
    throw new NotFoundError();
});

// use error handler
app.use(errorHandler);

export { app };
