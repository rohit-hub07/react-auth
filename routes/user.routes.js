import express from 'express'
import { registerController, verifyUser } from '../controllers/user.controller.js';

const app = express()

const router = express.Router();

router.post('/register', registerController)
router.get("/verify", verifyUser)

export default router;