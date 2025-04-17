import mongoose from "mongoose";

const db = async(req, res, next) => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/reactAuth')
    console.log("DB Connection successFul!");
    
    next();
  } catch (error) {
    res.status(401).send({
      message: "Db connection failed!",
      err,
      success: false,
    })
    process.exit(1)
    }
}

export default db;