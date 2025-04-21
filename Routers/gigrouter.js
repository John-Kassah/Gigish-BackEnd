import express from 'express';
import { authenticator } from '../middlewares/auth.js';
import { createGig, deleteGig, viewGig } from '../controllers/gig.controllers.js';
import { parser } from '../utils/singleImageUploader.js';


const gigRouter = express.Router();

// Mount post request on */createGig* endpoint
gigRouter.post('/createGig', parser.single('image')/*to parse multipart/form-data and attach fields to req,body*/, authenticator, createGig);

// Mount get request on */viewGigs* endpoint
gigRouter.get('/viewGigs', authenticator, viewGig)

// Mount delete request on */deleteGig* endpoint
gigRouter.delete('/deleteGig/:id', authenticator, deleteGig);

// make the default export available globally
export default gigRouter; 
