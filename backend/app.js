// backend/app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./db/connect");
const notfound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
require("dotenv").config({ path: __dirname + "/../.env" });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 404 & error handlers (after routes)
app.use(notfound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
