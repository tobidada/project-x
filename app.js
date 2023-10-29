import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// const logger = require('morgan');
// const cron = require('node-cron');
import mongoose from "mongoose";

// const indexRouter = require('./routes/index');
import userRouter from "./routes/user.js";
import loanRouter from "./routes/loan.js";
import indexRouter from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000

app.use(bodyParser.json());
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-1.enbfrwj.mongodb.net/`,
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) =>
    console.log(`error connecting to the database: \n ${error}`),
  );

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/loan", loanRouter);
