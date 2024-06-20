import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { PasswordManager } from '../services/password-manager';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@fran-tickets/common';

// create a instance of an Express Router
const router = express.Router();

// define a POST route
router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password'),
    ],
    // middleware checks request
    validateRequest,
    async (req: Request, res: Response) => {
        // run query here
        const { email, password } = req.body;

        // check existing user with the same email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        // compare passwords
        const passwordMatch = await PasswordManager.compare(
            existingUser.password,
            password
        );
        // no match -> a error
        if (!passwordMatch) {
            throw new BadRequestError('Invalid Password');
        }

        // user logged in -> send a JWT
        // generate JWT, put a payload into it with a private key
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            // get the env variable
            // ! is telling typescript we know this env is defined
            // make sure env exists by add a check in the root index.ts
            process.env.JWT_KEY!
        );

        // store the JWT on the session
        req.session = {
            jwt: userJwt,
        };

        // send a response
        res.status(200).send(existingUser);
    }
);

// export the router using alias 'signinRouter'
export { router as signinRouter };
