const router = require('express').Router();

const accountController = require("../controller/account.controller");
const accountValidate = require("../validate/account.validate");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/register", 
  accountValidate.registerPost,
  accountController.registerPost
);

router.post(
  "/login",
  accountValidate.loginPost,
  accountController.loginPost
)

router.post(
  "/forgot-password",
  accountValidate.forgotPasswordPost,
  accountController.forgotPasswordPost
)

router.post(
  "/otp-password",
  accountValidate.otpPasswordPost,
  accountController.otpPasswordPost
)

router.post(
  "/reset-password",
  authMiddleware.verifyToken,
  accountValidate.resetPasswordPost,
  accountController.resetPasswordPost
)

router.post(
  "/logout",
  accountController.logoutPost
)

module.exports = router;