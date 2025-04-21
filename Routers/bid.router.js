import express from 'express';
import { authenticator } from '../middlewares/auth.js';
import { acceptBid, createBid, deleteBid, rejectBid, viewBids } from '../controllers/bid.controllers.js';

// create an express router for the bids
const bidRouter = express.Router();

// Mount post request on */createBid* path
bidRouter.post('/createBid/:gigId', authenticator, createBid);

// Mount get request on */viewBids* path
bidRouter.get('/viewBids', authenticator, viewBids);

// Mount post request on */acceptBids* path
bidRouter.post('/acceptBid/:bidId', authenticator, acceptBid)

// Mount post request on */rejectBids* path
bidRouter.post('/rejectBid/:bidId', authenticator, rejectBid)

// Mount delete request on */deleteBids* path
bidRouter.delete('/deleteBid/:bidId', authenticator, deleteBid)

export default bidRouter; // make the default export available globally so we can use it in the server.js file