import express from "express";
import dotenv from "dotenv";
import db from "./database/db.js";
import cors from "cors";
import router from "./routes/user.routes.js";
import cookieParser from "cookie-parser";

//express for routing
const app = express();

dotenv.config();

// converting into json response
app.use(express.json());

// allowing url to be extratacted
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 4000;

//cor options
const corsOptions = {
  origin: process.env.BASE_URL,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
//setting up cors and restricting requuests from other origin
app.use(cors(corsOptions));
//cookie parser to parse cookies
app.use(cookieParser())
app.use("/reactAuth/v1", router);

const startServer = async () => {
  await db();

  app.listen(port, () => {
    console.log(`App is listening to port: ${port}`);
  });
};

startServer();