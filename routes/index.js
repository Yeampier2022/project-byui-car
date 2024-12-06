const utilities = require("../middleware/utilities");
const passport = require("passport");
const routes = require("express").Router();

//routes.use("/api-docs", require("./swagger"));

routes.use("/users", require("./users"));
routes.use("/cars", require("./cars"));
//routes.use("/orders", require("./orders"));
//routes.use("/squard-part", require("./squardPart"));

// Example home route
routes.get("/", (req, res) => {
  if (req.session.user) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.session.user.githubId,
        name: req.session.user.displayName,
        avatar: req.session.user.avatarUrl,
      },
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

routes.use("/protected-route", utilities.isAuthenticated, (req, res) => {
  res.send("This is a protected route.");
});

// GitHub OAuth callback route
routes.get("/github/callback", passport.authenticate("github", {
  failureRedirect: "/login-failed",
  session: true, // Use persistent sessions
}),
  (req, res) => {
    req.session.user = req.user; // Store user in session
    res.redirect("/"); // Redirect to the home page or dashboard
  }
);

routes.get("/login", passport.authenticate("github"), (req, res) => {});

routes.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Error destroying session:", destroyErr);
      }
      res.redirect("/");
    });
  });
});

module.exports = routes;
