const router = require('express').Router();

const accountController = require("../controller/account.controller");
const authMiddleware = require("../middleware/auth.middleware");

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

router.post(
  "/otp-password",
  accountController.otpPasswordPost
)

router.post(
  "/reset-password",
  authMiddleware.verifyToken,
  accountController.resetPasswordPost
)

module.exports = router;