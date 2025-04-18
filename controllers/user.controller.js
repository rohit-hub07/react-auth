import { User } from "../models/User.models.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).send({
        message: "All fields are required!",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "User already exists!",
        success: false,
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });
    if (!user) {
      return res.status(500).send({
        message: "User registration failed!. Please check you credentials!",
        success: false,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    if (!token) {
      return res.status(500).send({
        message: "Unable to generate verification token!",
        success: false,
      });
    }

    user.verificationToken = token;
    await user.save();

    //sending mail
    const transport = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });


    const configOptions = {
      from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
      to: user.email, // list of receivers
      subject: "Registration Link", // Subject line
      text: `Registration link: 
      ${process.env.BASE_URL}/reactAuth/v1/verify/${token}`,
      html: `<h2>Registration link</h2>
      <br>
      ${process.env.BASE_URL}/reactAuth/v1/verify/${token}`,
    };
    await transport.sendMail(configOptions);

    res.status(201).send({
      message: "Please check your email for verification!",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Something went wrong! Please check your internet connection!",
      error,
      success: false,
    });
  }
};

export const verifyUser = async(req, res) => {
    try {
        const { token } = req.params;
    if(!token){
        return res.status(400).send({
            message: "Token doesn't exist!",
            success: false,
        });
    }
    const user = await User.findOne({verificationToken: token});
    if(!user){
        return res.status(400).send({
            message: "invalid url!",
            success: false,
        });
    }
    user.isVerified = true;
    user.verificationToken = '';
    await user.save()

    res.status(201).send({
        message: "User verification successful!",
        success: true,
    });
    } catch (error) {
        return res.status(400).send({
            message: "Verifiaction failed!",
            success: false,
            error,
        })
    }
}