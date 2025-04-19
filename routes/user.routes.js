import express from 'express'
import { loginController, registerController, verifyUser } from '../controllers/user.controller.js';


const router = express.Router();

router.post('/register', registerController)
router.get("/verify/:token", verifyUser)
router.post("/login", loginController)

export default router;