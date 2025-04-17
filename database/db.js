import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();


const db = async(next) => {
  try {
    await mongoose.connect(process.env.DATABASE_URL).then(() => console.log("DB Connection successFul!"));
  } catch (error) {
    console.log("Db connection failed!!", error)
    process.exit(1)
    } 
}

export default db;