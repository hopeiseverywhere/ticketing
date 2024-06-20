import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@fran-tickets/common';

import { User } from '../models/user';

// create a instance of an Express Router
const router = express.Router();

// define a POST route for user signup
// using express-validator as a middleware
router.post(
    '/api/users/signup',
    [
        // Middleware for validating 'email' field
        body('email').isEmail().withMessage('Email must be valid'),
        // Middleware for validating 'password' field
        body('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
    ],
    // middleware check the request
    validateRequest,
    async (req: Request, res: Response) => {
        // If we passed validation
        const { email, password } = req.body;
        // check if there's existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError('Email already exists!');
        }

        // Password Hashing

        // create a user and save it to DB
        const user = User.build({ email, password });
        await user.save();

        // generate JWT, put a payload into it with a private key
        const userJwt = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            // get the env variable
            // ! is telling typescript we know this env is defined
            process.env.JWT_KEY!
        );

        // store it on the session on the req object
        req.session = {
            jwt: userJwt,
        };

        // send a response
        res.status(201).send(user);
    }
);

// export the router using alias 'signupRouter'
export { router as signupRouter };
