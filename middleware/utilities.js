const userModel = require("../models/userModel");

const isAuthenticated = async (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.status(401).send("Unauthorized");
};

const findOrCreateUserInDatabase = async (githubProfile) => {
  // Check if the user already exists using GitHub ID
  const existingUser = await userModel.getByGithubId( githubProfile.id );

  if (existingUser) {
    return existingUser;
  }

  // If user does not exist, create a new one
  const newUser = {
    name: githubProfile.displayName || githubProfile.username,
    email: githubProfile.email || null, // GitHub may not provide an email
    role: "client", // Default role
    githubId: githubProfile.id,
    avatarUrl: githubProfile.avatar_url || null,
    registeredDate: new Date().toISOString(),
  };

  const result = await userModel.createUser(newUser);
  return result;
};

module.exports = {
  isAuthenticated,
  findOrCreateUserInDatabase
};
