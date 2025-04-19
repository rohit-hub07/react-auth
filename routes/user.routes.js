import express from 'express'
import { forgetPassword, getMeController, loginController, logoutController, registerController, resetPasswordController, verifyUser } from '../controllers/user.controller.js';
import isAuthenticated from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerController)
router.get("/verify/:token", verifyUser)
router.post("/login", loginController)
router.post("/forgetpassword", isAuthenticated,forgetPassword)
router.post("/resetpassword/:token",isAuthenticated, resetPasswordController)
router.get("/getme", isAuthenticated,getMeController)
router.get("/logout",isAuthenticated, logoutController)

export default router;