import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "../middlewares.js";

const ONE_DAY = 24 * 60 * 60;

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: ONE_DAY,
  });
};

const userRouter = express.Router();

/* GET users listing. */
userRouter.get("/all", isAuthenticated, (req, res) => {
  res.send("respond with a resource");
});

/**
 * @openapi
 * '/user/register':
 *  post:
 *    tags:
 *      - User
 *    summary: Register a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                description: A valid email address in needed
 *                default: johndoe@email.com
 *              password:
 *                type: any
 *                description: minimum of 6 characters
 *                default: newpassword
 *    responses:
 *      201:
 *        description: User Registered successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                email:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *                createdAt:
 *                  type: string
 *      400:
 *        description: Error registering user
 *
 */
userRouter.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const { _id, email: userEmail, isActive, createdAt } = user;

    const jwt = generateToken(_id, email);
    res.cookie("auth_token", jwt, {
      httpOnly: true,
      maxAge: ONE_DAY * 1000,
    });

    res.status(201).json({
      id: _id,
      email: userEmail,
      isActive,
      createdAt,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message || "error registering user");
  }
});

/**
 * @openapi
 * '/user/auth':
 *  post:
 *    tags:
 *      - User
 *    summary: Authenticate a user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                description: A valid email address in needed
 *                default: johndoe@email.com
 *              password:
 *                type: any
 *                description: minimum of 6 characters
 *                default: newpassword
 *    responses:
 *      200:
 *        description: User Authenticated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                email:
 *                  type: string
 *                isActive:
 *                  type: boolean
 *                createdAt:
 *                  type: string
 *                modifiedAt:
 *                  type: string
 *      401:
 *        description: User Authentication Failed
 *      404:
 *        description: User Not Found
 *
 */
userRouter.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (user) {
      const isAuthenticated = await bcrypt.compare(password, user.password);
      if (isAuthenticated) {
        const { _id, email: userEmail, isActive, createdAt, modifiedAt } = user;
        const jwt = generateToken(_id, email);
        res.cookie("auth_token", jwt, {
          httpOnly: true,
          maxAge: ONE_DAY * 1000,
        });

        return res.status(200).json({
          id: _id,
          email: userEmail,
          isActive,
          createdAt,
          modifiedAt,
        });
      }
      res.status(401).send("User Authentication Failed");
    } else {
      res.status(404).send("User Not Found");
    }
  } catch (err) {
    res.status(401).send(err.message || "User Authentication Failed");
  }
});

/**
 * @openapi
 * '/user/logout':
 *  get:
 *    tags:
 *      - User
 *    summary: Logout a user
 *    responses:
 *      200:
 *        description: User Logged Out
 *
 */
userRouter.get("/logout", async (req, res) => {
  res.cookie("auth_token", "", { maxAge: 1 });
  res.status(200).send("User Logged Out");
});

export default userRouter;
