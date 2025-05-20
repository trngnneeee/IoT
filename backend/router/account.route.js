const router = require('express').Router();

const accountController = require("../controller/account.controller");

router.post(
  "/register", 
  accountController.registerPost
);

router.post(
  "/login",
  accountController.loginPost
)

module.exports = router;