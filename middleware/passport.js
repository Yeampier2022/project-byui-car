const GitHubStrategy = require("passport-github2").Strategy;
const { findOrCreateUserInDatabase } = require("../middleware/utilities");
const userModel = require("../models/userModel");

module.exports = function (passport) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUserInDatabase({
            id: profile.id,
            displayName: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || null, // Use null if no email is provided
            avatar_url: profile.photos?.[0]?.value || null, // GitHub avatar URL
          });
          return done(null, user);
        } catch (error) {
          console.error("Error during GitHub authentication:", error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    const user = await userModel.getUserById(id); // Fetch user by ID
    done(null, user);
  });
};
