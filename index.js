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

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);  // Pass the error to the error handler
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  const defaultMessages = {
    400: "Bad Request. Please check your input and try again.",
    401: "Unauthorized access. Please log in to proceed.",
    403: "Forbidden. You don't have permission to access this resource.",
    404: "The resource you're looking for does not exist.",
    500: "Oops! Something went wrong on our end. Please try again later.",
    422: "Unprocessable Entity. The request cannot be processed due to semantic errors."
  };

  const status = err.status || 500;  // Default to 500 if no status is set
  const message = defaultMessages[status] || "An unexpected error occurred. Please try again later.";
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  // Send JSON response with appropriate status and message
  res.status(status).json({
    status: status,
    message: message,
    error: err.message || "Unknown error"
  });
});

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
