const router = require('express').Router();

const accountRoute = require("./account.route");
const authRouter = require("./auth.route");

router.use("/account", accountRoute);

router.use("/auth", authRouter);

module.exports = router;