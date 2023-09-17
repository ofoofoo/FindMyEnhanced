const express = require("express");
const auth = require("./auth");
const router = express.Router();
const socketManager = require("./server-socket");

const User = require("./models/user");
const Interaction = require("./models/interaction");

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

router.post("/add-interaction", (req, res) => {
  const userId = req.user?._id;
  // const userId = "6505f7a1ba168fcafd711316";
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

router.get("/fetch-user-interactions", async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).send({ msg: "User not logged in!" });
  }
  try {
    const interactions = await Interaction.find({ user: userId }, 'lat lng building timestamp -_id');
    res.status(200).json(interactions);
  } catch (err) {
    console.error("Failed to get interactions:", err);
    res.status(500).send({ msg: "Error fetching interactions:", err });
  }
});

router.get("/fetch-all-interactions", async (req, res) => {
  try {
    const interactions = await Interaction.find({});
    res.status(200).json(interactions);
  } catch (err) {
    console.error("Failed to get interactions:", err);
    res.status(500).send({ msg: "Error fetching interactions:", err });
  }
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
