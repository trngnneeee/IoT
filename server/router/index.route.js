const router = require('express').Router();

const accountRoute = require("./account.route");
const authRouter = require("./auth.route");
const trashRouter = require("./trash.route");

router.use("/account", accountRoute);

router.use("/auth", authRouter);

router.use("/trash", trashRouter)

module.exports = router;