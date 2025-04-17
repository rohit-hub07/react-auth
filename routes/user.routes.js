import express from 'express'
import { registerController } from '../controllers/user.controller.js';

const app = express()

const route = express.Router();

route.get('/register', registerController)


export default route;