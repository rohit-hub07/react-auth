import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();
const isAuthenticated = async(req, res, next) => {
  try {
    const token = req.cookies?.token;
  // console.log("Inside middleware token: ",token);
  const decoded = jwt.verify(token, process.env.SECRET)
  // console.log("Decoded token", decoded)
  req.user = decoded;
  next()
  } catch (error) {
    return res.status(401).send({
      message: "Please login first!",
      success: false,
      error,
    })
  }
}

export default isAuthenticated;