const router = require('express').Router();

const accountRoute = require("./account.route");
const homeRoute = require("./home.route");

router.use("/account", accountRoute);
router.use("/home", homeRoute);

module.exports = router;