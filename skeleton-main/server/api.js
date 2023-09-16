/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Interaction = require("./models/interaction");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

router.post("/addInteraction", (req, res) => {
  // const userId = req.user?._id;
  const userId = "6505f3a56b8f45d5500c9770";
  const type = "click";
  const { lat, lng, building } = req.body;

  if (!userId || lat == undefined || lng == undefined) {
    return res.status(400).send({ msg: "missing field(s)" });
  }

  const newInteraction = new Interaction({
    user: userId,
    lat,
    lng,
    building,
    timestamp: new Date(),
  });

  newInteraction.save((err, savedInteraction) => {
    if (err) {
      console.error("Failed to save interaction:", err);
      return res.status(500).send({ msg: "Error saving the interaction", err });
    }
    console.log("Successfully saved interaction:", savedInteraction);
    return res.status(200).send(savedInteraction);
  })
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
