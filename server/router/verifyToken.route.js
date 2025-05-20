const router = require('express').Router();

const authMiddleware = require("../middleware/auth.middleware");
const verifyController = require("../controller/home.controller");

router.post(
  "/", 
  authMiddleware.verifyToken,
  verifyController.check
);

module.exports = router;