const router = require('express').Router();

const accountRoute = require("./account.route");
const verifyTokenRoute = require("./verifyToken.route");

router.use("/account", accountRoute);
router.use("/verifyToken", verifyTokenRoute);

module.exports = router;