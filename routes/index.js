const utilities = require("../middleware/utilities");
const passport = require("passport");
const routes = require("express").Router();

//routes.use("/api-docs", require("./swagger"));

routes.use("/users", require("./users"));
routes.use("/cars", require("./cars"));
routes.use("/orders", require("./orders"));
routes.use("/spare-parts", require("./sparePart"));
routes.use("/api-docs", require("./swagger"))

// Example home route
routes.get("/", (req, res) => {
  if (req.session.user) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.session.user._id,
        githubId: req.session.user.githubId,
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

routes.use("/login-failed", (req, res) => {
  res.send("Login failed.");
});


// GitHub OAuth callback route
routes.get("/github/callback", passport.authenticate("github", {
  failureRedirect: "/login-failed",
  session: true, // Ensure session is being used here
}),
(req, res) => {
  req.session.user = req.user; // Store the user object in session
  res.redirect("/");
});

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
      res.redirect("/"); // Redirect after logout
    });
  });
});

if (process.env.NODE_ENV === 'test') {
  routes.post("/test-login", (req, res) => {
      req.session.user = req.body; // Set user session data from request body
      res.status(200).send("Session set for testing");
  });
}

module.exports = routes;
