const router = require('express').Router();

const accountRoute = require("./account.route");
const authRouter = require("./auth.route");
const trashRouter = require("./trash.route");
const canRouter = require("./can.route");

router.use("/account", accountRoute);

router.use("/auth", authRouter);

router.use("/trash", trashRouter)

router.use("/can", canRouter)

module.exports = router;