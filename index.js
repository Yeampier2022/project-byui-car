const { app, connectToDatabase } = require("./app"); // Import app from app.js

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDatabase(); // Ensure DB connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();
