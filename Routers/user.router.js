import express from 'express';
import { registerUser, deleteUser, getAllUsers, updateUser, loginUser, verifyEmail, switchRole } from '../controllers/user.controllers.js';
import { authenticator, authorizationOfRole } from '../middlewares/auth.js';
import { parser } from '../utils/singleImageUploader.js';



// Create an express router
const userRouter = express.Router();

// Mount get request on */getAllUsers* endpoint
userRouter.get('/getAllUsers/:id', authenticator, authorizationOfRole('admin'), getAllUsers);

/* Mount get request on *get-A-UserWith-Id* endpoint */
userRouter.get('/login' , parser.none()/*to parse multipart/form-data and attach fields to req,body*/, loginUser)

// Mount post request on */addUser* endpoint
userRouter.post('/addUser', parser.single('image'), registerUser);

// Mount delete request on */deleteUser* endpoint
userRouter.delete('/deleteUser', authenticator, authorizationOfRole('gigProvider', 'serviceProvider'), deleteUser);

// Mount patch request on */updateUser* endpoint
userRouter.patch('/updateUser', authenticator, authorizationOfRole('gigProvider', 'serviceProvider'), updateUser);

// Mount patch request on */switchRole* endpoint
userRouter.patch('/switchRole', authenticator, authorizationOfRole('gigPoster', 'serviceProvider'), switchRole);

// Mount get request on */verifyEmail* endpoint
userRouter.get('/verifyEmail', verifyEmail);

// make the default export available globally
export default userRouter;