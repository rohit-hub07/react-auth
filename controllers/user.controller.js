import { User } from "../models/User.models.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).send({
        message: "Token doesn't exist!",
        success: false,
      });
    }
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send({
        message: "invalid url!",
        success: false,
      });
    }
    user.isVerified = true;
    user.verificationToken = "";
    await user.save();

    res.status(200).send({
      message: "User verification successful!",
      success: true,
    });
  } catch (error) {
    return res.status(400).send({
      message: "Verifiaction failed!",
      success: false,
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        message: "All fields are required!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        message: "User doesn't exist witht the provided email!",
        success: false,
      });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).send({
        message: "Invalid password!",
        success: false,
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    const cookieOptions = {
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);
    res.status(200).send({
      message: "LoggedIn successful",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Some error occured while loggign in!",
      error,
      success: false,
    });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        message: "All fields are required!",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        message: "User doesn't exists!",
        success: false,
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    // console.log("resetPasstoken: ", user.resetPasswordToken);

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
      text: `Reset Password: 
      ${process.env.BASE_URL}/reactAuth/v1/resetpassword/${token}`,
      html: `<h2>Registration link</h2>
      <br>
      ${process.env.BASE_URL}/reactAuth/v1/resetpassword/${token}`,
    };
    await transport.sendMail(configOptions);
    res.status(200).send({
      message: "Reset password link is sent to the email!",
      success: true,
    });
  } catch (error) {
    return res.status(400).send({
      message: "Something went wrong. Please try again!",
      success: false,
      error,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token) {
      return res.status(400).send({
        message: "Invalid reset password link",
        success: false,
      });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    // console.log("resetPasstoken: ", user.resetPasswordToken);
    if (!user) {
      return res.status(400).send({
        message: "User doesn't exists!",
        success: false,
      });
    }

    user.password = password;
    await user.save();
    res.status(200).send({
      message: "Password reset successfull!",
      success: true,
    });
  } catch (error) {
    return res.status(400).send({
      message: "Reset password link is expired!",
      success: false,
      error,
    });
  }
};

export const getMeController = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.id });
    if (!user) {
      return res.status(400).send({
        message: "User doesn't exist! Please login first!",
        success: false,
      });
    }
    res.status(200).send({
      user,
      success: true,
    });
  } catch (error) {
    return res.status(401).send({
      message: "Please login!",
      success: false,
    });
  }
};

export const logoutController = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", " ", cookieOptions);
    res.status(200).send({
      message: "User logout successfull",
      success: true,
    })
  } catch (error) {
    return res.status(401).send({
      message: "Please login first!",
      success: false,
      error,
    })
  }
};
