const routes = require("express").Router();
routes.get("/", (req, res) => {
  res.send("Hello World");
});

//routes.use("/api-doc", require("./swagger"));

routes.use("/clients", require("./clients"));
routes.use("/cars", require("./cars"));
routes.use("/orders", require("./orders"));
routes.use("/squard-part", require("./squardPart"));

routes.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    req.session.destroy();
    res.redirect("/");
  });
});

module.exports = routes;
