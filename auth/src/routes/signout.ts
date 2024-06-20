import express from 'express';

// create a instance of an Express Router
const router = express.Router();

// define a post route
router.post('/api/users/signout', (req, res) => {
    // destroy a session
    req.session = null;
    res.send({});
});

// export the router using alias 'signoutRouter'
export { router as signoutRouter };
