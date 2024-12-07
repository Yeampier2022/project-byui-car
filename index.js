// Import core dependencies
const express = require("express");
const session = require("express-session");
const dotenv = require('dotenv');
const cors = require("cors");
const passport = require("passport");
const mongodb = require("./database/database");
const MongoStore = require('connect-mongo');
const routes = require("./routes");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

// Express session configuration
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60, // Session expiration in seconds
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days (matches the `ttl` above)
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());  // Persistent login sessions

// Passport configuration
require('./middleware/passport')(passport);  // Import from separate file

// Route handling
app.use("/", routes);

// Start the database and server
mongodb.initDb((err, db) => {
  if (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  } else {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
});
