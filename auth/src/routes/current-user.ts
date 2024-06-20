import express from 'express';
import { currentUser } from '@fran-tickets/common';


// create a instance of an Express Router
const router = express.Router();

// define a GET route
router.get('/api/users/currentuser', currentUser, (req, res) => {
    // use the middleware to check JWT and extract it
    res.send({ currentUser: req.currentUser || null });
});

// export the router using alias 'currentUserRouter'
export { router as currentUserRouter };
