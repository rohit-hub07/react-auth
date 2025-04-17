import express from 'express'
import dotenv from 'dotenv'
import db from './database/db.js';
import cors from 'cors'
import route from './routes/user.routes.js';


//express for routing
const app = express();

dotenv.config();

// convertign into json response
app.use(express.json());

// allowing url to be extratacted
app.use(express.urlencoded({extended: true}))

const port = process.env.PORT || 4000; 


//cor options
const corsOptions= {
  origin: process.env.BASE_URL,
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
}
//setting up cors and restricting requuests from other origin
app.use(cors(corsOptions));

app.use("/reactAuth/v1", route)

db()

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`)
})