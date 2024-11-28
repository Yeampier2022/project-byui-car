const express = require("express");
const mongodb = require("./database/database");
const bodyParser = require("body-parser");
const app = express();
const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const cors = require("cors");

const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  
    next();
  });

mongodb.initDb((err, db) => {
    if (err) {
      console.log(err);
      process.exit(1);
    } else {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    }
  });