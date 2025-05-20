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

router.post(
  "/forgot-password",
  accountController.forgotPasswordPost
)

module.exports = router;